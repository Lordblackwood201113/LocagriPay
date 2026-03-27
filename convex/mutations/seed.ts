import { mutation } from "../_generated/server";
import { ConvexError } from "convex/values";

/**
 * One-time utility: promote the current authenticated user to admin.
 * Call this from the browser console or a temporary button.
 */
export const promoteToAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Non authentifié");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new ConvexError("Utilisateur non trouvé dans la DB");

    await ctx.db.patch(user._id, { role: "admin" });

    return { success: true, name: user.name, newRole: "admin" };
  },
});
