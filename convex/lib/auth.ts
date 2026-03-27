import { ConvexError } from "convex/values";
import type { GenericQueryCtx, GenericMutationCtx } from "convex/server";
import type { DataModel } from "../_generated/dataModel";

// NOTE: The `_generated` types are created by `npx convex dev`.
// Run `npx convex dev` at least once to generate them.
// Until then, this file may show TS errors in the convex/ directory
// (the main `pnpm build` still succeeds since it only checks src/).

type QueryCtx = GenericQueryCtx<DataModel>;
type MutationCtx = GenericMutationCtx<DataModel>;

export type Role = "technicien" | "agent_bureau" | "admin" | "direction";

/**
 * Get the current authenticated user from the database.
 * Throws if not authenticated or user not found in DB.
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Non authentifié");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    throw new ConvexError("Utilisateur non trouvé dans la base de données");
  }

  if (!user.isActive) {
    throw new ConvexError("Compte désactivé");
  }

  return user;
}

/**
 * Require the current user to have one of the specified roles.
 * Returns the user document if authorized.
 * Throws ConvexError if not authenticated or not authorized.
 */
export async function requireRole(ctx: QueryCtx | MutationCtx, ...roles: Role[]) {
  const user = await getCurrentUser(ctx);

  if (!roles.includes(user.role as Role)) {
    throw new ConvexError(
      `Accès non autorisé. Rôle requis : ${roles.join(" ou ")}. Rôle actuel : ${user.role}`,
    );
  }

  return user;
}

/**
 * Get the current user identity without requiring DB user record.
 * Useful for the initial user sync flow.
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Non authentifié");
  }
  return identity;
}
