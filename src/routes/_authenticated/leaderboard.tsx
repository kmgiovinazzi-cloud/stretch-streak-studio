import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getLeaderboard } from "@/lib/queries";
import { Flame, Trophy } from "lucide-react";
import { medalForRank, medalColor, MedalIcon } from "@/lib/badges";

export const Route = createFileRoute("/_authenticated/leaderboard")({
  ssr: false,
  head: () => ({ meta: [{ title: "Leaderboard — Stretchline" }] }),
  component: Leaderboard,
});

function Leaderboard() {
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["leaderboard"], queryFn: () => getLeaderboard(100) });

  return (
    <div className="px-5 pt-10 pb-8">
      <header className="mb-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <Trophy className="h-3.5 w-3.5" /> Global ranks
        </div>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Worldwide</h1>
        <p className="text-sm text-muted-foreground mt-1">Top 3 earn a medal next to their name.</p>
      </header>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}

      <div className="rounded-3xl border border-border bg-surface/50 overflow-hidden">
        {rows.map((r, i) => {
          const medal = medalForRank(i + 1);
          return (
            <Link
              key={r.id}
              to="/profile/$username"
              params={{ username: r.username }}
              className="flex items-center gap-4 px-4 py-3.5 border-b border-border last:border-0 hover:bg-surface-2 transition-colors"
            >
              <div className={`w-7 text-center font-display text-sm font-semibold ${i < 3 ? "text-flame" : "text-muted-foreground"}`}>
                {i + 1}
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-primary shadow-glow flex items-center justify-center overflow-hidden">
                {r.avatar_url
                  ? <img src={r.avatar_url} alt="" className="h-full w-full object-cover" />
                  : <span className="font-display font-semibold text-primary-foreground">{r.display_name?.[0]?.toUpperCase()}</span>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold leading-tight truncate flex items-center gap-1.5">
                  {r.display_name}
                  {medal && <MedalIcon className={`h-4 w-4 ${medalColor[medal]}`} aria-label={`${medal} medal`} />}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  @{r.username}{r.country ? ` · ${r.country}` : ""} · {r.discipline?.replace("_", " ")}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end font-display font-semibold">
                  <Flame className="h-3.5 w-3.5 text-flame" />
                  {r.current_streak}
                </div>
                <div className="text-[10px] text-muted-foreground">{r.total_minutes} min</div>
              </div>
            </Link>
          );
        })}
        {!isLoading && rows.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">No rankings yet. Log a stretch to appear.</div>
        )}
      </div>
    </div>
  );
}
