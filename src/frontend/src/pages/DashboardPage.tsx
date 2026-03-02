import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ChefHat,
  Clock,
  Code2,
  Info,
  RefreshCw,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { PageHeader } from "../components/Layout";
import { useCallerProfile, useRefreshStats } from "../hooks/useQueries";
import { bn, formatRelativeTime } from "../utils/format";

function StatCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <Skeleton className="h-4 w-20 mb-3" />
      <Skeleton className="h-10 w-24 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

function DifficultyBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-mono uppercase tracking-wide">
          {label}
        </span>
        <span className="font-mono font-semibold text-foreground">
          {value}
          <span className="text-muted-foreground ml-1">({pct}%)</span>
        </span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function RingProgress({
  value,
  total,
  color,
  label,
  size = 80,
}: {
  value: number;
  total: number;
  color: string;
  label: string;
  size?: number;
}) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? value / total : 0;
  const strokeDashoffset = circumference * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          aria-label={`${label} progress ring`}
          role="img"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="oklch(0.22 0 0)"
            strokeWidth={6}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-sm font-bold text-foreground">
            {Math.round(pct * 100)}%
          </span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground font-mono uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const { data: profile, isLoading, error } = useCallerProfile();
  const refreshMutation = useRefreshStats();

  const handleRefresh = async () => {
    try {
      await refreshMutation.mutateAsync();
      toast.success("Stats refreshed successfully!");
    } catch {
      toast.error("Failed to refresh stats. Try again later.");
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex items-start justify-between mb-6">
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {["lc", "cc", "total", "friends"].map((k) => (
            <StatCardSkeleton key={k} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/30 rounded-xl p-4">
        <AlertCircle size={16} className="text-destructive" />
        <p className="text-sm text-destructive">Failed to load profile data.</p>
      </div>
    );
  }

  if (!profile) return null;

  const lcTotal = bn(profile.leetcodeStats.total);
  const lcEasy = bn(profile.leetcodeStats.easy);
  const lcMedium = bn(profile.leetcodeStats.medium);
  const lcHard = bn(profile.leetcodeStats.hard);
  const ccTotal = bn(profile.codechefStats.totalSolved);
  const combined = lcTotal + ccTotal;

  const hasLeetcode = !!profile.leetcodeUsername;
  const hasCodechef = !!profile.codechefUsername;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Hey ${profile.displayName} — here's your progress`}
        action={
          <Button
            onClick={handleRefresh}
            disabled={refreshMutation.isPending}
            size="sm"
            variant="outline"
            className="font-mono text-xs gap-2"
          >
            <RefreshCw
              size={13}
              className={refreshMutation.isPending ? "animate-spin" : ""}
            />
            {refreshMutation.isPending ? "Refreshing..." : "Refresh Stats"}
          </Button>
        }
      />

      {/* Missing username warnings */}
      {(!hasLeetcode || !hasCodechef) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-6 flex items-start gap-3"
        >
          <Info size={16} className="text-warning mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">
              Platform usernames missing
            </p>
            <p className="text-xs text-muted-foreground">
              {!hasLeetcode && "Add your LeetCode username "}
              {!hasLeetcode && !hasCodechef && "and "}
              {!hasCodechef && "add your CodeChef username "}
              to start tracking stats.{" "}
              <Link to="/profile" className="text-primary hover:underline">
                Update profile →
              </Link>
            </p>
          </div>
        </motion.div>
      )}

      {/* Last refreshed */}
      {profile.lastRefreshed > BigInt(0) && (
        <div className="flex items-center gap-2 mb-4">
          <Clock size={12} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-mono">
            Last synced: {formatRelativeTime(profile.lastRefreshed)}
          </span>
        </div>
      )}

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "LeetCode",
            value: lcTotal,
            icon: Code2,
            color: "text-leetcode",
            bg: "bg-leetcode/10",
            border: "border-leetcode/20",
            sub: `${lcEasy}E · ${lcMedium}M · ${lcHard}H`,
            delay: 0,
          },
          {
            label: "CodeChef",
            value: ccTotal,
            icon: ChefHat,
            color: "text-codechef",
            bg: "bg-codechef/10",
            border: "border-codechef/20",
            sub: "Total solved",
            delay: 0.07,
          },
          {
            label: "Combined",
            value: combined,
            icon: TrendingUp,
            color: "text-combined",
            bg: "bg-combined/10",
            border: "border-combined/20",
            sub: "Across all platforms",
            delay: 0.14,
          },
          {
            label: "Friends",
            value: profile.friends.length,
            icon: Trophy,
            color: "text-success",
            bg: "bg-success/10",
            border: "border-success/20",
            sub: "Connections",
            delay: 0.21,
          },
        ].map((card) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: card.delay }}
            className={`bg-card border ${card.border} rounded-xl p-5 card-interactive`}
          >
            <div
              className={`inline-flex items-center gap-1.5 ${card.bg} rounded-md px-2 py-1 mb-3`}
            >
              <card.icon size={12} className={card.color} />
              <span
                className={`font-mono text-[10px] uppercase tracking-wide ${card.color}`}
              >
                {card.label}
              </span>
            </div>
            <p className={`stat-number text-3xl font-bold ${card.color} mb-1`}>
              {card.value}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              {card.sub}
            </p>
          </motion.div>
        ))}
      </div>

      {/* LeetCode breakdown */}
      {hasLeetcode && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="grid md:grid-cols-2 gap-4 mb-4"
        >
          {/* Difficulty bars */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Code2 size={14} className="text-leetcode" />
              <h3 className="text-sm font-semibold text-foreground">
                LeetCode Breakdown
              </h3>
              <Badge
                variant="outline"
                className="ml-auto font-mono text-[10px] border-leetcode/30 text-leetcode"
              >
                {profile.leetcodeUsername}
              </Badge>
            </div>
            <div className="space-y-3">
              <DifficultyBar
                label="Easy"
                value={lcEasy}
                total={lcTotal}
                color="bg-success"
              />
              <DifficultyBar
                label="Medium"
                value={lcMedium}
                total={lcTotal}
                color="bg-warning"
              />
              <DifficultyBar
                label="Hard"
                value={lcHard}
                total={lcTotal}
                color="bg-destructive"
              />
            </div>
          </div>

          {/* Ring chart */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={14} className="text-combined" />
              <h3 className="text-sm font-semibold text-foreground">
                Platform Distribution
              </h3>
            </div>
            <div className="flex items-center justify-around py-2">
              <RingProgress
                value={lcTotal}
                total={combined || 1}
                color="oklch(0.72 0.19 55)"
                label="LeetCode"
              />
              <div className="text-center">
                <p className="stat-number text-4xl font-bold text-foreground">
                  {combined}
                </p>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  total solved
                </p>
              </div>
              <RingProgress
                value={ccTotal}
                total={combined || 1}
                color="oklch(0.62 0.12 30)"
                label="CodeChef"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick action */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="bg-card border border-border rounded-xl p-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Compare with friends
            </h3>
            <p className="text-xs text-muted-foreground">
              View the leaderboard and see how you stack up
            </p>
          </div>
          <Link to="/friends">
            <Button size="sm" variant="outline" className="font-mono text-xs">
              View Leaderboard →
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
