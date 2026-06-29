import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, Trophy, Users, Camera } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Stretchline — Daily stretch tracker for dancers" },
      { name: "description", content: "Build a stretch streak. Hit the worldwide leaderboard. Share progress on your splits, needle, scorpion and more." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-primary/25 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 h-[400px] w-[400px] rounded-full bg-flame/20 blur-[120px]" />
      </div>

      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-primary shadow-glow" />
          <span className="font-display text-lg font-semibold tracking-tight">Stretchline</span>
        </div>
        <Link
          to="/auth"
          className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-surface-2 transition-colors"
        >
          Sign in
        </Link>
      </nav>

      <main className="mx-auto max-w-6xl px-6 pt-12 pb-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            For dancers · skaters · gymnasts · cheer
          </div>
          <h1 className="mt-6 font-display text-5xl sm:text-7xl font-semibold tracking-tight leading-[1.02]">
            Hold the line.<br />
            <span className="text-gradient">Every single day.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            A daily stretch tracker, streak builder, and progress feed made for performers. Log today, climb the worldwide leaderboard, and watch your splits get closer to the floor.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/auth"
              className="rounded-full bg-gradient-primary px-7 py-3.5 font-medium text-primary-foreground shadow-glow"
            >
              Start your streak
            </Link>
            <Link
              to="/auth"
              className="rounded-full border border-border bg-surface/60 px-7 py-3.5 font-medium hover:bg-surface-2 transition-colors"
            >
              I already have an account
            </Link>
          </div>
        </div>

        <div className="mt-24 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Flame, title: "Streaks", body: "One stretch a day. Watch your number grow." },
            { icon: Trophy, title: "Leaderboard", body: "Top dancers worldwide, ranked by streak." },
            { icon: Camera, title: "Goal folders", body: "Front splits, needle, scorpion — track each one." },
            { icon: Users, title: "Social feed", body: "Photos and short routine videos from the community." },
          ].map((f) => (
            <div key={f.title} className="rounded-3xl border border-border bg-surface/40 p-6 backdrop-blur">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
                <f.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
