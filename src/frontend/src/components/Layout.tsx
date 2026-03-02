import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Code2,
  LayoutDashboard,
  LogOut,
  Menu,
  Terminal,
  User,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerProfile } from "../hooks/useQueries";
import { getInitials } from "../utils/format";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/friends", label: "Friends", icon: Users },
  { to: "/profile", label: "Profile", icon: User },
];

function NavLink({
  to,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  to: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link to={to} onClick={onClick}>
      <motion.div
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors relative group",
          active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary",
        )}
        whileHover={{ x: 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {active && (
          <motion.div
            layoutId="nav-indicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-full"
          />
        )}
        <Icon size={16} className={cn(active ? "text-primary" : "")} />
        <span className="font-mono text-xs tracking-wide uppercase">
          {label}
        </span>
      </motion.div>
    </Link>
  );
}

function SidebarContent({
  onClose,
  pathname,
}: {
  onClose?: () => void;
  pathname: string;
}) {
  const { clear, identity } = useInternetIdentity();
  const { data: profile } = useCallerProfile();

  const handleLogout = () => {
    clear();
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Terminal size={14} className="text-primary" />
          </div>
          <div>
            <p className="font-mono text-xs font-semibold text-foreground tracking-widest uppercase">
              Code
            </p>
            <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase leading-tight">
              Tracker
            </p>
          </div>
        </div>
      </div>

      {/* User info */}
      {identity && (
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-mono font-semibold text-primary">
              {profile ? getInitials(profile.displayName) : "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {profile?.displayName || "Anonymous"}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-success pulse-ring" />
                <p className="text-xs text-muted-foreground font-mono">
                  online
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            label={item.label}
            icon={item.icon}
            active={
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to)
            }
            onClick={onClose}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <div className="px-3 py-2">
          <p className="text-xs text-muted-foreground font-mono">
            <span className="text-primary">v1.0</span> · ICP canister
          </p>
        </div>
        {identity && (
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full"
          >
            <LogOut size={16} />
            <span className="font-mono text-xs tracking-wide uppercase">
              Sign Out
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

function MobileNav({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Top bar mobile */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Terminal size={12} className="text-primary" />
          </div>
          <span className="font-mono text-sm font-semibold text-foreground tracking-widest uppercase">
            Code Tracker
          </span>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Menu size={16} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-sidebar-border">
            <SidebarContent
              onClose={() => setOpen(false)}
              pathname={pathname}
            />
          </SheetContent>
        </Sheet>
      </header>

      {/* Bottom nav mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border flex md:hidden">
        {NAV_ITEMS.map((item) => {
          const active =
            item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link key={item.to} to={item.to} className="flex-1">
              <div
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon size={18} />
                <span className="font-mono text-[9px] uppercase tracking-wide">
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouterState();
  const pathname = router.location.pathname;

  return (
    <div className="min-h-screen bg-background grid-bg">
      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:w-56 md:flex md:flex-col z-40">
        <SidebarContent pathname={pathname} />
      </div>

      {/* Mobile nav */}
      <MobileNav pathname={pathname} />

      {/* Main content */}
      <main className="md:ml-56 min-h-screen pb-20 md:pb-8 pt-14 md:pt-0">
        <div className="px-4 md:px-6 lg:px-8 py-6 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start justify-between mb-6 gap-4"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-primary text-sm">{">"}</span>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            {title}
          </h1>
        </div>
        {subtitle && (
          <p className="text-sm text-muted-foreground font-mono ml-5">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </motion.div>
  );
}
