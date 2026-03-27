import { query } from "../_generated/server";
import { v } from "convex/values";
import { paymentStatusValidator } from "../schema";

export const listByStatus = query({
  args: {
    status: v.optional(paymentStatusValidator),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("payments")
        .withIndex("by_status", (q: any) => q.eq("status", args.status))
        .collect();
    }
    return await ctx.db.query("payments").order("desc").collect();
  },
});

export const listByCollection = query({
  args: { collectionId: v.id("collections") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_collection", (q: any) => q.eq("collectionId", args.collectionId))
      .collect();
  },
});
