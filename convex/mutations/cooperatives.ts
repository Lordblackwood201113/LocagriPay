import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { getCurrentUser } from "../lib/auth";
import { mobileMoneyOperatorValidator } from "../schema";

export const create = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const now = Date.now();

    const id = await ctx.db.insert("cooperatives", {
      name: args.name.trim(),
      phone: args.phone.trim(),
      location: args.location?.trim() || undefined,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("cooperatives"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
    representativeId: v.optional(v.id("producers")),
  },
  handler: async (ctx, args) => {
    await getCurrentUser(ctx);
    const { id, ...updates } = args;

    const filtered: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) filtered[key] = value;
    }

    await ctx.db.patch(id, filtered);
    return { success: true };
  },
});

export const addMember = mutation({
  args: {
    cooperativeId: v.id("cooperatives"),
    name: v.string(),
    phone: v.string(),
    location: v.optional(v.string()),
    mobileMoneyOperator: mobileMoneyOperatorValidator,
    mobileMoneyNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const cooperative = await ctx.db.get(args.cooperativeId);
    if (!cooperative) throw new ConvexError("Coopérative non trouvée");

    const now = Date.now();
    const producerId = await ctx.db.insert("producers", {
      name: args.name.trim(),
      phone: args.phone.trim(),
      location: args.location?.trim() || undefined,
      mobileMoneyOperator: args.mobileMoneyOperator,
      mobileMoneyNumber: args.mobileMoneyNumber.trim(),
      cooperativeId: args.cooperativeId,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    });

    return producerId;
  },
});

export const removeMember = mutation({
  args: {
    producerId: v.id("producers"),
    cooperativeId: v.id("cooperatives"),
  },
  handler: async (ctx, args) => {
    await getCurrentUser(ctx);
    const producer = await ctx.db.get(args.producerId);
    if (!producer) throw new ConvexError("Producteur non trouvé");

    // If this producer is the representative, clear the reference
    const cooperative = await ctx.db.get(args.cooperativeId);
    if (cooperative?.representativeId === args.producerId) {
      await ctx.db.patch(args.cooperativeId, {
        representativeId: undefined,
        updatedAt: Date.now(),
      });
    }

    // Remove cooperative link (don't delete the producer, just unlink)
    await ctx.db.patch(args.producerId, {
      cooperativeId: undefined,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const setRepresentative = mutation({
  args: {
    cooperativeId: v.id("cooperatives"),
    producerId: v.id("producers"),
  },
  handler: async (ctx, args) => {
    await getCurrentUser(ctx);

    const producer = await ctx.db.get(args.producerId);
    if (!producer || producer.cooperativeId !== args.cooperativeId) {
      throw new ConvexError("Ce producteur n'est pas membre de cette coopérative");
    }

    await ctx.db.patch(args.cooperativeId, {
      representativeId: args.producerId,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
