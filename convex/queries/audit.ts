import { query } from "../_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_date")
      .order("desc")
      .take(args.limit ?? 100);

    const enriched = await Promise.all(
      logs.map(async (log) => {
        const user = await ctx.db.get(log.userId);
        return {
          ...log,
          userName: user?.name ?? "Inconnu",
        };
      }),
    );

    return enriched;
  },
});

export const byEntity = query({
  args: {
    entityType: v.string(),
    entityId: v.string(),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_entity", (q: any) =>
        q.eq("entityType", args.entityType).eq("entityId", args.entityId),
      )
      .collect();

    const enriched = await Promise.all(
      logs.map(async (log) => {
        const user = await ctx.db.get(log.userId);
        return { ...log, userName: user?.name ?? "Inconnu" };
      }),
    );

    return enriched.sort((a, b) => b.createdAt - a.createdAt);
  },
});
