/**
 * Convert nanosecond timestamp (bigint) to a readable date string
 */
export function formatNanoTimestamp(ns: bigint): string {
  if (!ns || ns === BigInt(0)) return "Never";
  const ms = Number(ns / BigInt(1_000_000));
  const date = new Date(ms);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Convert nanosecond timestamp to relative time (e.g. "2 hours ago")
 */
export function formatRelativeTime(ns: bigint): string {
  if (!ns || ns === BigInt(0)) return "Never";
  const ms = Number(ns / BigInt(1_000_000));
  const now = Date.now();
  const diffMs = now - ms;

  if (diffMs < 0) return "Just now";
  if (diffMs < 60_000) return "Just now";
  if (diffMs < 3_600_000) {
    const mins = Math.floor(diffMs / 60_000);
    return `${mins}m ago`;
  }
  if (diffMs < 86_400_000) {
    const hours = Math.floor(diffMs / 3_600_000);
    return `${hours}h ago`;
  }
  const days = Math.floor(diffMs / 86_400_000);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return formatNanoTimestamp(ns);
}

/**
 * Safely convert bigint to number for display
 */
export function bn(val: bigint | undefined | null): number {
  if (val === undefined || val === null) return 0;
  return Number(val);
}

/**
 * Get initials from a display name
 */
export function getInitials(name: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

/**
 * Calculate total solved across both platforms
 */
export function totalSolved(profile: {
  leetcodeStats: { total: bigint };
  codechefStats: { totalSolved: bigint };
}): number {
  return (
    bn(profile.leetcodeStats.total) + bn(profile.codechefStats.totalSolved)
  );
}

/**
 * Format a number with commas
 */
export function formatNumber(n: number): string {
  return n.toLocaleString();
}

/**
 * Get a short principal string
 */
export function shortPrincipal(principal: string): string {
  if (principal.length <= 12) return principal;
  return `${principal.slice(0, 6)}...${principal.slice(-4)}`;
}
