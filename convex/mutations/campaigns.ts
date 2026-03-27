import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { requireRole } from "../lib/auth";

export const create = mutation({
  args: {
    name: v.string(),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, "admin");

    if (args.endDate <= args.startDate) {
      throw new ConvexError("La date de fin doit être après la date de début");
    }

    // Check no other active campaign
    const activeCampaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_status", (q: any) => q.eq("status", "active"))
      .collect();

    if (activeCampaigns.length > 0) {
      throw new ConvexError(
        "Une campagne active existe déjà. Clôturez-la avant d'en créer une nouvelle.",
      );
    }

    const id = await ctx.db.insert("campaigns", {
      name: args.name.trim(),
      startDate: args.startDate,
      endDate: args.endDate,
      status: "active",
      createdBy: user._id,
      createdAt: Date.now(),
    });

    return id;
  },
});

export const close = mutation({
  args: {
    id: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin");

    const campaign = await ctx.db.get(args.id);
    if (!campaign) throw new ConvexError("Campagne non trouvée");
    if (campaign.status === "closed") throw new ConvexError("Campagne déjà clôturée");

    await ctx.db.patch(args.id, { status: "closed" });

    await ctx.db.insert("auditLogs", {
      entityType: "campaign",
      entityId: args.id,
      action: "status:active→closed",
      userId: (await requireRole(ctx, "admin"))._id,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});
