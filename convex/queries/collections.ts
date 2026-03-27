import { query } from "../_generated/server";
import { v } from "convex/values";
import { collectionStatusValidator } from "../schema";

export const listByStatus = query({
  args: {
    status: collectionStatusValidator,
  },
  handler: async (ctx, args) => {
    const collections = await ctx.db
      .query("collections")
      .withIndex("by_status", (q: any) => q.eq("status", args.status))
      .collect();

    // Enrich with technician and supplier names
    const enriched = await Promise.all(
      collections.map(async (c) => {
        const technician = await ctx.db.get(c.technicianId);
        let supplierName = "Inconnu";
        if (c.supplierType === "individual") {
          const producer = await ctx.db.get(c.supplierId as any);
          if (producer) supplierName = (producer as any).name;
        } else {
          const cooperative = await ctx.db.get(c.supplierId as any);
          if (cooperative) supplierName = (cooperative as any).name;
        }
        return {
          ...c,
          technicianName: technician?.name ?? "Inconnu",
          supplierName,
        };
      }),
    );

    return enriched;
  },
});

export const listByTechnician = query({
  args: {
    technicianId: v.id("users"),
    campaignId: v.optional(v.id("campaigns")),
  },
  handler: async (ctx, args) => {
    if (args.campaignId) {
      return await ctx.db
        .query("collections")
        .withIndex("by_technician_campaign", (q: any) =>
          q.eq("technicianId", args.technicianId).eq("campaignId", args.campaignId),
        )
        .collect();
    }
    return await ctx.db
      .query("collections")
      .withIndex("by_technician", (q: any) => q.eq("technicianId", args.technicianId))
      .collect();
  },
});

export const getDetail = query({
  args: { id: v.id("collections") },
  handler: async (ctx, args) => {
    const collection = await ctx.db.get(args.id);
    if (!collection) return null;

    const technician = await ctx.db.get(collection.technicianId);

    let supplierName = "Inconnu";
    let supplierData = null;
    if (collection.supplierType === "individual") {
      const producer = await ctx.db.get(collection.supplierId as any);
      if (producer) {
        supplierName = (producer as any).name;
        supplierData = producer;
      }
    } else {
      const cooperative = await ctx.db.get(collection.supplierId as any);
      if (cooperative) {
        supplierName = (cooperative as any).name;
        const members = await ctx.db
          .query("producers")
          .withIndex("by_cooperative", (q: any) => q.eq("cooperativeId", cooperative._id))
          .collect();
        supplierData = { ...cooperative, members };
      }
    }

    // Get quality assessment if exists
    const quality = await ctx.db
      .query("qualityAssessments")
      .withIndex("by_collection", (q: any) => q.eq("collectionId", args.id))
      .unique();

    // Get decision if exists
    const decision = await ctx.db
      .query("decisions")
      .withIndex("by_collection", (q: any) => q.eq("collectionId", args.id))
      .unique();

    // Get direction validation if exists
    const directionValidation = await ctx.db
      .query("directionValidations")
      .withIndex("by_collection", (q: any) => q.eq("collectionId", args.id))
      .unique();

    return {
      ...collection,
      technicianName: technician?.name ?? "Inconnu",
      supplierName,
      supplierData,
      quality,
      decision,
      directionValidation,
    };
  },
});

export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const take = args.limit ?? 20;
    const collections = await ctx.db
      .query("collections")
      .order("desc")
      .take(take);

    const enriched = await Promise.all(
      collections.map(async (c) => {
        const technician = await ctx.db.get(c.technicianId);
        let supplierName = "Inconnu";
        if (c.supplierType === "individual") {
          const producer = await ctx.db.get(c.supplierId as any);
          if (producer) supplierName = (producer as any).name;
        } else {
          const cooperative = await ctx.db.get(c.supplierId as any);
          if (cooperative) supplierName = (cooperative as any).name;
        }
        return {
          ...c,
          technicianName: technician?.name ?? "Inconnu",
          supplierName,
        };
      }),
    );

    return enriched;
  },
});

export const countByStatus = query({
  args: { status: collectionStatusValidator },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("collections")
      .withIndex("by_status", (q: any) => q.eq("status", args.status))
      .collect();
    return results.length;
  },
});
