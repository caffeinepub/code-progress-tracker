import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserProfile, UserProfileInput } from "../backend.d";
import { useActor } from "./useActor";

// ── Profile Queries ──────────────────────────────────────────────────────────

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile(principal: Principal | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

// ── Mutations ────────────────────────────────────────────────────────────────

export function useRegisterOrUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profileInput: UserProfileInput) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.registerOrUpdateProfile(profileInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function useRefreshStats() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not authenticated");
      const [leetcode, codechef] = await Promise.all([
        actor.refreshLeetcodeStats(),
        actor.refreshCodechefStats(),
      ]);
      return { leetcode, codechef };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

// ── Friends Queries ──────────────────────────────────────────────────────────

export function useFriends(principal: Principal | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile[]>({
    queryKey: ["friends", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getFriends(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useFriendStatus(
  user1: Principal | undefined,
  user2: Principal | undefined,
) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["friendStatus", user1?.toString(), user2?.toString()],
    queryFn: async () => {
      if (!actor || !user1 || !user2) return null;
      return actor.getFriendStatus(user1, user2);
    },
    enabled: !!actor && !isFetching && !!user1 && !!user2,
  });
}

export function useSendFriendRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (toUser: Principal) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.sendFriendRequest(toUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendStatus"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
    },
  });
}

export function useAcceptFriendRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fromUser: Principal) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.acceptFriendRequest(fromUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friendStatus"] });
    },
  });
}

export function useRejectFriendRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fromUser: Principal) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.rejectFriendRequest(fromUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friendStatus"] });
    },
  });
}

// ── Search ───────────────────────────────────────────────────────────────────

export function useSearchUsers(searchTerm: string) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile[]>({
    queryKey: ["searchUsers", searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm.trim()) return [];
      return actor.searchUsers(searchTerm.trim());
    },
    enabled: !!actor && !isFetching && searchTerm.trim().length > 0,
  });
}
