import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Principal } from "@icp-sdk/core/principal";
import { Loader2, Search, Trophy, UserPlus, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend.d";
import { PageHeader } from "../components/Layout";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCallerProfile,
  useFriends,
  useSearchUsers,
  useSendFriendRequest,
} from "../hooks/useQueries";
import { bn, getInitials, totalSolved } from "../utils/format";

const SKELETON_KEYS = ["a", "b", "c"];

function FriendCard({
  profile,
  rank,
}: {
  profile: UserProfile;
  rank?: number;
}) {
  const lcTotal = bn(profile.leetcodeStats.total);
  const ccTotal = bn(profile.codechefStats.totalSolved);
  const total = lcTotal + ccTotal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-4 card-interactive"
    >
      <div className="flex items-center gap-3">
        {rank !== undefined && (
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 ${
              rank === 0
                ? "bg-leetcode/20 text-leetcode"
                : rank === 1
                  ? "bg-muted text-foreground"
                  : rank === 2
                    ? "bg-codechef/20 text-codechef"
                    : "bg-secondary text-muted-foreground"
            }`}
          >
            #{rank + 1}
          </div>
        )}
        <Avatar className="h-9 w-9 flex-shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-mono">
            {getInitials(profile.displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground truncate">
            {profile.displayName}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {profile.leetcodeUsername && (
              <span className="text-xs text-leetcode font-mono">
                LC: {lcTotal}
              </span>
            )}
            {profile.codechefUsername && (
              <span className="text-xs text-codechef font-mono">
                CC: {ccTotal}
              </span>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="stat-number text-xl font-bold text-foreground">
            {total}
          </p>
          <p className="text-[10px] text-muted-foreground font-mono uppercase">
            total
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function SearchResultCard({
  profile,
  currentPrincipal,
}: {
  profile: UserProfile & { principal?: Principal };
  currentPrincipal: string;
}) {
  const sendRequest = useSendFriendRequest();

  const lcTotal = bn(profile.leetcodeStats.total);
  const ccTotal = bn(profile.codechefStats.totalSolved);
  const total = lcTotal + ccTotal;

  const handleSend = async () => {
    if (!profile.principal) {
      toast.error("Cannot determine user principal");
      return;
    }
    try {
      await sendRequest.mutateAsync(profile.principal);
      toast.success(`Friend request sent to ${profile.displayName}`);
    } catch {
      toast.error("Failed to send friend request");
    }
  };

  const isSelf = profile.principal?.toString() === currentPrincipal;

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
      <Avatar className="h-9 w-9 flex-shrink-0">
        <AvatarFallback className="bg-secondary text-muted-foreground text-xs font-mono">
          {getInitials(profile.displayName)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground truncate">
          {profile.displayName}
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          {total} solved
        </p>
      </div>
      {!isSelf && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleSend}
          disabled={sendRequest.isPending}
          className="font-mono text-xs flex-shrink-0"
        >
          {sendRequest.isPending ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <UserPlus size={13} className="mr-1" />
          )}
          Add
        </Button>
      )}
      {isSelf && (
        <Badge variant="outline" className="text-xs font-mono">
          You
        </Badge>
      )}
    </div>
  );
}

export default function FriendsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { identity } = useInternetIdentity();
  const { data: profile } = useCallerProfile();
  const myPrincipal = identity?.getPrincipal();

  const { data: friends = [], isLoading: friendsLoading } =
    useFriends(myPrincipal);

  const { data: searchResults = [], isFetching: searchLoading } =
    useSearchUsers(searchTerm);

  const handleSearch = useCallback(() => {
    setSearchTerm(searchInput);
  }, [searchInput]);

  // Sort friends by total solved for leaderboard
  const sortedFriends = [...friends].sort(
    (a, b) => totalSolved(b) - totalSolved(a),
  );

  const myPrincipalStr = myPrincipal?.toString() ?? "";

  return (
    <div>
      <PageHeader
        title="Friends"
        subtitle="Find, connect, and compete with other coders"
      />

      <Tabs defaultValue="friends" className="space-y-4">
        <TabsList className="bg-secondary border border-border h-9">
          <TabsTrigger
            value="friends"
            className="font-mono text-xs uppercase tracking-wide data-[state=active]:bg-card"
          >
            <Users size={13} className="mr-1.5" />
            Friends ({friends.length})
          </TabsTrigger>
          <TabsTrigger
            value="leaderboard"
            className="font-mono text-xs uppercase tracking-wide data-[state=active]:bg-card"
          >
            <Trophy size={13} className="mr-1.5" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger
            value="search"
            className="font-mono text-xs uppercase tracking-wide data-[state=active]:bg-card"
          >
            <Search size={13} className="mr-1.5" />
            Find Users
          </TabsTrigger>
        </TabsList>

        {/* Friends tab */}
        <TabsContent value="friends" className="space-y-3">
          {friendsLoading ? (
            SKELETON_KEYS.map((k) => (
              <Skeleton key={k} className="h-20 rounded-xl" />
            ))
          ) : friends.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-secondary mx-auto mb-4 flex items-center justify-center">
                <Users size={20} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">
                No friends yet
              </p>
              <p className="text-xs text-muted-foreground">
                Search for users and send friend requests to connect
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {friends.map((friend) => (
                <FriendCard key={friend.displayName} profile={friend} />
              ))}
            </AnimatePresence>
          )}
        </TabsContent>

        {/* Leaderboard tab */}
        <TabsContent value="leaderboard" className="space-y-3">
          {friendsLoading ? (
            SKELETON_KEYS.map((k) => (
              <Skeleton key={k} className="h-20 rounded-xl" />
            ))
          ) : sortedFriends.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <Trophy
                size={24}
                className="text-muted-foreground mx-auto mb-3"
              />
              <p className="text-sm font-semibold text-foreground mb-1">
                Leaderboard is empty
              </p>
              <p className="text-xs text-muted-foreground">
                Add friends to see how you compare
              </p>
            </div>
          ) : (
            <div>
              {/* My position */}
              {profile && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-mono text-xs text-primary uppercase tracking-wide">
                      Your stats
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="stat-number text-2xl font-bold text-leetcode">
                        {bn(profile.leetcodeStats.total)}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        LeetCode
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="stat-number text-2xl font-bold text-codechef">
                        {bn(profile.codechefStats.totalSolved)}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        CodeChef
                      </p>
                    </div>
                    <div className="text-center ml-auto">
                      <p className="stat-number text-3xl font-bold text-foreground">
                        {totalSolved(profile)}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        Combined
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <AnimatePresence>
                {sortedFriends.map((friend, i) => (
                  <div key={friend.displayName} className="mb-2">
                    <FriendCard profile={friend} rank={i} />
                  </div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        {/* Search tab */}
        <TabsContent value="search" className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search by display name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9 font-mono bg-background border-border"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={!searchInput.trim() || searchLoading}
              className="font-mono text-xs"
            >
              {searchLoading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </div>

          {searchTerm && (
            <div className="space-y-2">
              {searchLoading ? (
                SKELETON_KEYS.map((k) => (
                  <Skeleton key={k} className="h-16 rounded-xl" />
                ))
              ) : searchResults.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-6 text-center">
                  <p className="text-sm text-muted-foreground font-mono">
                    No users found for "{searchTerm}"
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {searchResults.map((user) => (
                    <motion.div
                      key={user.displayName}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <SearchResultCard
                        profile={user}
                        currentPrincipal={myPrincipalStr}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          )}

          {!searchTerm && (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <Search
                size={24}
                className="text-muted-foreground mx-auto mb-3"
              />
              <p className="text-sm font-semibold text-foreground mb-1">
                Find coders
              </p>
              <p className="text-xs text-muted-foreground">
                Search by display name to find and add friends
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
