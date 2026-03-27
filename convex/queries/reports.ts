import { query } from "../_generated/server";
import { v } from "convex/values";

export const financialReport = query({
  args: { campaignId: v.optional(v.id("campaigns")) },
  handler: async (ctx, args) => {
    const payments = await ctx.db.query("payments").collect();

    // Filter by campaign if specified
    let filteredPayments = payments;
    if (args.campaignId) {
      const campaignCollections = await ctx.db
        .query("collections")
        .withIndex("by_campaign", (q: any) => q.eq("campaignId", args.campaignId))
        .collect();
      const collectionIds = new Set(campaignCollections.map((c) => c._id));
      filteredPayments = payments.filter((p) => collectionIds.has(p.collectionId));
    }

    const totalPaid = filteredPayments
      .filter((p) => p.status === "confirme")
      .reduce((s, p) => s + p.amount, 0);

    const totalPending = filteredPayments
      .filter((p) => p.status === "en_attente" || p.status === "initie")
      .reduce((s, p) => s + p.amount, 0);

    const byOperator = {
      wave: {
        count: filteredPayments.filter((p) => p.operator === "wave").length,
        amount: filteredPayments.filter((p) => p.operator === "wave").reduce((s, p) => s + p.amount, 0),
      },
      orange_money: {
        count: filteredPayments.filter((p) => p.operator === "orange_money").length,
        amount: filteredPayments
          .filter((p) => p.operator === "orange_money")
          .reduce((s, p) => s + p.amount, 0),
      },
    };

    // Get average price per kg from decisions
    let totalPriceKg = 0;
    let priceCount = 0;
    if (args.campaignId) {
      const collections = await ctx.db
        .query("collections")
        .withIndex("by_campaign", (q: any) => q.eq("campaignId", args.campaignId))
        .collect();
      for (const c of collections) {
        const d = await ctx.db
          .query("decisions")
          .withIndex("by_collection", (q: any) => q.eq("collectionId", c._id))
          .unique();
        if (d?.pricePerKg) {
          totalPriceKg += d.pricePerKg;
          priceCount++;
        }
      }
    }

    return {
      totalPayments: filteredPayments.length,
      totalPaid: Math.round(totalPaid),
      totalPending: Math.round(totalPending),
      totalAmount: Math.round(totalPaid + totalPending),
      avgPricePerKg: priceCount > 0 ? Math.round(totalPriceKg / priceCount) : 0,
      byOperator,
      byStatus: {
        en_attente: filteredPayments.filter((p) => p.status === "en_attente").length,
        initie: filteredPayments.filter((p) => p.status === "initie").length,
        confirme: filteredPayments.filter((p) => p.status === "confirme").length,
        echoue: filteredPayments.filter((p) => p.status === "echoue").length,
        annule: filteredPayments.filter((p) => p.status === "annule").length,
      },
    };
  },
});

export const qualityReport = query({
  args: { campaignId: v.optional(v.id("campaigns")) },
  handler: async (ctx, args) => {
    let collections;
    if (args.campaignId) {
      collections = await ctx.db
        .query("collections")
        .withIndex("by_campaign", (q: any) => q.eq("campaignId", args.campaignId))
        .collect();
    } else {
      collections = await ctx.db.query("collections").collect();
    }

    const rows: Array<{
      collectionId: string;
      supplierName: string;
      supplierType: string;
      location: string;
      visualAspect: number;
      humidity: number;
      homogeneity: number;
      cleanliness: number;
      husking: number;
      globalScore: number;
      decision: string | null;
    }> = [];
    for (const c of collections) {
      const qa = await ctx.db
        .query("qualityAssessments")
        .withIndex("by_collection", (q: any) => q.eq("collectionId", c._id))
        .unique();
      if (!qa) continue;

      let supplierName = "Inconnu";
      if (c.supplierType === "individual") {
        const p = await ctx.db.get(c.supplierId as any);
        if (p) supplierName = (p as any).name;
      } else {
        const co = await ctx.db.get(c.supplierId as any);
        if (co) supplierName = (co as any).name;
      }

      const decision = await ctx.db
        .query("decisions")
        .withIndex("by_collection", (q: any) => q.eq("collectionId", c._id))
        .unique();

      rows.push({
        collectionId: c._id,
        supplierName,
        supplierType: c.supplierType,
        location: c.location ?? "—",
        visualAspect: qa.visualAspect,
        humidity: qa.humidity,
        homogeneity: qa.homogeneity,
        cleanliness: qa.cleanliness,
        husking: qa.husking,
        globalScore: qa.globalScore,
        decision: decision?.decision ?? null,
      });
    }

    // Averages
    const count = rows.length;
    const avg = (key: string) =>
      count > 0
        ? Math.round((rows.reduce((s, r) => s + (r as any)[key], 0) / count) * 100) / 100
        : 0;

    return {
      rows,
      averages: {
        visualAspect: avg("visualAspect"),
        humidity: avg("humidity"),
        homogeneity: avg("homogeneity"),
        cleanliness: avg("cleanliness"),
        husking: avg("husking"),
        globalScore: avg("globalScore"),
      },
      acceptRate: count > 0 ? Math.round((rows.filter((r) => r.decision === "accepte").length / count) * 100) : 0,
      refuseRate: count > 0 ? Math.round((rows.filter((r) => r.decision === "refuse").length / count) * 100) : 0,
    };
  },
});

