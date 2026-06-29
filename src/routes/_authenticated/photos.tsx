import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getPhotosFeed } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/photos")({
  ssr: false,
  head: () => ({ meta: [{ title: "Photos — Stretchline" }] }),
  component: Photos,
});

function Photos() {
  const { data: posts = [], isLoading } = useQuery({ queryKey: ["photos-feed"], queryFn: () => getPhotosFeed(120) });

  return (
    <div className="px-5 pt-10 pb-8">
      <header className="mb-5">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Photos</h1>
        <p className="text-sm text-muted-foreground mt-1">A grid of progress shots from the community.</p>
      </header>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}

      {!isLoading && posts.length === 0 && (
        <div className="rounded-3xl border border-border bg-surface/50 p-10 text-center text-sm text-muted-foreground">
          No photos yet. Share your first progress shot.
        </div>
      )}

      <div className="grid grid-cols-3 gap-1.5">
        {posts.map((p: any) => (
          <Link
            key={p.id}
            to="/profile/$username"
            params={{ username: p.author?.username || "" }}
            className="relative aspect-square bg-surface-2 rounded-xl overflow-hidden group"
          >
            <img src={p.media_url} alt={p.caption || ""} className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="text-[10px] text-white truncate">@{p.author?.username}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
