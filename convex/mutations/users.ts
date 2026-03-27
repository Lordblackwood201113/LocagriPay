import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { requireAuth } from "../lib/auth";
import { roleValidator } from "../schema";

/**
 * Sync the current Clerk user into the Convex `users` table.
 * Called from the frontend on every login / app load.
 * Creates the user if not found, updates name/email if changed.
 * Role is read from Clerk publicMetadata — only an admin can change it there.
 */
export const syncCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await requireAuth(ctx);

    const clerkId = identity.subject;
    const email = identity.email ?? "";
    const name = identity.name ?? email;

    // Read role from Clerk custom claims (publicMetadata.role)
    // Falls back to "technicien" for new users without a role set
    const role = (identity as any).role ?? (identity as any).publicMetadata?.role ?? "technicien";

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", clerkId))
      .unique();

    if (existing) {
      // Update if name or email changed
      if (existing.email !== email || existing.name !== name) {
        await ctx.db.patch(existing._id, {
          email,
          name,
        });
      }
      return existing._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId,
      email,
      name,
      role: role as any,
      isActive: true,
      createdAt: Date.now(),
    });

    return userId;
  },
});

/**
 * Admin: update a user's role and zone.
 */
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    role: v.optional(roleValidator),
    zone: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);

    // Check caller is admin
    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
      .unique();

    if (!caller || caller.role !== "admin") {
      throw new ConvexError("Seul un admin peut modifier les utilisateurs");
    }

    const updates: Record<string, unknown> = {};
    if (args.role !== undefined) updates.role = args.role;
    if (args.zone !== undefined) updates.zone = args.zone;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.userId, updates);
    return { success: true };
  },
});
