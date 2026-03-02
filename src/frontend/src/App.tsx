import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Layout } from "./components/Layout";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useCallerProfile } from "./hooks/useQueries";
import DashboardPage from "./pages/DashboardPage";
import FriendsPage from "./pages/FriendsPage";
import LandingPage from "./pages/LandingPage";
import OnboardingPage from "./pages/OnboardingPage";
import ProfilePage from "./pages/ProfilePage";

// ── Root with auth guard ────────────────────────────────────────────────────
function RootComponent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useCallerProfile();

  if (isInitializing || (identity && profileLoading)) {
    return (
      <div className="min-h-screen bg-background grid-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Loader2 size={18} className="text-primary animate-spin" />
          </div>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            Initializing...
          </p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <>
        <LandingPage />
        <Toaster theme="dark" position="bottom-right" />
      </>
    );
  }

  if (identity && profile === null && !profileLoading) {
    return (
      <>
        <OnboardingPage />
        <Toaster theme="dark" position="bottom-right" />
      </>
    );
  }

  return (
    <>
      <Layout>
        <Outlet />
      </Layout>
      <Toaster theme="dark" position="bottom-right" />
    </>
  );
}

// ── Routes ──────────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: RootComponent,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

const friendsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/friends",
  component: FriendsPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  friendsRoute,
  profileRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
