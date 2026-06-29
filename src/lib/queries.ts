import { supabase } from "@/integrations/supabase/client";

export async function getMyProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getProfileByUsername(username: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getRecentLogs(userId: string, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data, error } = await supabase
    .from("stretch_logs")
    .select("log_date,duration_minutes,notes")
    .eq("user_id", userId)
    .gte("log_date", since.toISOString().slice(0, 10))
    .order("log_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function logStretch(durationMinutes: number, notes?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const today = new Date().toISOString().slice(0, 10);
  const { error } = await supabase
    .from("stretch_logs")
    .upsert({ user_id: user.id, log_date: today, duration_minutes: durationMinutes, notes }, { onConflict: "user_id,log_date" });
  if (error) throw error;
}

export async function getLeaderboard(limit = 50) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,username,display_name,country,avatar_url,discipline,current_streak,longest_streak,total_minutes")
    .order("current_streak", { ascending: false })
    .order("longest_streak", { ascending: false })
    .order("total_minutes", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getFeed(limit = 30) {
  const { data, error } = await supabase
    .from("posts")
    .select("id,user_id,kind,media_url,thumbnail_url,caption,like_count,created_at,folder_id, profiles!posts_user_id_fkey(username,display_name,avatar_url), goal_folders(name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getMyFolders() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data, error } = await supabase
    .from("goal_folders")
    .select("id,name,description,cover_url,created_at, posts(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getFoldersByUser(userId: string) {
  const { data, error } = await supabase
    .from("goal_folders")
    .select("id,name,description,cover_url,created_at, posts(count)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getFolder(folderId: string) {
  const { data, error } = await supabase
    .from("goal_folders")
    .select("*, profiles!goal_folders_user_id_fkey(username,display_name,avatar_url)")
    .eq("id", folderId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getFolderPosts(folderId: string) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("folder_id", folderId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getUserPosts(userId: string) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createFolder(name: string, description?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data, error } = await supabase
    .from("goal_folders")
    .insert({ user_id: user.id, name, description })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uploadMedia(file: File): Promise<{ path: string; publicUrl: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const ext = file.name.split(".").pop() || "bin";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("stretch-media").upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  const { data: signed, error: signErr } = await supabase.storage
    .from("stretch-media")
    .createSignedUrl(path, 60 * 60 * 24 * 365);
  if (signErr) throw signErr;
  return { path, publicUrl: signed.signedUrl };
}

export async function createPost(input: {
  kind: "photo" | "video";
  mediaUrl: string;
  caption?: string;
  folderId?: string | null;
  thumbnailUrl?: string | null;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { error } = await supabase.from("posts").insert({
    user_id: user.id,
    kind: input.kind,
    media_url: input.mediaUrl,
    thumbnail_url: input.thumbnailUrl ?? null,
    caption: input.caption ?? null,
    folder_id: input.folderId ?? null,
  });
  if (error) throw error;
}

export async function toggleLike(postId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data: existing } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) {
    await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
    return false;
  }
  await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
  return true;
}

export async function updateMyProfile(patch: { display_name?: string; bio?: string; country?: string; discipline?: string; avatar_url?: string; username?: string }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
  if (error) throw error;
}
