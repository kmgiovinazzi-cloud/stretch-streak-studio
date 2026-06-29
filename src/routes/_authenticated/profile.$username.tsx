import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getProfileByUsername, getFoldersByUser, getUserPosts } from "@/lib/queries";
import { Flame } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile/$username")({
  ssr: false,
  component: UserProfile,
});

function UserProfile() {
  const { username } = Route.useParams();
  const { data: profile, isLoading } = useQuery({ queryKey: ["profile", username], queryFn: () => getProfileByUsername(username) });
  const { data: folders = [] } = useQuery({ queryKey: ["folders", profile?.id], queryFn: () => getFoldersByUser(profile!.id), enabled: !!profile });
  const { data: posts = [] } = useQuery({ queryKey: ["userPosts", profile?.id], queryFn: () => getUserPosts(profile!.id), enabled: !!profile });

  if (isLoading) return <div className="px-5 pt-10 text-sm text-muted-foreground">Loading…</div>;
  if (!profile) return <div className="px-5 pt-10 text-sm text-muted-foreground">User not found.</div>;

  return (
    <div className="px-5 pt-10 pb-8">
      <div className="flex items-start gap-4">
        <div className="h-20 w-20 rounded-3xl bg-gradient-primary shadow-glow flex items-center justify-center overflow-hidden">
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            : <span className="font-display text-2xl font-semibold text-primary-foreground">{profile.display_name?.[0]?.toUpperCase()}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-2xl font-semibold leading-tight truncate">{profile.display_name}</h1>
          <p className="text-sm text-muted-foreground">@{profile.username}{profile.country ? ` · ${profile.country}` : ""}</p>
          {profile.bio && <p className="mt-2 text-sm">{profile.bio}</p>}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-surface/50 p-4 text-center">
          <div className="font-display text-2xl font-semibold flex items-center justify-center gap-1"><Flame className="h-4 w-4 text-flame" />{profile.current_streak}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Streak</div>
        </div>
        <div className="rounded-2xl border border-border bg-surface/50 p-4 text-center">
          <div className="font-display text-2xl font-semibold">{profile.longest_streak}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Best</div>
        </div>
        <div className="rounded-2xl border border-border bg-surface/50 p-4 text-center">
          <div className="font-display text-2xl font-semibold">{profile.total_minutes}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Minutes</div>
        </div>
      </div>

      {folders.length > 0 && (
        <section className="mt-7">
          <h2 className="font-display text-lg font-semibold mb-3">Goal folders</h2>
          <div className="grid grid-cols-2 gap-3">
            {folders.map((f: any) => (
              <Link key={f.id} to="/folder/$folderId" params={{ folderId: f.id }}
                className="aspect-square rounded-3xl border border-border bg-gradient-surface overflow-hidden p-4 flex flex-col justify-end relative">
                {f.cover_url && <img src={f.cover_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="relative">
                  <div className="font-display text-lg font-semibold">{f.name}</div>
                  <div className="text-xs text-muted-foreground">{f.posts?.[0]?.count ?? 0} posts</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section className="mt-7">
          <h2 className="font-display text-lg font-semibold mb-3">Posts</h2>
          <div className="grid grid-cols-3 gap-1.5">
            {posts.map((p: any) => (
              <div key={p.id} className="aspect-square bg-surface-2 rounded-xl overflow-hidden">
                {p.kind === "video"
                  ? <video src={p.media_url} className="h-full w-full object-cover" muted />
                  : <img src={p.media_url} alt="" className="h-full w-full object-cover" />}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
