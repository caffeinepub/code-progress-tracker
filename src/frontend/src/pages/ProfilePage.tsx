import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChefHat,
  Code2,
  ExternalLink,
  Key,
  Loader2,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { PageHeader } from "../components/Layout";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCallerProfile,
  useRegisterOrUpdateProfile,
} from "../hooks/useQueries";
import { bn, formatNanoTimestamp, shortPrincipal } from "../utils/format";

interface ProfileFormData {
  displayName: string;
  leetcodeUsername: string;
  codechefUsername: string;
}

export default function ProfilePage() {
  const { data: profile, isLoading } = useCallerProfile();
  const { identity } = useInternetIdentity();
  const mutation = useRegisterOrUpdateProfile();
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>();

  useEffect(() => {
    if (profile) {
      reset({
        displayName: profile.displayName,
        leetcodeUsername: profile.leetcodeUsername,
        codechefUsername: profile.codechefUsername,
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await mutation.mutateAsync({
        displayName: data.displayName.trim(),
        leetcodeUsername: data.leetcodeUsername.trim(),
        codechefUsername: data.codechefUsername.trim(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const principalStr = identity?.getPrincipal().toString() ?? "";

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Profile"
        subtitle="Manage your account and platform connections"
      />

      <div className="space-y-4">
        {/* Profile form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <User size={14} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">
              Account Details
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">
            {/* Display name */}
            <div className="space-y-1.5">
              <Label className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                Display Name
              </Label>
              <Input
                {...register("displayName", {
                  required: "Display name is required",
                })}
                placeholder="Your name"
                className="font-mono bg-background border-border focus:border-primary/50"
              />
              {errors.displayName && (
                <p className="text-xs text-destructive font-mono">
                  {errors.displayName.message}
                </p>
              )}
            </div>

            <Separator className="bg-border/50" />

            {/* LeetCode */}
            <div className="space-y-1.5">
              <Label className="font-mono text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Code2 size={11} className="text-leetcode" />
                LeetCode Username
              </Label>
              <div className="flex gap-2">
                <Input
                  {...register("leetcodeUsername")}
                  placeholder="your-leetcode-username"
                  className="font-mono bg-background border-border focus:border-leetcode/40 flex-1"
                />
                {profile?.leetcodeUsername && (
                  <a
                    href={`https://leetcode.com/${profile.leetcodeUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 flex-shrink-0"
                    >
                      <ExternalLink size={13} />
                    </Button>
                  </a>
                )}
              </div>
              {profile?.leetcodeStats && profile.leetcodeUsername && (
                <div className="flex items-center gap-3 mt-2 p-2.5 bg-leetcode/5 border border-leetcode/15 rounded-lg">
                  <Code2 size={12} className="text-leetcode" />
                  <div className="flex gap-4 text-xs font-mono">
                    <span className="text-foreground">
                      <span className="text-leetcode font-semibold">
                        {bn(profile.leetcodeStats.total)}
                      </span>{" "}
                      total
                    </span>
                    <span className="text-success">
                      {bn(profile.leetcodeStats.easy)} easy
                    </span>
                    <span className="text-warning">
                      {bn(profile.leetcodeStats.medium)} medium
                    </span>
                    <span className="text-destructive">
                      {bn(profile.leetcodeStats.hard)} hard
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* CodeChef */}
            <div className="space-y-1.5">
              <Label className="font-mono text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <ChefHat size={11} className="text-codechef" />
                CodeChef Username
              </Label>
              <div className="flex gap-2">
                <Input
                  {...register("codechefUsername")}
                  placeholder="your-codechef-username"
                  className="font-mono bg-background border-border focus:border-codechef/40 flex-1"
                />
                {profile?.codechefUsername && (
                  <a
                    href={`https://www.codechef.com/users/${profile.codechefUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 flex-shrink-0"
                    >
                      <ExternalLink size={13} />
                    </Button>
                  </a>
                )}
              </div>
              {profile?.codechefStats && profile.codechefUsername && (
                <div className="flex items-center gap-3 mt-2 p-2.5 bg-codechef/5 border border-codechef/15 rounded-lg">
                  <ChefHat size={12} className="text-codechef" />
                  <span className="text-xs font-mono text-foreground">
                    <span className="text-codechef font-semibold">
                      {bn(profile.codechefStats.totalSolved)}
                    </span>{" "}
                    problems solved
                  </span>
                </div>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={mutation.isPending || !isDirty}
              className="w-full font-mono text-xs tracking-wide"
            >
              {mutation.isPending ? (
                <Loader2 size={14} className="animate-spin mr-2" />
              ) : saved ? (
                <span className="text-success mr-2">✓</span>
              ) : (
                <Save size={14} className="mr-2" />
              )}
              {mutation.isPending
                ? "Saving..."
                : saved
                  ? "Saved!"
                  : "Save Changes"}
            </Button>
          </form>
        </motion.div>

        {/* Account info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <ShieldCheck size={14} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Identity</h2>
          </div>

          <div className="p-5 space-y-4">
            {/* Principal */}
            <div>
              <Label className="font-mono text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                <Key size={11} />
                Principal ID
              </Label>
              <div className="flex items-center gap-2 p-2.5 bg-secondary/50 rounded-lg border border-border">
                <code className="text-xs font-mono text-foreground flex-1 break-all">
                  {principalStr || "—"}
                </code>
                {principalStr && (
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] flex-shrink-0"
                  >
                    ICP
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-1.5">
                Your unique Internet Computer identity
              </p>
            </div>

            {/* Last refreshed */}
            {profile?.lastRefreshed && profile.lastRefreshed > BigInt(0) && (
              <div>
                <Label className="font-mono text-xs uppercase tracking-wide text-muted-foreground mb-2 block">
                  Last Stats Sync
                </Label>
                <p className="text-xs font-mono text-foreground">
                  {formatNanoTimestamp(profile.lastRefreshed)}
                </p>
              </div>
            )}

            {/* Friends count */}
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <span className="text-xs text-muted-foreground font-mono">
                Friends
              </span>
              <span className="text-xs font-mono font-semibold text-foreground">
                {profile?.friends.length ?? 0} connections
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
