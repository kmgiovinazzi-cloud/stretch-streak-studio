import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyProfile, getMyFolders, getUserPosts, createFolder, updateMyProfile, uploadAvatar, getMyRoutines, createRoutine, deleteRoutine, uploadMedia, getTopRankedIds } from "@/lib/queries";
import { useRef, useState } from "react";
import { Camera, Flame, FolderPlus, ListChecks, Plus, Settings2, Trash2, Video, X, Check } from "lucide-react";
import { toast } from "sonner";
import { computeBadges, medalForRank, medalColor, MedalIcon, ALL_STYLES, stripEmoji } from "@/lib/badges";


export const Route = createFileRoute("/_authenticated/profile")({
  ssr: false,
  head: () => ({ meta: [{ title: "Profile — Stretchline" }] }),
  component: Profile,
});

function Profile() {
  const qc = useQueryClient();
  const { data: profile } = useQuery({ queryKey: ["me"], queryFn: getMyProfile });
  const { data: folders = [] } = useQuery({ queryKey: ["folders", profile?.id], queryFn: getMyFolders, enabled: !!profile });
  const { data: routines = [] } = useQuery({ queryKey: ["routines", profile?.id], queryFn: getMyRoutines, enabled: !!profile });
  const { data: posts = [] } = useQuery({ queryKey: ["myPosts", profile?.id], queryFn: () => getUserPosts(profile!.id), enabled: !!profile });
  const { data: topIds = [] } = useQuery({ queryKey: ["top3"], queryFn: () => getTopRankedIds(3) });


  const [showNewFolder, setShowNewFolder] = useState(false);
  const [showNewRoutine, setShowNewRoutine] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [folderName, setFolderName] = useState("");
  const [folderDesc, setFolderDesc] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const avatarMutation = useMutation({
    mutationFn: (file: File) => uploadAvatar(file),
    onSuccess: () => {
      toast.success("Profile photo updated");
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Upload failed"),
  });

  const addFolder = useMutation({
    mutationFn: () => createFolder(folderName, folderDesc || undefined),
    onSuccess: () => {
      toast.success("Folder created");
      setFolderName(""); setFolderDesc(""); setShowNewFolder(false);
      qc.invalidateQueries({ queryKey: ["folders"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  if (!profile) return <div className="px-5 pt-10 text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="px-5 pt-10 pb-8">
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => avatarInputRef.current?.click()}
          className="relative h-20 w-20 rounded-3xl bg-gradient-primary shadow-glow flex items-center justify-center overflow-hidden group"
          aria-label="Change profile photo"
        >
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            : <span className="font-display text-2xl font-semibold text-primary-foreground">{profile.display_name?.[0]?.toUpperCase()}</span>}
          <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="h-5 w-5 text-white" />
          </span>
          <span className="absolute bottom-1 right-1 rounded-full bg-background/90 border border-border p-1">
            <Camera className="h-3 w-3 text-foreground" />
          </span>
          {avatarMutation.isPending && (
            <span className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] text-white">Uploading…</span>
          )}
        </button>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) avatarMutation.mutate(f);
            e.target.value = "";
          }}
        />
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-2xl font-semibold leading-tight truncate">{profile.display_name}</h1>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
          {profile.bio && <p className="mt-2 text-sm">{profile.bio}</p>}
        </div>
        <button onClick={() => setShowSettings(true)} className="rounded-full border border-border p-2 text-muted-foreground hover:text-foreground">
          <Settings2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Stat label="Streak" value={profile.current_streak} icon={<Flame className="h-3.5 w-3.5 text-flame" />} />
        <Stat label="Minutes" value={profile.total_minutes} />
      </div>

      {/* Folders */}
      <section className="mt-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-semibold">Goal folders</h2>
          <button onClick={() => setShowNewFolder(true)} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs">
            <FolderPlus className="h-3.5 w-3.5" /> New
          </button>
        </div>
        {folders.length === 0 ? (
          <div className="rounded-3xl border border-border border-dashed bg-surface/40 p-8 text-center text-sm text-muted-foreground">
            Create a folder for each flexibility goal — Front Splits, Needle, Scorpion, Oversplits…
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {folders.map((f: any) => (
              <Link key={f.id} to="/folder/$folderId" params={{ folderId: f.id }}
                className="group relative aspect-square rounded-3xl border border-border bg-gradient-surface overflow-hidden p-4 flex flex-col justify-end hover:shadow-glow transition-shadow">
                {f.cover_url && <img src={f.cover_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="relative">
                  <div className="font-display text-lg font-semibold leading-tight">{f.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{f.posts?.[0]?.count ?? 0} posts</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Routines */}
      <section className="mt-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-semibold">Routines</h2>
          <button onClick={() => setShowNewRoutine(true)} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" /> New
          </button>
        </div>
        {routines.length === 0 ? (
          <div className="rounded-3xl border border-border border-dashed bg-surface/40 p-8 text-center text-sm text-muted-foreground">
            Save your stretch routines — upload a video or write out the steps as a list.
          </div>
        ) : (
          <div className="space-y-2">
            {routines.map((r: any) => (
              <RoutineCard key={r.id} routine={r} onDelete={() => qc.invalidateQueries({ queryKey: ["routines"] })} />
            ))}
          </div>
        )}
      </section>


      {/* My posts grid */}
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

      {/* New folder modal */}
      {showNewFolder && (
        <Modal onClose={() => setShowNewFolder(false)} title="New goal folder">
          <input value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="e.g. Front Splits"
            className="w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm outline-none focus:border-ring" />
          <textarea value={folderDesc} onChange={(e) => setFolderDesc(e.target.value)} placeholder="Optional description" rows={2}
            className="mt-3 w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm outline-none focus:border-ring resize-none" />
          <button onClick={() => addFolder.mutate()} disabled={!folderName.trim() || addFolder.isPending}
            className="mt-4 w-full rounded-2xl bg-gradient-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50">
            {addFolder.isPending ? "Creating…" : "Create folder"}
          </button>
        </Modal>
      )}

      {showNewRoutine && <NewRoutineModal onClose={() => setShowNewRoutine(false)} onSaved={() => qc.invalidateQueries({ queryKey: ["routines"] })} />}

      {showSettings && <ProfileSettings profile={profile} onClose={() => setShowSettings(false)} />}

    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/50 p-4 text-center">
      <div className="font-display text-2xl font-semibold">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-1 mt-1">{icon}{label}</div>
    </div>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-soft" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ProfileSettings({ profile, onClose }: { profile: any; onClose: () => void }) {
  const qc = useQueryClient();
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [country, setCountry] = useState(profile.country || "");
  const [discipline, setDiscipline] = useState(profile.discipline || "dancer");

  const m = useMutation({
    mutationFn: () => updateMyProfile({ display_name: displayName, bio, country, discipline }),
    onSuccess: () => {
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["me"] });
      onClose();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <Modal onClose={onClose} title="Edit profile">
      <div className="space-y-3">
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display name"
          className="w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm outline-none focus:border-ring" />
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Bio" rows={2}
          className="w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm outline-none focus:border-ring resize-none" />
        <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country (e.g. USA)"
          className="w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm outline-none focus:border-ring" />
        <select value={discipline} onChange={(e) => setDiscipline(e.target.value)}
          className="w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm outline-none focus:border-ring">
          <option value="dancer">Dancer</option>
          <option value="ice_skater">Ice Skater</option>
          <option value="gymnast">Gymnast</option>
          <option value="cheerleader">Cheerleader</option>
          <option value="other">Other</option>
        </select>
        <button onClick={() => m.mutate()} disabled={m.isPending}
          className="w-full rounded-2xl bg-gradient-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50">
          {m.isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </Modal>
  );
}

function RoutineCard({ routine, onDelete }: { routine: any; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const del = useMutation({
    mutationFn: () => deleteRoutine(routine.id),
    onSuccess: () => { toast.success("Routine deleted"); onDelete(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const Icon = routine.kind === "video" ? Video : ListChecks;
  return (
    <div className="rounded-2xl border border-border bg-surface/50 overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-3 p-4 text-left">
        <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{routine.title}</div>
          <div className="text-xs text-muted-foreground capitalize">{routine.kind}{routine.kind === "list" && routine.steps ? ` · ${routine.steps.length} steps` : ""}</div>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          {routine.description && <p className="text-sm text-muted-foreground">{routine.description}</p>}
          {routine.kind === "video" && routine.media_url && (
            <video src={routine.media_url} controls className="w-full rounded-xl bg-black" />
          )}
          {routine.kind === "list" && Array.isArray(routine.steps) && (
            <ol className="space-y-1.5 text-sm">
              {routine.steps.map((s: string, i: number) => (
                <li key={i} className="flex gap-2"><span className="text-muted-foreground w-5 shrink-0">{i + 1}.</span><span>{s}</span></li>
              ))}
            </ol>
          )}
          <button
            onClick={() => { if (confirm("Delete this routine?")) del.mutate(); }}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

function NewRoutineModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [kind, setKind] = useState<"video" | "list">("video");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [stepsText, setStepsText] = useState("");

  const m = useMutation({
    mutationFn: async () => {
      if (kind === "video") {
        if (!videoFile) throw new Error("Pick a video");
        const { publicUrl } = await uploadMedia(videoFile);
        await createRoutine({ kind: "video", title, description, mediaUrl: publicUrl });
      } else {
        const steps = stepsText.split("\n").map(s => s.trim()).filter(Boolean);
        if (steps.length === 0) throw new Error("Add at least one step");
        await createRoutine({ kind: "list", title, description, steps });
      }
    },
    onSuccess: () => { toast.success("Routine saved"); onSaved(); onClose(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <Modal onClose={onClose} title="New routine">
      <div className="flex gap-2 mb-3">
        <button onClick={() => setKind("video")}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl border px-3 py-2.5 text-sm ${kind === "video" ? "border-ring bg-surface-2" : "border-border"}`}>
          <Video className="h-4 w-4" /> Video
        </button>
        <button onClick={() => setKind("list")}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl border px-3 py-2.5 text-sm ${kind === "list" ? "border-ring bg-surface-2" : "border-border"}`}>
          <ListChecks className="h-4 w-4" /> List
        </button>
      </div>
      <div className="space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Routine title (e.g. Morning Splits)"
          className="w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm outline-none focus:border-ring" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" rows={2}
          className="w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm outline-none focus:border-ring resize-none" />
        {kind === "video" ? (
          <label className="block rounded-2xl border border-border border-dashed bg-surface/40 p-4 text-center text-sm text-muted-foreground cursor-pointer">
            <input type="file" accept="video/*" className="hidden"
              onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)} />
            {videoFile ? videoFile.name : "Tap to choose a video"}
          </label>
        ) : (
          <textarea value={stepsText} onChange={(e) => setStepsText(e.target.value)} rows={6}
            placeholder={"One step per line\nButterfly stretch — 1 min\nPike fold — 1 min\nSplit hold — 30s each side"}
            className="w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm outline-none focus:border-ring resize-none whitespace-pre-wrap" />
        )}
        <button onClick={() => m.mutate()} disabled={!title.trim() || m.isPending}
          className="w-full rounded-2xl bg-gradient-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50">
          {m.isPending ? "Saving…" : "Save routine"}
        </button>
      </div>
    </Modal>
  );
}

