import { createFileRoute, Outlet, redirect, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Home, Compass, Trophy, User, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedShell,
});

function AuthedShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const tabs: { to: string; label: string; icon: typeof Home; primary?: boolean }[] = [
    { to: "/home", label: "Today", icon: Home },
    { to: "/feed", label: "Explore", icon: Compass },
    { to: "/compose", label: "", icon: Plus, primary: true },
    { to: "/leaderboard", label: "Ranks", icon: Trophy },
    { to: "/profile", label: "Profile", icon: User },
  ];


  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-2xl">
        <Outlet />
      </div>

      <nav className="fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-2xl px-4 pb-3">
          <div className="glass rounded-full border border-border shadow-soft flex items-center justify-around px-2 py-2">
            {tabs.map(({ to, label, icon: Icon, primary }) => {
              const active = pathname === to || (to !== "/home" && pathname.startsWith(to));
              if (primary) {
                return (
                  <Link key={to} to={to} className="flex flex-col items-center -mt-6">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary shadow-glow">
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </span>
                  </Link>
                );
              }
              return (
                <Link
                  key={to} to={to}
                  className={`flex flex-col items-center gap-0.5 rounded-full px-2 py-2 transition-colors ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[9px] font-medium hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Tiny sign-out top-right */}
      <button
        onClick={signOut}
        className="fixed top-4 right-4 z-30 rounded-full border border-border bg-surface/70 backdrop-blur px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        Sign out
      </button>
    </div>
  );
}
