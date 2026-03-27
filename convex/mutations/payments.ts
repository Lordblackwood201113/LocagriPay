import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { requireRole } from "../lib/auth";
import { paymentStatusValidator } from "../schema";
import { PAYMENT_TRANSITIONS } from "../lib/stateMachine";
import type { PaymentStatus } from "../lib/stateMachine";

export const updateStatus = mutation({
  args: {
    paymentId: v.id("payments"),
    newStatus: paymentStatusValidator,
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, "admin", "agent_bureau");

    const payment = await ctx.db.get(args.paymentId);
    if (!payment) throw new ConvexError("Paiement non trouvé");

    const currentStatus = payment.status as PaymentStatus;
    const newStatus = args.newStatus as PaymentStatus;

    const allowed = PAYMENT_TRANSITIONS[currentStatus];
    if (!allowed?.includes(newStatus)) {
      throw new ConvexError(`Transition ${currentStatus} → ${newStatus} non autorisée`);
    }

    const now = Date.now();
    await ctx.db.patch(args.paymentId, { status: newStatus, updatedAt: now });

    // Audit log
    await ctx.db.insert("auditLogs", {
      entityType: "payment",
      entityId: args.paymentId,
      action: `status:${currentStatus}→${newStatus}`,
      userId: user._id,
      createdAt: now,
    });

    // If all payments for the collection are confirmed, mark collection as payé
    if (newStatus === "confirme") {
      const allPayments = await ctx.db
        .query("payments")
        .withIndex("by_collection", (q: any) => q.eq("collectionId", payment.collectionId))
        .collect();

      const allConfirmed = allPayments.every((p) => p.status === "confirme" || p._id === args.paymentId);
      if (allConfirmed) {
        await ctx.db.patch(payment.collectionId, { status: "paye", updatedAt: now });
        await ctx.db.insert("auditLogs", {
          entityType: "collection",
          entityId: payment.collectionId,
          action: "status:en_paiement→paye",
          userId: user._id,
          details: "Tous les paiements confirmés",
          createdAt: now,
        });
      }
    }

    return { success: true };
  },
});

export const batchUpdateStatus = mutation({
  args: {
    paymentIds: v.array(v.id("payments")),
    newStatus: paymentStatusValidator,
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, "admin");
    const now = Date.now();

    for (const paymentId of args.paymentIds) {
      const payment = await ctx.db.get(paymentId);
      if (!payment) continue;

      const currentStatus = payment.status as PaymentStatus;
      const allowed = PAYMENT_TRANSITIONS[currentStatus];
      if (!allowed?.includes(args.newStatus as PaymentStatus)) continue;

      await ctx.db.patch(paymentId, { status: args.newStatus, updatedAt: now });

      await ctx.db.insert("auditLogs", {
        entityType: "payment",
        entityId: paymentId,
        action: `status:${currentStatus}→${args.newStatus}`,
        userId: user._id,
        details: "Batch update",
        createdAt: now,
      });
    }

    return { success: true, count: args.paymentIds.length };
  },
});
