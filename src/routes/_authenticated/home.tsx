import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyProfile, getRecentLogs, logStretch } from "@/lib/queries";
import { useState } from "react";
import { Flame, Clock, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/home")({
  ssr: false,
  head: () => ({ meta: [{ title: "Today — Stretchline" }] }),
  component: Today,
});

function Today() {
  const qc = useQueryClient();
  const { data: profile } = useQuery({ queryKey: ["me"], queryFn: getMyProfile });
  const { data: logs = [] } = useQuery({
    queryKey: ["logs", profile?.id],
    queryFn: () => getRecentLogs(profile!.id, 30),
    enabled: !!profile,
  });

  const today = new Date().toISOString().slice(0, 10);
  const loggedToday = logs.some((l) => l.log_date === today);

  const [minutes, setMinutes] = useState(15);
  const [notes, setNotes] = useState("");

  const mutation = useMutation({
    mutationFn: () => logStretch(minutes, notes || undefined),
    onSuccess: () => {
      toast.success("Logged. Streak alive.");
      setNotes("");
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["logs"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  // Build last 7 days grid
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().slice(0, 10);
    return { iso, label: d.toLocaleDateString(undefined, { weekday: "narrow" }), done: logs.some((l) => l.log_date === iso) };
  });

  return (
    <div className="px-5 pt-10 pb-8">
      <header className="mb-7">
        <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          Hey, {profile?.display_name?.split(" ")[0] || "dancer"}.
        </h1>
      </header>

      {/* Streak card */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-surface p-6 shadow-soft">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-flame/30 blur-3xl" />
        <div className="flex items-start justify-between relative">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Flame className="h-3.5 w-3.5" /> Current streak
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-6xl font-semibold leading-none">{profile?.current_streak ?? 0}</span>
              <span className="text-sm text-muted-foreground">days</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Longest {profile?.longest_streak ?? 0} · {profile?.total_minutes ?? 0} min total
            </p>
          </div>
          <div className="h-16 w-16 rounded-2xl bg-gradient-flame shadow-glow flex items-center justify-center">
            <Flame className="h-7 w-7 text-primary-foreground" />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-2 relative">
          {days.map((d) => (
            <div key={d.iso} className="text-center">
              <div className={`mx-auto h-9 w-9 rounded-xl flex items-center justify-center text-[10px] font-semibold ${d.done ? "bg-gradient-primary shadow-glow text-primary-foreground" : "bg-surface-2 text-muted-foreground"}`}>
                {d.done ? "✓" : ""}
              </div>
              <div className="mt-1 text-[10px] text-muted-foreground">{d.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Log today */}
      <section className="mt-6 rounded-3xl border border-border bg-surface/60 p-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          {loggedToday ? "Logged today" : "Log today's stretch"}
        </div>

        {!loggedToday ? (
          <>
            <div className="mt-4">
              <label className="text-xs text-muted-foreground flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Duration</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {[5, 10, 15, 20, 30, 45, 60].map((m) => (
                  <button key={m} type="button" onClick={() => setMinutes(m)}
                    className={`rounded-full px-4 py-2 text-sm font-medium border transition-colors ${minutes === m ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow" : "border-border bg-surface-2 text-muted-foreground hover:text-foreground"}`}>
                    {m}m
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you work on? (splits, needle, oversplits…)"
              rows={2}
              className="mt-4 w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm outline-none focus:border-ring resize-none"
            />
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="mt-4 w-full rounded-2xl bg-gradient-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
            >
              {mutation.isPending ? "Logging…" : `Log ${minutes} minutes`}
            </button>
          </>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">Beautiful. Come back tomorrow to keep the streak alive.</p>
        )}
      </section>

      {/* Recent */}
      {logs.length > 0 && (
        <section className="mt-6">
          <h2 className="font-display text-lg font-semibold mb-3">Recent sessions</h2>
          <div className="space-y-2">
            {logs.slice(0, 7).map((l) => (
              <div key={l.log_date} className="flex items-center justify-between rounded-2xl border border-border bg-surface/50 px-4 py-3">
                <div>
                  <div className="text-sm font-medium">{new Date(l.log_date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</div>
                  {l.notes && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{l.notes}</div>}
                </div>
                <div className="text-sm font-display font-semibold">{l.duration_minutes}m</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
