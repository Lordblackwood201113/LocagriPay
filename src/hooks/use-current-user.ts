import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/react";
import { useEffect } from "react";
import { api } from "../../convex/_generated/api";
import type { Role } from "@/lib/constants";

/**
 * Hook that syncs the Clerk user to Convex and returns the DB user record.
 * Call this in the authenticated layout so it runs on every app load.
 */
export function useCurrentUser() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();

  const convexUser = useQuery(api.queries.users.me);
  const syncUser = useMutation(api.mutations.users.syncCurrentUser);

  // Sync Clerk → Convex on load
  useEffect(() => {
    if (clerkLoaded && clerkUser && convexUser === null) {
      syncUser();
    }
  }, [clerkLoaded, clerkUser, convexUser, syncUser]);

  const role = (convexUser?.role as Role) ?? null;
  const isLoading = convexUser === undefined;

  return {
    user: convexUser,
    role,
    isLoading,
    name: convexUser?.name ?? clerkUser?.fullName ?? null,
  };
}
