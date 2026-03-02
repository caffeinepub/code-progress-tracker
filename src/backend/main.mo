import Array "mo:core/Array";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import OutCall "http-outcalls/outcall";

actor {
  type Username = Text;
  type Difficulty = { #easy; #medium; #hard };
  type PrincipalArray = [Principal];

  type LeetCodeStats = {
    easy : Nat;
    medium : Nat;
    hard : Nat;
    total : Nat;
  };
  type CodeChefStats = {
    totalSolved : Nat;
  };

  type LeetCodeStatsInput = {
    easy : Nat;
    medium : Nat;
    hard : Nat;
    total : Nat;
  };

  type CodeChefStatsInput = { totalSolved : Nat };

  type FriendshipStatus = { #pending; #accepted; #rejected };

  type Friendship = {
    user1 : Principal;
    user2 : Principal;
    status : FriendshipStatus;
  };

  type UserProfile = {
    displayName : Text;
    leetcodeUsername : Username;
    codechefUsername : Username;
    leetcodeStats : LeetCodeStats;
    codechefStats : CodeChefStats;
    lastRefreshed : Time.Time;
    friends : PrincipalArray;
  };

  type UserProfileInput = {
    displayName : Text;
    leetcodeUsername : Username;
    codechefUsername : Username;
  };

  module UserProfile {
    public func compareByDisplayName(a : UserProfile, b : UserProfile) : Order.Order {
      Text.compare(a.displayName, b.displayName);
    };
    public func compare(a : UserProfile, b : UserProfile) : Order.Order {
      if (a.displayName < b.displayName) { #less } else if (a.displayName > b.displayName) {
        #greater;
      } else { #equal };
    };
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let friendships = Map.empty<Principal, Map.Map<Principal, Friendship>>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Helper function to check if two users are friends
  func areFriends(user1 : Principal, user2 : Principal) : Bool {
    switch (userProfiles.get(user1)) {
      case (null) { false };
      case (?profile) {
        profile.friends.values().contains(user2);
      };
    };
  };

  // Required by frontend: get caller's own profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  // Required by frontend: save caller's own profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // View user profile - restricted to self, friends, or admin
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    // Allow if viewing own profile
    if (caller == user) {
      return userProfiles.get(user);
    };

    // Allow if admin
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return userProfiles.get(user);
    };

    // Allow if they are friends
    if (areFriends(caller, user)) {
      return userProfiles.get(user);
    };

    // Otherwise, deny access
    Runtime.trap("Unauthorized: Can only view your own profile, friends' profiles, or admin access required");
  };

  // Public query - any user including guests can search
  public query ({ caller }) func searchUsers(searchTerm : Text) : async [UserProfile] {
    let lowerSearch = searchTerm.toLower();
    let filtered = userProfiles.values().toArray().filter(
      func(profile) {
        profile.displayName.toLower().contains(#text lowerSearch);
      }
    );
    filtered.sort(UserProfile.compareByDisplayName);
  };

  // View friend list - restricted to self or admin
  public query ({ caller }) func getFriends(user : Principal) : async [UserProfile] {
    // Allow if viewing own friends
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own friend list or admin access required");
    };

    let friendList = Map.empty<Principal, UserProfile>();
    switch (userProfiles.get(user)) {
      case (null) { [] };
      case (?profile) {
        for (friendPrincipal in profile.friends.values()) {
          switch (userProfiles.get(friendPrincipal)) {
            case (?friendProfile) {
              friendList.add(friendPrincipal, friendProfile);
            };
            case (null) {};
          };
        };
        let sorted = friendList.values().toArray().sort(UserProfile.compareByDisplayName);
        sorted;
      };
    };
  };

  // Check friendship status - restricted to involved users or admin
  public query ({ caller }) func getFriendStatus(user1 : Principal, user2 : Principal) : async ?FriendshipStatus {
    // Allow if caller is one of the users involved
    if (caller != user1 and caller != user2 and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only check friendship status for yourself or admin access required");
    };

    switch (friendships.get(user1)) {
      case (?user1Map) {
        switch (user1Map.get(user2)) {
          case (?friendship) { ?friendship.status };
          case (null) { null };
        };
      };
      case (null) { null };
    };
  };

  // User-only: register or update profile
  public shared ({ caller }) func registerOrUpdateProfile(profileInput : UserProfileInput) : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register or update profiles");
    };

    let existingFriends = switch (userProfiles.get(caller)) {
      case (null) { [] : PrincipalArray };
      case (?profile) { profile.friends };
    };

    let defaultLeetcodeStats = {
      easy = 0;
      medium = 0;
      hard = 0;
      total = 0;
    };

    let defaultCodechefStats = { totalSolved = 0 };

    let newProfile : UserProfile = {
      displayName = profileInput.displayName;
      leetcodeUsername = profileInput.leetcodeUsername;
      codechefUsername = profileInput.codechefUsername;
      leetcodeStats = defaultLeetcodeStats;
      codechefStats = defaultCodechefStats;
      lastRefreshed = Time.now();
      friends = existingFriends;
    };

    userProfiles.add(caller, newProfile);
    newProfile;
  };

  // User-only: send friend request
  public shared ({ caller }) func sendFriendRequest(toUser : Principal) : async FriendshipStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send friend requests");
    };

    if (toUser == caller) {
      Runtime.trap("Cannot add yourself as a friend");
    };

    switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("Profile not found");
      };
      case (?_) {
        switch (userProfiles.get(toUser)) {
          case (null) {
            Runtime.trap("Recipient profile not found");
          };
          case (?_) {
            switch (friendships.get(caller)) {
              case (?user1Map) {
                switch (user1Map.get(toUser)) {
                  case (null) {
                    addNewFriendship(caller, toUser, #pending);
                  };
                  case (?_) {
                    switch (friendships.get(toUser)) {
                      case (?user2Map) {
                        switch (user2Map.get(caller)) {
                          case (null) { #pending };
                          case (?friendship) { friendship.status };
                        };
                      };
                      case (null) { #pending };
                    };
                  };
                };
              };
              case (null) { addNewFriendship(caller, toUser, #pending) };
            };
          };
        };
      };
    };
  };

  func addNewFriendship(user1 : Principal, user2 : Principal, status : FriendshipStatus) : FriendshipStatus {
    let newFriendship : Friendship = {
      user1;
      user2;
      status;
    };

    switch (friendships.get(user1)) {
      case (null) {
        let newUser1Map = Map.singleton<Principal, Friendship>(user2, newFriendship);
        friendships.add(user1, newUser1Map);
      };
      case (?user1Map) { user1Map.add(user2, newFriendship) };
    };
    status;
  };

  // User-only: accept friend request
  public shared ({ caller }) func acceptFriendRequest(fromUser : Principal) : async FriendshipStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can accept friend requests");
    };

    if (fromUser == caller) {
      Runtime.trap("Cannot accept your own friend request");
    };
    // Update both users' friendship status
    switch (friendships.get(fromUser)) {
      case (null) {
        Runtime.trap("Friendship request not found");
      };
      case (?fromMap) {
        let fromMapCopy = Map.empty<Principal, Friendship>();
        fromMap.entries().forEach(
          func(entry) {
            fromMapCopy.add(entry.0, entry.1);
          }
        );
        switch (fromMapCopy.get(caller)) {
          case (null) {
            Runtime.trap("Friendship request not found");
          };
          case (?request) {
            if (request.status == #accepted) { return #accepted };
            fromMapCopy.add(
              caller,
              {
                user1 = request.user1;
                user2 = request.user2;
                status = #accepted;
              },
            );
            friendships.add(fromUser, fromMapCopy);
            updateFriendList(fromUser, caller);
            #accepted;
          };
        };
      };
    };
  };

  func updateFriendList(user1 : Principal, user2 : Principal) {
    switch (userProfiles.get(user1)) {
      case (?profile1) {
        let newFriends = profile1.friends.concat([user2]);
        let updatedProfile1 : UserProfile = {
          displayName = profile1.displayName;
          leetcodeUsername = profile1.leetcodeUsername;
          codechefUsername = profile1.codechefUsername;
          leetcodeStats = profile1.leetcodeStats;
          codechefStats = profile1.codechefStats;
          lastRefreshed = profile1.lastRefreshed;
          friends = newFriends;
        };
        userProfiles.add(user1, updatedProfile1);
      };
      case (null) {};
    };

    switch (userProfiles.get(user2)) {
      case (?profile2) {
        let newFriends = profile2.friends.concat([user1]);
        let updatedProfile2 : UserProfile = {
          displayName = profile2.displayName;
          leetcodeUsername = profile2.leetcodeUsername;
          codechefUsername = profile2.codechefUsername;
          leetcodeStats = profile2.leetcodeStats;
          codechefStats = profile2.codechefStats;
          lastRefreshed = profile2.lastRefreshed;
          friends = newFriends;
        };
        userProfiles.add(user2, updatedProfile2);
      };
      case (null) {};
    };
  };

  // User-only: reject friend request
  public shared ({ caller }) func rejectFriendRequest(fromUser : Principal) : async FriendshipStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reject friend requests");
    };

    if (fromUser == caller) {
      Runtime.trap("Cannot reject your own friend request");
    };
    switch (friendships.get(fromUser)) {
      case (null) {
        Runtime.trap("Friendship request not found");
      };
      case (?fromMap) {
        switch (fromMap.get(caller)) {
          case (null) {
            Runtime.trap("Friendship request not found");
          };
          case (?request) {
            fromMap.add(
              caller,
              {
                user1 = request.user1;
                user2 = request.user2;
                status = #rejected;
              },
            );
            friendships.add(fromUser, fromMap);
            #rejected;
          };
        };
      };
    };
  };

  // Public query function for HTTP outcall transform
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // User-only: refresh own LeetCode stats
  public shared ({ caller }) func refreshLeetcodeStats() : async ?LeetCodeStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can refresh stats");
    };

    let userProfile = switch (userProfiles.get(caller)) {
      case (null) { return null };
      case (?profile) { profile };
    };

    if (userProfile.leetcodeUsername == "") { return null };

    let leetcodeApiUrl = "https://some-leetcode-proxy.com/" # userProfile.leetcodeUsername;

    let _response = await OutCall.httpGetRequest(leetcodeApiUrl, [], transform);

    let newStats : LeetCodeStats = {
      easy = 0; // TODO: JSON parsing after BigMap release
      medium = 0;
      hard = 0;
      total = 0;
    };

    let newUserProfile : UserProfile = {
      displayName = userProfile.displayName;
      leetcodeUsername = userProfile.leetcodeUsername;
      codechefUsername = userProfile.codechefUsername;
      leetcodeStats = newStats;
      codechefStats = userProfile.codechefStats;
      lastRefreshed = Time.now();
      friends = userProfile.friends;
    };

    userProfiles.add(caller, newUserProfile);

    ?newStats;
  };

  // User-only: refresh own CodeChef stats
  public shared ({ caller }) func refreshCodechefStats() : async ?CodeChefStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can refresh stats");
    };

    let userProfile = switch (userProfiles.get(caller)) {
      case (null) { return null };
      case (?profile) { profile };
    };

    if (userProfile.codechefUsername == "") { return null };

    let codechefApiUrl = "https://some-codechef-proxy.com/" # userProfile.codechefUsername;

    let _response = await OutCall.httpGetRequest(codechefApiUrl, [], transform);

    let newStats : CodeChefStats = { totalSolved = 0 }; // TODO: Parse from JSON

    let newUserProfile : UserProfile = {
      displayName = userProfile.displayName;
      leetcodeUsername = userProfile.leetcodeUsername;
      codechefUsername = userProfile.codechefUsername;
      leetcodeStats = userProfile.leetcodeStats;
      codechefStats = newStats;
      lastRefreshed = Time.now();
      friends = userProfile.friends;
    };

    userProfiles.add(caller, newUserProfile);

    ?newStats;
  };
};
