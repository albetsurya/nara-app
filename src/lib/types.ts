import type { Mood } from "./moods";

export type Profile = { id: string; username: string | null; companion_name: string; intent: string | null; created_at: string };
export type Journal = { id: string; user_id: string; content: string; mood: Mood; duration_seconds: number; is_gratitude: boolean; created_at: string };
export type Stamp = { id: string; user_id: string; stamp_type: string; earned_at: string };
export type NewJournal = Pick<Journal, "content" | "mood" | "duration_seconds"> & { created_at?: string };
