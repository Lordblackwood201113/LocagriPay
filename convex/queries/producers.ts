import { query } from "../_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    cooperativeId: v.optional(v.id("cooperatives")),
  },
  handler: async (ctx, args) => {
    if (args.cooperativeId) {
      return await ctx.db
        .query("producers")
        .withIndex("by_cooperative", (q: any) => q.eq("cooperativeId", args.cooperativeId))
        .collect();
    }
    return await ctx.db.query("producers").collect();
  },
});

export const search = query({
  args: {
    term: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.term || args.term.length < 2) return [];
    return await ctx.db
      .query("producers")
      .withSearchIndex("search_name", (q: any) => q.search("name", args.term))
      .take(20);
  },
});

export const getById = query({
  args: { id: v.id("producers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
