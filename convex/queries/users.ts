import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get the current authenticated user from the database.
 * Returns null if user is not synced yet (first load).
 */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .unique();

    return user;
  },
});

/**
 * List all users, optionally filtered by role.
 * Requires admin role (enforced at UI level, will be enforced server-side in STORY-008).
 */
export const list = query({
  args: {
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.role) {
      return await ctx.db
        .query("users")
        .withIndex("by_role", (q: any) => q.eq("role", args.role))
        .collect();
    }
    return await ctx.db.query("users").collect();
  },
});
