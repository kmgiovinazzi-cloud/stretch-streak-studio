import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({ meta: [{ title: "Sign in — Stretchline" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/home", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Account created. Welcome!");
        navigate({ to: "/home", replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/home", replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleOAuth(provider: "google" | "apple") {
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin + "/auth",
    });
    if (result.error) {
      toast.error(result.error.message || `${provider} sign-in failed`);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/home", replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
      </div>
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-xl bg-gradient-primary shadow-glow" />
          <span className="font-display text-xl font-semibold">Stretchline</span>
        </Link>

        <div className="rounded-3xl border border-border bg-surface/60 p-7 backdrop-blur shadow-soft">
          <h1 className="font-display text-2xl font-semibold">
            {mode === "signup" ? "Start your streak" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signup" ? "Free forever. Takes 10 seconds." : "Sign in to log today's stretch."}
          </p>

          <button
            type="button"
            onClick={() => handleOAuth("google")}
            className="mt-6 w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm font-medium hover:bg-surface transition-colors flex items-center justify-center gap-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1H12v3.2h5.35c-.23 1.4-1.7 4.1-5.35 4.1-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.7 3.96 14.6 3 12 3 6.92 3 2.8 7.13 2.8 12.25S6.92 21.5 12 21.5c6.92 0 9.5-4.86 9.5-9.36 0-.63-.07-1.04-.15-1.04Z"/></svg>
            Continue with Google
          </button>
          <button
            type="button"
            onClick={() => handleOAuth("apple")}
            className="mt-2 w-full rounded-2xl border border-border bg-foreground text-background px-4 py-3 text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M16.365 1.43c0 1.14-.46 2.27-1.22 3.08-.82.88-2.16 1.55-3.27 1.45-.14-1.1.42-2.27 1.16-3.04.82-.86 2.22-1.51 3.33-1.49ZM20.5 17.5c-.55 1.28-.82 1.85-1.53 2.98-.99 1.58-2.39 3.55-4.12 3.56-1.54.02-1.94-1-4.03-1-2.09 0-2.53 1.02-4.07.99C5.02 23.98 3.7 22.2 2.71 20.62 0 16.5.7 11.7 2.6 9.32c1.34-1.67 3.46-2.65 5.46-2.65 2.04 0 3.32 1.13 5 1.13 1.63 0 2.62-1.13 4.98-1.13 1.78 0 3.68.97 5.03 2.65-4.43 2.43-3.71 8.78-2.57 8.18Z"/></svg>
            Continue with Apple
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display name"
                className="w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm outline-none focus:border-ring"
              />
            )}
            <input
              type="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm outline-none focus:border-ring"
            />
            <input
              type="password" required minLength={6}
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 chars)"
              className="w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm outline-none focus:border-ring"
            />
            <button
              type="submit" disabled={busy}
              className="w-full rounded-2xl bg-gradient-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
            >
              {busy ? "..." : mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            className="mt-5 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {mode === "signup" ? "Have an account? Sign in" : "New here? Create an account"}
          </button>
        </div>

        <p className="mt-5 text-center text-[11px] text-muted-foreground">
          By continuing you agree to our{" "}
          <Link to="/terms" className="underline hover:text-foreground">Terms</Link> and{" "}
          <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
