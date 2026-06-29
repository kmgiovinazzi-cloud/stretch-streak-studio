import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyFolders, uploadMedia, createPost } from "@/lib/queries";
import { useState } from "react";
import { ImagePlus, Video, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/compose")({
  ssr: false,
  head: () => ({ meta: [{ title: "New post — Stretchline" }] }),
  component: Compose,
});

function Compose() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: folders = [] } = useQuery({ queryKey: ["folders"], queryFn: getMyFolders });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [folderId, setFolderId] = useState<string>("");

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 50 * 1024 * 1024) {
      toast.error("Max 50MB");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  const m = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Pick a photo or video first");
      const { publicUrl } = await uploadMedia(file);
      const kind: "photo" | "video" = file.type.startsWith("video") ? "video" : "photo";
      await createPost({ kind, mediaUrl: publicUrl, caption: caption || undefined, folderId: folderId || null });
    },
    onSuccess: () => {
      toast.success("Posted");
      qc.invalidateQueries({ queryKey: ["feed"] });
      qc.invalidateQueries({ queryKey: ["myPosts"] });
      qc.invalidateQueries({ queryKey: ["folders"] });
      qc.invalidateQueries({ queryKey: ["folderPosts"] });
      navigate({ to: "/feed" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const isVideo = file?.type.startsWith("video");

  return (
    <div className="px-5 pt-10 pb-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Share progress</h1>
      <p className="text-sm text-muted-foreground mt-1">Photo or short video — splits check, scorpion, routine clip.</p>

      <div className="mt-6 rounded-3xl border border-border bg-surface/50 p-4">
        {preview ? (
          <div className="relative rounded-2xl overflow-hidden bg-black/50 aspect-square">
            {isVideo
              ? <video src={preview} controls playsInline className="h-full w-full object-contain" />
              : <img src={preview} alt="" className="h-full w-full object-contain" />}
            <button onClick={() => { setFile(null); setPreview(""); }}
              className="absolute top-3 right-3 rounded-full bg-background/80 p-2 backdrop-blur">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <label className="aspect-square rounded-2xl border border-dashed border-border bg-surface-2 flex flex-col items-center justify-center cursor-pointer hover:bg-surface transition-colors">
              <ImagePlus className="h-8 w-8 text-muted-foreground" />
              <span className="mt-2 text-sm font-medium">Photo</span>
              <input type="file" accept="image/*" onChange={onPick} className="hidden" />
            </label>
            <label className="aspect-square rounded-2xl border border-dashed border-border bg-surface-2 flex flex-col items-center justify-center cursor-pointer hover:bg-surface transition-colors">
              <Video className="h-8 w-8 text-muted-foreground" />
              <span className="mt-2 text-sm font-medium">Video</span>
              <input type="file" accept="video/*" onChange={onPick} className="hidden" />
            </label>
          </div>
        )}

        <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption (optional)"
          rows={3} className="mt-4 w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm outline-none focus:border-ring resize-none" />

        <div className="mt-3">
          <label className="text-xs text-muted-foreground">Add to goal folder (optional)</label>
          <select value={folderId} onChange={(e) => setFolderId(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm outline-none focus:border-ring">
            <option value="">— No folder —</option>
            {folders.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>

        <button onClick={() => m.mutate()} disabled={!file || m.isPending}
          className="mt-5 w-full rounded-2xl bg-gradient-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50">
          {m.isPending ? "Posting…" : "Post"}
        </button>
      </div>
    </div>
  );
}
