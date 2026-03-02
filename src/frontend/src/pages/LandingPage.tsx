import { Button } from "@/components/ui/button";
import { Code2, Loader2, Terminal, Trophy, Users, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const FEATURES = [
  {
    icon: Code2,
    label: "LeetCode & CodeChef",
    desc: "Track solved problems across both platforms in one place",
  },
  {
    icon: Users,
    label: "Friend Leaderboard",
    desc: "Compare progress with friends and stay motivated",
  },
  {
    icon: Trophy,
    label: "Difficulty Breakdown",
    desc: "See easy, medium, and hard problem stats at a glance",
  },
  {
    icon: Zap,
    label: "Live Stats Refresh",
    desc: "Sync latest data from coding platforms on demand",
  },
];

const CODE_LINES = [
  { prefix: "$", text: "fetch leetcode --user=you", color: "text-foreground" },
  {
    prefix: ">",
    text: "solved: 423 (easy: 180, med: 210, hard: 33)",
    color: "text-primary",
  },
  { prefix: "$", text: "fetch codechef --user=you", color: "text-foreground" },
  { prefix: ">", text: "solved: 156", color: "text-success" },
  { prefix: "$", text: "leaderboard --friends", color: "text-foreground" },
  { prefix: ">", text: "#1 you — 579 total", color: "text-primary" },
  { prefix: ">", text: "#2 alice — 512 total", color: "text-muted-foreground" },
  { prefix: ">", text: "#3 bob — 487 total", color: "text-muted-foreground" },
];

export default function LandingPage() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-background grid-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Terminal size={14} className="text-primary" />
            </div>
            <span className="font-mono text-sm font-semibold tracking-widest uppercase">
              Code Progress Tracker
            </span>
          </div>
          <Button
            onClick={login}
            disabled={isLoggingIn || isInitializing}
            size="sm"
            className="font-mono text-xs tracking-wide"
          >
            {isLoggingIn ? (
              <Loader2 size={14} className="animate-spin mr-2" />
            ) : null}
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-5xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-primary pulse-ring" />
              <span className="font-mono text-xs text-primary">
                LeetCode + CodeChef tracker
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
              Your coding
              <br />
              <span className="text-primary">progress,</span>
              <br />
              unified.
            </h1>

            <p className="text-muted-foreground text-base mb-8 max-w-md leading-relaxed">
              Track your competitive programming journey across LeetCode and
              CodeChef. Compare with friends. Stay on top of your game.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={login}
                disabled={isLoggingIn || isInitializing}
                size="lg"
                className="font-mono text-sm tracking-wide glow-orange-sm"
              >
                {isLoggingIn || isInitializing ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : null}
                {isInitializing
                  ? "Initializing..."
                  : isLoggingIn
                    ? "Signing in..."
                    : "Get Started →"}
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 mt-10">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
                  className="bg-card border border-border rounded-lg p-3"
                >
                  <f.icon size={14} className="text-primary mb-1.5" />
                  <p className="text-xs font-semibold text-foreground mb-0.5">
                    {f.label}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Terminal mockup */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden lg:block"
          >
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xl">
              {/* Terminal title bar */}
              <div className="bg-secondary/50 px-4 py-3 flex items-center gap-2 border-b border-border">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
                <span className="ml-3 font-mono text-xs text-muted-foreground">
                  code-tracker ~ terminal
                </span>
              </div>

              {/* Terminal content */}
              <div className="p-5 font-mono text-sm space-y-2">
                {CODE_LINES.map((line, i) => (
                  <motion.div
                    key={line.text}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 + i * 0.12, duration: 0.3 }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-primary flex-shrink-0">
                      {line.prefix}
                    </span>
                    <span className={line.color}>{line.text}</span>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{
                    delay: 2.5,
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                  }}
                  className="flex items-center gap-2"
                >
                  <span className="text-primary">$</span>
                  <span className="w-2 h-4 bg-primary inline-block" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs text-muted-foreground font-mono">
            © {new Date().getFullYear()}. Built with ♥ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
