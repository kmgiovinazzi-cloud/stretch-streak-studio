// Badge + medal helpers — derived from existing profile/log data, no extra table.

import { Flame, Sparkles, Timer, Award, type LucideIcon } from "lucide-react";

export type Badge = {
  id: "first_stretch" | "streak_30" | "minutes_500";
  label: string;
  icon: LucideIcon;
  earned: boolean;
};

export function computeBadges(p: {
  total_minutes?: number | null;
  longest_streak?: number | null;
  current_streak?: number | null;
}): Badge[] {
  const total = p.total_minutes ?? 0;
  const best = Math.max(p.longest_streak ?? 0, p.current_streak ?? 0);
  return [
    { id: "first_stretch", label: "First Stretch", icon: Sparkles, earned: total > 0 },
    { id: "streak_30", label: "30-Day Streak", icon: Flame, earned: best >= 30 },
    { id: "minutes_500", label: "500 Minutes", icon: Timer, earned: total >= 500 },
  ];
}

// Top-3 leaderboard medals
export type Medal = "gold" | "silver" | "bronze" | null;
export function medalForRank(rank: number): Medal {
  if (rank === 1) return "gold";
  if (rank === 2) return "silver";
  if (rank === 3) return "bronze";
  return null;
}
export const medalColor: Record<Exclude<Medal, null>, string> = {
  gold: "text-yellow-400",
  silver: "text-slate-300",
  bronze: "text-amber-600",
};
export const MedalIcon = Award;

// Available styles users can pick (broader than discipline enum)
export const ALL_STYLES = [
  "Ballet", "Contemporary", "Jazz", "Hip-Hop", "Tap", "Lyrical",
  "Cheer", "Gymnastics", "Acro", "Contortion", "Aerial", "Pole",
  "Figure Skating", "Ice Dance", "Martial Arts", "Yoga", "Pilates", "Calisthenics",
] as const;
export type Style = (typeof ALL_STYLES)[number];

// Strip emoji / symbol characters from a string (used to block them in inputs).
const EMOJI_RE = /\p{Extended_Pictographic}|[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]/gu;
export function stripEmoji(s: string): string {
  return s.replace(EMOJI_RE, "");
}
export function containsEmoji(s: string): boolean {
  return EMOJI_RE.test(s);
}
