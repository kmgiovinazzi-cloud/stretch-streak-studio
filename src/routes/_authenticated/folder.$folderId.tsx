import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getFolder, getFolderPosts } from "@/lib/queries";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/folder/$folderId")({
  ssr: false,
  component: FolderView,
});

function FolderView() {
  const { folderId } = Route.useParams();
  const { data: folder } = useQuery({ queryKey: ["folder", folderId], queryFn: () => getFolder(folderId) });
  const { data: posts = [] } = useQuery({ queryKey: ["folderPosts", folderId], queryFn: () => getFolderPosts(folderId) });

  if (!folder) return <div className="px-5 pt-10 text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="px-5 pt-10 pb-8">
      <Link to="/profile" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="font-display text-3xl font-semibold tracking-tight">{folder.name}</h1>
      {folder.description && <p className="text-sm text-muted-foreground mt-1">{folder.description}</p>}
      <p className="text-xs text-muted-foreground mt-1">by @{folder.profiles?.username} · {posts.length} posts</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {posts.map((p) => (
          <div key={p.id} className="rounded-2xl overflow-hidden border border-border bg-surface/50">
            <div className="aspect-square bg-black/40">
              {p.kind === "video"
                ? <video src={p.media_url} controls playsInline className="h-full w-full object-cover" />
                : <img src={p.media_url} alt={p.caption || ""} className="h-full w-full object-cover" />}
            </div>
            {p.caption && <p className="px-3 py-2 text-xs line-clamp-2">{p.caption}</p>}
            <p className="px-3 pb-2 text-[10px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</p>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="col-span-2 rounded-3xl border border-dashed border-border bg-surface/40 p-8 text-center text-sm text-muted-foreground">
            No posts in this folder yet.
          </div>
        )}
      </div>
    </div>
  );
}