export const dashboardKPIs = query({
  args: {
    campaignId: v.optional(v.id("campaigns")),
  },
  handler: async (ctx, args) => {
    let collections;
    if (args.campaignId) {
      collections = await ctx.db
        .query("collections")
        .withIndex("by_campaign", (q: any) => q.eq("campaignId", args.campaignId))
        .collect();
    } else {
      collections = await ctx.db.query("collections").collect();
    }

    const totalVolumeKg = collections.reduce((sum, c) => sum + c.estimatedStockKg, 0);

    // Get decisions for accepted collections to calculate total amount
    const acceptedStatuses = ["valide", "en_paiement", "paye", "en_attente_direction", "decision_agent"];
    const accepted = collections.filter((c) => acceptedStatuses.includes(c.status));

    let totalAmount = 0;
    for (const c of accepted) {
      const decision = await ctx.db
        .query("decisions")
        .withIndex("by_collection", (q: any) => q.eq("collectionId", c._id))
        .unique();
      if (decision?.totalAmount) totalAmount += decision.totalAmount;
    }

    // Quality average
    let qualitySum = 0;
    let qualityCount = 0;
    for (const c of collections) {
      const qa = await ctx.db
        .query("qualityAssessments")
        .withIndex("by_collection", (q: any) => q.eq("collectionId", c._id))
        .unique();
      if (qa) {
        qualitySum += qa.globalScore;
        qualityCount++;
      }
    }

    // Unique suppliers
    const supplierIds = new Set(collections.map((c) => c.supplierId));

    // Technician performance
    const techMap = new Map<string, { name: string; volumeKg: number; count: number }>();
    for (const c of collections) {
      const existing = techMap.get(c.technicianId);
      if (existing) {
        existing.volumeKg += c.estimatedStockKg;
        existing.count++;
      } else {
        const tech = await ctx.db.get(c.technicianId);
        techMap.set(c.technicianId, {
          name: tech?.name ?? "Inconnu",
          volumeKg: c.estimatedStockKg,
          count: 1,
        });
      }
    }

    return {
      totalCollections: collections.length,
      totalVolumeKg,
      totalVolumeTons: Math.round((totalVolumeKg / 1000) * 10) / 10,
      totalAmountFCFA: Math.round(totalAmount),
      nbSuppliers: supplierIds.size,
      avgQuality: qualityCount > 0 ? Math.round((qualitySum / qualityCount) * 100) / 100 : 0,
      accepted: accepted.length,
      refused: collections.filter((c) => c.status === "refuse").length,
      paid: collections.filter((c) => c.status === "paye").length,
      technicians: Array.from(techMap.values()).sort((a, b) => b.volumeKg - a.volumeKg),
    };
  },
});

