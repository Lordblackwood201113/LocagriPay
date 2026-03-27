import { query } from "../_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("cooperatives").collect();
  },
});

export const search = query({
  args: {
    term: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.term || args.term.length < 2) return [];
    return await ctx.db
      .query("cooperatives")
      .withSearchIndex("search_name", (q: any) => q.search("name", args.term))
      .take(20);
  },
});

export const getById = query({
  args: { id: v.id("cooperatives") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getWithMembers = query({
  args: { id: v.id("cooperatives") },
  handler: async (ctx, args) => {
    const cooperative = await ctx.db.get(args.id);
    if (!cooperative) return null;

    const members = await ctx.db
      .query("producers")
      .withIndex("by_cooperative", (q: any) => q.eq("cooperativeId", args.id))
      .collect();

    return { ...cooperative, members };
  },
});
