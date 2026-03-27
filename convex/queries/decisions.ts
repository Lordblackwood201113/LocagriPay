import { query } from "../_generated/server";
import { v } from "convex/values";

export const listByAgent = query({
  args: { agentId: v.id("users") },
  handler: async (ctx, args) => {
    const decisions = await ctx.db
      .query("decisions")
      .withIndex("by_agent", (q: any) => q.eq("agentId", args.agentId))
      .order("desc")
      .collect();

    const enriched = await Promise.all(
      decisions.map(async (d) => {
        const collection = await ctx.db.get(d.collectionId);
        let supplierName = "Inconnu";
        let technicianName = "Inconnu";

        if (collection) {
          const technician = await ctx.db.get(collection.technicianId);
          technicianName = technician?.name ?? "Inconnu";

          if (collection.supplierType === "individual") {
            const producer = await ctx.db.get(collection.supplierId as any);
            if (producer) supplierName = (producer as any).name;
          } else {
            const cooperative = await ctx.db.get(collection.supplierId as any);
            if (cooperative) supplierName = (cooperative as any).name;
          }
        }

        return {
          ...d,
          technicianName,
          supplierName,
          collectionStatus: collection?.status ?? "inconnu",
          estimatedStockKg: collection?.estimatedStockKg ?? 0,
        };
      }),
    );

    return enriched;
  },
});