export const technicianPerformance = query({
  args: {
    campaignId: v.optional(v.id("campaigns")),
  },
  handler: async (ctx, args) => {
    const technicians = await ctx.db
      .query("users")
      .withIndex("by_role", (q: any) => q.eq("role", "technicien"))
      .collect();

    const results = [];
    for (const tech of technicians) {
      if (!tech.isActive) continue;

      let collections;
      if (args.campaignId) {
        collections = await ctx.db
          .query("collections")
          .withIndex("by_technician_campaign", (q: any) =>
            q.eq("technicianId", tech._id).eq("campaignId", args.campaignId),
          )
          .collect();
      } else {
        collections = await ctx.db
          .query("collections")
          .withIndex("by_technician", (q: any) => q.eq("technicianId", tech._id))
          .collect();
      }

      const totalVolumeKg = collections.reduce((sum, c) => sum + c.estimatedStockKg, 0);
      const acceptedStatuses = ["valide", "en_paiement", "paye", "en_attente_direction", "decision_agent"];
      const accepted = collections.filter((c) => acceptedStatuses.includes(c.status)).length;
      const refused = collections.filter((c) => c.status === "refuse").length;
      const total = collections.length;
      const acceptRate = total > 0 ? Math.round((accepted / total) * 100) : 0;

      results.push({
        id: tech._id,
        name: tech.name,
        zone: tech.zone ?? "—",
        totalCollections: total,
        totalVolumeKg,
        totalVolumeTons: Math.round((totalVolumeKg / 1000) * 10) / 10,
        accepted,
        refused,
        acceptRate,
      });
    }

    return results.sort((a, b) => b.totalVolumeKg - a.totalVolumeKg);
  },
});

export const globalStats = query({
  args: {
    campaignId: v.optional(v.id("campaigns")),
  },
  handler: async (ctx, args) => {
    let collections;
    if (args.campaignId) {
      collections = await ctx.db
        .query("collections")
        .withIndex("by_campaign", (q: any) => q.eq("campaignId", args.campaignId))
        .collect();
    } else {
      collections = await ctx.db.query("collections").collect();
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTs = today.getTime();

    const collectionsToday = collections.filter((c) => c.createdAt >= todayTs);
    const totalVolumeKg = collections.reduce((sum, c) => sum + c.estimatedStockKg, 0);
    const pendingValidation = collections.filter(
      (c) => c.status === "soumis" || c.status === "en_validation",
    ).length;
    const accepted = collections.filter(
      (c) =>
        c.status === "valide" ||
        c.status === "en_paiement" ||
        c.status === "paye" ||
        c.status === "en_attente_direction" ||
        c.status === "decision_agent",
    ).length;
    const refused = collections.filter((c) => c.status === "refuse").length;

    return {
      totalCollections: collections.length,
      collectionsToday: collectionsToday.length,
      totalVolumeKg,
      totalVolumeTons: Math.round(totalVolumeKg / 1000 * 10) / 10,
      pendingValidation,
      accepted,
      refused,
    };
  },
});

export const technicianStats = query({
  args: {
    technicianId: v.id("users"),
    campaignId: v.optional(v.id("campaigns")),
  },
  handler: async (ctx, args) => {
    let collections;
    if (args.campaignId) {
      collections = await ctx.db
        .query("collections")
        .withIndex("by_technician_campaign", (q: any) =>
          q.eq("technicianId", args.technicianId).eq("campaignId", args.campaignId),
        )
        .collect();
    } else {
      collections = await ctx.db
        .query("collections")
        .withIndex("by_technician", (q: any) => q.eq("technicianId", args.technicianId))
        .collect();
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTs = today.getTime();

    const collectionsToday = collections.filter((c) => c.createdAt >= todayTs);
    const totalVolumeKg = collections.reduce((sum, c) => sum + c.estimatedStockKg, 0);
    const pendingValidation = collections.filter(
      (c) => c.status === "soumis" || c.status === "en_validation",
    ).length;
    const accepted = collections.filter(
      (c) =>
        c.status === "valide" ||
        c.status === "en_paiement" ||
        c.status === "paye" ||
        c.status === "en_attente_direction" ||
        c.status === "decision_agent",
    ).length;
    const refused = collections.filter((c) => c.status === "refuse").length;

    return {
      totalCollections: collections.length,
      collectionsToday: collectionsToday.length,
      totalVolumeKg,
      totalVolumeTons: Math.round(totalVolumeKg / 1000 * 10) / 10,
      pendingValidation,
      accepted,
      refused,
    };
  },
});
