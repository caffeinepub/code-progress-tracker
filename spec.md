# Code Progress Tracker

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- User registration and login (Internet Identity / principal-based auth)
- User profile with LeetCode username and CodeChef username fields
- Backend HTTP outcalls to fetch solved problem counts from LeetCode (GraphQL API) and CodeChef (public profile API)
- Dashboard showing:
  - Total solved problems (combined)
  - Platform-wise breakdown: LeetCode count + CodeChef count
  - Difficulty breakdown (Easy/Medium/Hard) for LeetCode
- Search for other registered users by username
- Friend system: send friend request, accept/reject, list friends
- Friends' stats view: see each friend's total solved and platform breakdown
- Leaderboard of friends sorted by total solved

### Modify
N/A

### Remove
N/A

## Implementation Plan

### Backend (Motoko)
- `User` type: principal, displayName, leetcodeUsername, codechefUsername, registeredAt
- `FriendRequest` type: from principal, to principal, status (pending/accepted/rejected)
- Stable storage: users HashMap, friendRequests array
- `registerUser(displayName, leetcodeUsername, codechefUsername)` -- creates profile for caller
- `getMyProfile()` -- returns caller's profile
- `updateProfile(displayName, leetcodeUsername, codechefUsername)` -- update caller's profile
- `searchUsers(query)` -- search by displayName, returns list of public profiles
- `sendFriendRequest(toPrincipal)` -- send request
- `respondFriendRequest(fromPrincipal, accept: Bool)` -- accept or reject
- `getFriendRequests()` -- incoming pending requests for caller
- `getMyFriends()` -- list of accepted friend principals + their profiles
- `fetchLeetCodeStats(username)` -- HTTP outcall to LeetCode GraphQL API, returns solved counts by difficulty
- `fetchCodeChefStats(username)` -- HTTP outcall to CodeChef public API, returns total solved count
- `refreshMyStats()` -- triggers fetch for caller's own usernames, caches result in user record
- Cached stats fields on User: leetcodeSolved (Easy/Medium/Hard/Total), codechefSolved, lastRefreshed timestamp

### Frontend (React + TypeScript + Tailwind)
- Auth flow: connect with Internet Identity, then check if profile exists, redirect to onboarding if not
- Onboarding page: set displayName, leetcodeUsername, codechefUsername
- Dashboard page (home): stats cards showing LeetCode + CodeChef solved counts, refresh button
- Friends page: list friends with their stats, search for users, send/manage friend requests
- Friend requests inbox: accept/reject pending requests
- User profile page: view own profile and edit usernames
- Navigation: sidebar or top nav with Dashboard, Friends, Profile links
