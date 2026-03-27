import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { requireRole } from "../lib/auth";

export const validate = mutation({
  args: {
    collectionId: v.id("collections"),
    decisionId: v.id("decisions"),
    validation: v.union(v.literal("approuve"), v.literal("rejete")),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, "direction");

    const collection = await ctx.db.get(args.collectionId);
    if (!collection) throw new ConvexError("Collecte non trouvée");

    if (collection.status !== "en_attente_direction") {
      throw new ConvexError("Cette collecte n'est pas en attente de validation direction");
    }

    if (args.validation === "rejete" && !args.comment?.trim()) {
      throw new ConvexError("Un commentaire est obligatoire pour un rejet");
    }

    const now = Date.now();

    const id = await ctx.db.insert("directionValidations", {
      collectionId: args.collectionId,
      decisionId: args.decisionId,
      directorId: user._id,
      validation: args.validation,
      comment: args.comment?.trim(),
      createdAt: now,
    });

    if (args.validation === "approuve") {
      // Get the decision to read price/weight
      const decision = await ctx.db.get(args.decisionId);
      if (!decision) throw new ConvexError("Décision non trouvée");

      // Create payments based on supplier type
      if (collection.supplierType === "individual") {
        // Single payment to the individual producer
        const producer = await ctx.db.get(collection.supplierId as any);
        if (producer) {
          await ctx.db.insert("payments", {
            collectionId: args.collectionId,
            beneficiaryId: producer._id as any,
            beneficiaryName: (producer as any).name,
            operator: (producer as any).mobileMoneyOperator,
            mobileMoneyNumber: (producer as any).mobileMoneyNumber,
            amount: decision.totalAmount ?? 0,
            supplierType: "individual",
            payRepresentative: false,
            status: "en_attente",
            createdAt: now,
            updatedAt: now,
          });
        }
      } else {
        // Cooperative
        if (collection.payRepresentative) {
          // Single payment to the representative
          const cooperative = await ctx.db.get(collection.supplierId as any);
          if (cooperative && (cooperative as any).representativeId) {
            const representative = await ctx.db.get((cooperative as any).representativeId);
            if (representative) {
              await ctx.db.insert("payments", {
                collectionId: args.collectionId,
                beneficiaryId: representative._id as any,
                beneficiaryName: (representative as any).name,
                operator: (representative as any).mobileMoneyOperator,
                mobileMoneyNumber: (representative as any).mobileMoneyNumber,
                amount: decision.totalAmount ?? 0,
                supplierType: "cooperative",
                payRepresentative: true,
                status: "en_attente",
                createdAt: now,
                updatedAt: now,
              });
            }
          }
        } else {
          // Individual payment per member — proportional to stock
          const members = await ctx.db
            .query("producers")
            .withIndex("by_cooperative", (q: any) =>
              q.eq("cooperativeId", collection.supplierId as any),
            )
            .collect();

          const allocations = collection.memberAllocations as { memberId: any; memberName: string; stockKg: number }[] | undefined;
          const pricePerKg = decision.pricePerKg ?? 0;

          if (allocations && allocations.length > 0) {
            // Proportional payment based on each member's stock
            for (const allocation of allocations) {
              const member = members.find((m) => m._id === allocation.memberId);
              if (!member || allocation.stockKg <= 0) continue;

              await ctx.db.insert("payments", {
                collectionId: args.collectionId,
                beneficiaryId: member._id,
                beneficiaryName: member.name,
                operator: member.mobileMoneyOperator,
                mobileMoneyNumber: member.mobileMoneyNumber,
                amount: Math.round(allocation.stockKg * pricePerKg),
                supplierType: "cooperative",
                payRepresentative: false,
                status: "en_attente",
                createdAt: now,
                updatedAt: now,
              });
            }
          } else {
            // Fallback: equal split (for older collections without allocations)
            const perMemberAmount =
              members.length > 0 ? (decision.totalAmount ?? 0) / members.length : 0;

            for (const member of members) {
              await ctx.db.insert("payments", {
                collectionId: args.collectionId,
                beneficiaryId: member._id,
                beneficiaryName: member.name,
                operator: member.mobileMoneyOperator,
                mobileMoneyNumber: member.mobileMoneyNumber,
                amount: Math.round(perMemberAmount),
                supplierType: "cooperative",
                payRepresentative: false,
                status: "en_attente",
                createdAt: now,
                updatedAt: now,
              });
            }
          }
        }
      }

      // Transition to en_paiement
      await ctx.db.patch(args.collectionId, {
        status: "en_paiement",
        updatedAt: now,
      });
    } else {
      await ctx.db.patch(args.collectionId, {
        status: "en_validation",
        updatedAt: now,
      });
    }

    // Audit log
    await ctx.db.insert("auditLogs", {
      entityType: "validation",
      entityId: id,
      action: `direction:${args.validation}`,
      userId: user._id,
      details: args.comment?.trim(),
      createdAt: now,
    });

    return id;
  },
});
