import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "../lib/auth";
import { mobileMoneyOperatorValidator } from "../schema";

export const create = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    location: v.optional(v.string()),
    mobileMoneyOperator: mobileMoneyOperatorValidator,
    mobileMoneyNumber: v.string(),
    cooperativeId: v.optional(v.id("cooperatives")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const now = Date.now();

    const id = await ctx.db.insert("producers", {
      ...args,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("producers"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
    mobileMoneyOperator: v.optional(mobileMoneyOperatorValidator),
    mobileMoneyNumber: v.optional(v.string()),
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
