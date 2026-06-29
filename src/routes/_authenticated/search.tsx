import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { searchPosts, searchFolders } from "@/lib/queries";
import { Search as SearchIcon, Folder, Hash } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { z } from "zod";

const searchSchema = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/_authenticated/search")({
  ssr: false,
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "Search — Stretchline" }] }),
  component: Search,
});

const TRENDING = ["frontsplits", "needle", "scorpion", "oversplits", "backbend", "middlesplits"];

function Search() {
  const initial = Route.useSearch().q ?? "";
  const [q, setQ] = useState(initial);
  useEffect(() => { setQ(initial); }, [initial]);
  const term = q.trim();
  const enabled = term.length >= 2;

  const { data: posts = [] } = useQuery({
    queryKey: ["search-posts", term],
    queryFn: () => searchPosts(term),
    enabled,
  });
  const { data: folders = [] } = useQuery({
    queryKey: ["search-folders", term],
    queryFn: () => searchFolders(term),
    enabled,
  });

  const tags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p: any) => {
      const m = (p.caption || "").match(/#[\p{L}0-9_]+/gu);
      m?.forEach((t: string) => set.add(t.toLowerCase()));
    });
    return Array.from(set).slice(0, 12);
  }, [posts]);

  return (
    <div className="px-5 pt-10 pb-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Search</h1>
      <p className="text-sm text-muted-foreground mt-1">Find goals, routines, and hashtags.</p>

      <div className="mt-5 relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try: front splits, scorpion, #needle"
          className="w-full rounded-2xl border border-border bg-surface-2 pl-11 pr-4 py-3 text-sm outline-none focus:border-ring"
        />
      </div>

      {!enabled && (
        <section className="mt-7">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Trending goals</div>
          <div className="flex flex-wrap gap-2">
            {TRENDING.map((t) => (
              <button key={t} onClick={() => setQ(t)}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs">
                <Hash className="h-3 w-3" />{t}
              </button>
            ))}
          </div>
        </section>
      )}

      {enabled && tags.length > 0 && (
        <section className="mt-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Matching hashtags</div>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <button key={t} onClick={() => setQ(t.replace(/^#/, ""))}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs">
                {t}
              </button>
            ))}
          </div>
        </section>
      )}

      {enabled && folders.length > 0 && (
        <section className="mt-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Goal folders</div>
          <div className="grid grid-cols-2 gap-3">
            {folders.map((f: any) => (
              <Link key={f.id} to="/folder/$folderId" params={{ folderId: f.id }}
                className="rounded-2xl border border-border bg-surface/50 p-3">
                <div className="flex items-center gap-2 text-sm font-semibold"><Folder className="h-3.5 w-3.5" />{f.name}</div>
                {f.description && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{f.description}</div>}
                <div className="text-[10px] text-muted-foreground mt-1">@{f.author?.username}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {enabled && posts.length > 0 && (
        <section className="mt-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Posts</div>
          <div className="grid grid-cols-3 gap-1.5">
            {posts.map((p: any) => (
              <Link key={p.id} to="/profile/$username" params={{ username: p.author?.username || "" }}
                className="aspect-square bg-surface-2 rounded-xl overflow-hidden">
                {p.kind === "video"
                  ? <video src={p.media_url} className="h-full w-full object-cover" muted />
                  : <img src={p.media_url} alt="" className="h-full w-full object-cover" />}
              </Link>
            ))}
          </div>
        </section>
      )}

      {enabled && posts.length === 0 && folders.length === 0 && (
        <div className="mt-8 text-center text-sm text-muted-foreground">No matches yet for "{term}".</div>
      )}
    </div>
  );
}
