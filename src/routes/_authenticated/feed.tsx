import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFeed, toggleLike } from "@/lib/queries";
import { Heart, Folder } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/feed")({
  ssr: false,
  head: () => ({ meta: [{ title: "Feed — Stretchline" }] }),
  component: Feed,
});

function Feed() {
  const { data: posts = [], isLoading } = useQuery({ queryKey: ["feed"], queryFn: () => getFeed(50) });

  return (
    <div className="px-5 pt-10 pb-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Feed</h1>
        <p className="text-sm text-muted-foreground mt-1">Progress from dancers around the world.</p>
      </header>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}

      {!isLoading && posts.length === 0 && (
        <div className="rounded-3xl border border-border bg-surface/50 p-10 text-center">
          <p className="text-sm text-muted-foreground">No posts yet. Be the first to share progress.</p>
          <Link to="/compose" className="mt-4 inline-block rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow">
            Share a post
          </Link>
        </div>
      )}

      <div className="space-y-5">
        {posts.map((p: any) => <PostCard key={p.id} post={p} />)}
      </div>
    </div>
  );
}

function PostCard({ post }: { post: any }) {
  const qc = useQueryClient();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(post.like_count ?? 0);

  const m = useMutation({
    mutationFn: () => toggleLike(post.id),
    onMutate: () => {
      setLiked((l) => !l);
      setCount((c: number) => c + (liked ? -1 : 1));
    },
    onError: () => {
      setLiked((l) => !l);
      setCount((c: number) => c + (liked ? 1 : -1));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feed"] }),
  });

  const author = post.profiles;
  return (
    <article className="rounded-3xl border border-border bg-surface/50 overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <Link to="/profile/$username" params={{ username: author?.username || "" }} className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-primary shadow-glow overflow-hidden flex items-center justify-center">
            {author?.avatar_url
              ? <img src={author.avatar_url} alt="" className="h-full w-full object-cover" />
              : <span className="font-display font-semibold text-primary-foreground">{author?.display_name?.[0]?.toUpperCase() ?? "?"}</span>}
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">{author?.display_name}</div>
            <div className="text-xs text-muted-foreground">@{author?.username}</div>
          </div>
        </Link>
        {post.goal_folders?.name && (
          <Link to="/folder/$folderId" params={{ folderId: post.folder_id }}
            className="ml-auto inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Folder className="h-3 w-3" /> {post.goal_folders.name}
          </Link>
        )}
      </div>

      <div className="bg-black/40 aspect-square w-full overflow-hidden">
        {post.kind === "video" ? (
          <video src={post.media_url} controls playsInline className="h-full w-full object-cover" />
        ) : (
          <img src={post.media_url} alt={post.caption || ""} className="h-full w-full object-cover" />
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => m.mutate()} className="flex items-center gap-1.5 text-sm">
            <Heart className={`h-5 w-5 transition-colors ${liked ? "fill-destructive text-destructive" : "text-foreground"}`} />
            <span className="font-medium">{count}</span>
          </button>
        </div>
        {post.caption && <p className="mt-2 text-sm leading-relaxed">{post.caption}</p>}
        <p className="mt-1 text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</p>
      </div>
    </article>
  );
}
