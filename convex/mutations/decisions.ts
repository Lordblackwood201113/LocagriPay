import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { requireRole } from "../lib/auth";

export const create = mutation({
  args: {
    collectionId: v.id("collections"),
    qualityAssessmentId: v.id("qualityAssessments"),
    decision: v.union(v.literal("accepte"), v.literal("refuse"), v.literal("negocie")),
    pricePerKg: v.optional(v.float64()),
    finalWeightKg: v.optional(v.float64()),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, "agent_bureau");

    const collection = await ctx.db.get(args.collectionId);
    if (!collection) throw new ConvexError("Collecte non trouvée");

    if (collection.status !== "en_validation" && collection.status !== "soumis") {
      throw new ConvexError("Cette collecte ne peut pas recevoir de décision dans son état actuel");
    }

    // Validate: if accepted, price and weight are required
    if (args.decision === "accepte") {
      if (!args.pricePerKg || args.pricePerKg <= 0) {
        throw new ConvexError("Le prix (FCFA/KG) est obligatoire pour une acceptation");
      }
      if (!args.finalWeightKg || args.finalWeightKg <= 0) {
        throw new ConvexError("Le poids final (KG) est obligatoire pour une acceptation");
      }
    }

    // Validate: if refused or negotiated, comment is required
    if ((args.decision === "refuse" || args.decision === "negocie") && !args.comment?.trim()) {
      throw new ConvexError("Un commentaire est obligatoire pour un refus ou une négociation");
    }

    const totalAmount =
      args.decision === "accepte" && args.pricePerKg && args.finalWeightKg
        ? args.pricePerKg * args.finalWeightKg
        : undefined;

    const now = Date.now();

    const id = await ctx.db.insert("decisions", {
      collectionId: args.collectionId,
      agentId: user._id,
      qualityAssessmentId: args.qualityAssessmentId,
      decision: args.decision,
      pricePerKg: args.pricePerKg,
      finalWeightKg: args.finalWeightKg,
      totalAmount,
      comment: args.comment?.trim(),
      createdAt: now,
    });

    // Update collection status based on decision
    let newStatus: string;
    if (args.decision === "accepte") {
      newStatus = "en_attente_direction";
    } else if (args.decision === "refuse") {
      newStatus = "refuse";
    } else {
      // negocie → back to soumis for technician to re-submit
      newStatus = "soumis";
    }

    await ctx.db.patch(args.collectionId, {
      status: newStatus as any,
      updatedAt: now,
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      entityType: "decision",
      entityId: id,
      action: `decision:${args.decision}`,
      userId: user._id,
      details: args.comment?.trim(),
      createdAt: now,
    });

    return id;
  },
});
