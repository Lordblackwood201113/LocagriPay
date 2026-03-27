import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { requireRole } from "../lib/auth";
import { calculateGlobalScore, validateScores } from "../lib/scoring";

export const assess = mutation({
  args: {
    collectionId: v.id("collections"),
    visualAspect: v.number(),
    humidity: v.number(),
    homogeneity: v.number(),
    cleanliness: v.number(),
    husking: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, "agent_bureau");

    const collection = await ctx.db.get(args.collectionId);
    if (!collection) throw new ConvexError("Collecte non trouvée");

    if (collection.status !== "soumis" && collection.status !== "en_validation") {
      throw new ConvexError("Cette collecte ne peut pas être évaluée dans son état actuel");
    }

    // Validate scores
    const validationError = validateScores({
      visualAspect: args.visualAspect,
      humidity: args.humidity,
      homogeneity: args.homogeneity,
      cleanliness: args.cleanliness,
      husking: args.husking,
    });
    if (validationError) throw new ConvexError(validationError);

    const globalScore = calculateGlobalScore({
      visualAspect: args.visualAspect,
      humidity: args.humidity,
      homogeneity: args.homogeneity,
      cleanliness: args.cleanliness,
      husking: args.husking,
    });

    // Check if assessment already exists (update it)
    const existing = await ctx.db
      .query("qualityAssessments")
      .withIndex("by_collection", (q: any) => q.eq("collectionId", args.collectionId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        visualAspect: args.visualAspect,
        humidity: args.humidity,
        homogeneity: args.homogeneity,
        cleanliness: args.cleanliness,
        husking: args.husking,
        globalScore,
        agentId: user._id,
      });
      return existing._id;
    }

    const id = await ctx.db.insert("qualityAssessments", {
      collectionId: args.collectionId,
      agentId: user._id,
      visualAspect: args.visualAspect,
      humidity: args.humidity,
      homogeneity: args.homogeneity,
      cleanliness: args.cleanliness,
      husking: args.husking,
      globalScore,
      createdAt: Date.now(),
    });

    // Transition collection to en_validation if still soumis
    if (collection.status === "soumis") {
      await ctx.db.patch(args.collectionId, {
        status: "en_validation",
        updatedAt: Date.now(),
      });
    }

    return id;
  },
});
