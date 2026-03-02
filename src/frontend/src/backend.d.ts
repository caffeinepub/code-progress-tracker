import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface LeetCodeStats {
    total: bigint;
    easy: bigint;
    hard: bigint;
    medium: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export type PrincipalArray = Array<Principal>;
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface CodeChefStats {
    totalSolved: bigint;
}
export type Username = string;
export interface UserProfileInput {
    displayName: string;
    leetcodeUsername: Username;
    codechefUsername: Username;
}
export interface UserProfile {
    lastRefreshed: Time;
    displayName: string;
    leetcodeStats: LeetCodeStats;
    codechefStats: CodeChefStats;
    leetcodeUsername: Username;
    codechefUsername: Username;
    friends: PrincipalArray;
}
export interface http_header {
    value: string;
    name: string;
}
export enum FriendshipStatus {
    pending = "pending",
    rejected = "rejected",
    accepted = "accepted"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptFriendRequest(fromUser: Principal): Promise<FriendshipStatus>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFriendStatus(user1: Principal, user2: Principal): Promise<FriendshipStatus | null>;
    getFriends(user: Principal): Promise<Array<UserProfile>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    refreshCodechefStats(): Promise<CodeChefStats | null>;
    refreshLeetcodeStats(): Promise<LeetCodeStats | null>;
    registerOrUpdateProfile(profileInput: UserProfileInput): Promise<UserProfile>;
    rejectFriendRequest(fromUser: Principal): Promise<FriendshipStatus>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchUsers(searchTerm: string): Promise<Array<UserProfile>>;
    sendFriendRequest(toUser: Principal): Promise<FriendshipStatus>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
