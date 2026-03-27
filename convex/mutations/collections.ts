import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { getCurrentUser } from "../lib/auth";
import { validateTransition } from "../lib/stateMachine";
import type { CollectionStatus } from "../lib/stateMachine";
import { collectionStatusValidator } from "../schema";
import { calculateGlobalScore, validateScores } from "../lib/scoring";

export const create = mutation({
  args: {
    date: v.string(),
    supplierId: v.string(),
    supplierType: v.union(v.literal("individual"), v.literal("cooperative")),
    location: v.optional(v.string()),
    gpsLat: v.optional(v.float64()),
    gpsLng: v.optional(v.float64()),
    bagsInStock: v.number(),
    estimatedStockKg: v.number(),
    bagsSampled: v.number(),
    photoIds: v.array(v.string()),
    payRepresentative: v.optional(v.boolean()),
    memberAllocations: v.optional(v.array(v.object({
      memberId: v.id("producers"),
      memberName: v.string(),
      stockKg: v.number(),
    }))),
    // Quality assessment (filled by technician)
    visualAspect: v.number(),
    humidity: v.number(),
    homogeneity: v.number(),
    cleanliness: v.number(),
    husking: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    // Get active campaign
    const activeCampaign = await ctx.db
      .query("campaigns")
      .withIndex("by_status", (q: any) => q.eq("status", "active"))
      .unique();

    if (!activeCampaign) {
      throw new ConvexError("Aucune campagne active. Contactez l'administrateur.");
    }

    // Validate quality scores
    const validationError = validateScores({
      visualAspect: args.visualAspect,
      humidity: args.humidity,
      homogeneity: args.homogeneity,
      cleanliness: args.cleanliness,
      husking: args.husking,
    });
    if (validationError) throw new ConvexError(validationError);

    const globalScore = calculateGlobalScore({
      visualAspect: args.visualAspect,
      humidity: args.humidity,
      homogeneity: args.homogeneity,
      cleanliness: args.cleanliness,
      husking: args.husking,
    });

    const now = Date.now();

    const id = await ctx.db.insert("collections", {
      campaignId: activeCampaign._id,
      technicianId: user._id,
      supplierId: args.supplierId,
      supplierType: args.supplierType,
      location: args.location,
      gpsLat: args.gpsLat,
      gpsLng: args.gpsLng,
      bagsInStock: args.bagsInStock,
      estimatedStockKg: args.estimatedStockKg,
      bagsSampled: args.bagsSampled,
      photoIds: args.photoIds,
      payRepresentative: args.payRepresentative,
      memberAllocations: args.memberAllocations,
      status: "soumis",
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    // Create quality assessment (by technician)
    await ctx.db.insert("qualityAssessments", {
      collectionId: id,
      agentId: user._id, // technician who assessed
      visualAspect: args.visualAspect,
      humidity: args.humidity,
      homogeneity: args.homogeneity,
      cleanliness: args.cleanliness,
      husking: args.husking,
      globalScore,
      createdAt: now,
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      entityType: "collection",
      entityId: id,
      action: "created:soumis",
      userId: user._id,
      createdAt: now,
    });

    return id;
  },
});

export const transition = mutation({
  args: {
    collectionId: v.id("collections"),
    newStatus: collectionStatusValidator,
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const collection = await ctx.db.get(args.collectionId);

    if (!collection) {
      throw new ConvexError("Collecte non trouvée");
    }

    const currentStatus = collection.status as CollectionStatus;
    const newStatus = args.newStatus as CollectionStatus;

    const error = validateTransition(currentStatus, newStatus, user.role);
    if (error) {
      throw new ConvexError(error);
    }

    await ctx.db.patch(args.collectionId, {
      status: args.newStatus,
      updatedAt: Date.now(),
      ...(args.newStatus === "soumis" ? { submittedAt: Date.now() } : {}),
    });

    await ctx.db.insert("auditLogs", {
      entityType: "collection",
      entityId: args.collectionId,
      action: `status:${currentStatus}→${newStatus}`,
      userId: user._id,
      details: args.comment,
      createdAt: Date.now(),
    });

    return { success: true, from: currentStatus, to: newStatus };
  },
});

export const cancel = mutation({
  args: {
    collectionId: v.id("collections"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    // Only admin and direction can cancel
    if (user.role !== "admin" && user.role !== "direction") {
      throw new ConvexError("Seuls admin et direction peuvent annuler une collecte");
    }

    if (!args.reason.trim()) {
      throw new ConvexError("Le motif d'annulation est obligatoire");
    }

    const collection = await ctx.db.get(args.collectionId);
    if (!collection) throw new ConvexError("Collecte non trouvée");

    // Can only cancel from valide or en_paiement
    if (collection.status !== "valide" && collection.status !== "en_paiement") {
      throw new ConvexError(
        `Impossible d'annuler une collecte au statut "${collection.status}". Seules les collectes validées ou en paiement peuvent être annulées.`,
      );
    }

    const now = Date.now();

    // Auto-cancel associated payments that are not yet confirmed
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_collection", (q: any) => q.eq("collectionId", args.collectionId))
      .collect();

    let hasConfirmedPayment = false;
    for (const payment of payments) {
      if (payment.status === "confirme") {
        hasConfirmedPayment = true;
      } else if (payment.status !== "annule") {
        await ctx.db.patch(payment._id, { status: "annule", updatedAt: now });
        await ctx.db.insert("auditLogs", {
          entityType: "payment",
          entityId: payment._id,
          action: `status:${payment.status}→annule`,
          userId: user._id,
          details: "Annulation automatique suite à annulation de collecte",
          createdAt: now,
        });
      }
    }

    // Update collection status
    await ctx.db.patch(args.collectionId, {
      status: "annule",
      updatedAt: now,
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      entityType: "collection",
      entityId: args.collectionId,
      action: `status:${collection.status}→annule`,
      userId: user._id,
      details: args.reason.trim(),
      createdAt: now,
    });

    return { success: true, hasConfirmedPayment };
  },
});
