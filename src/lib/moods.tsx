import type { ComponentType } from "react";
import { PipDefault, PipHappy, PipLove, PipSleepy, PipSurprised, type AssetProps } from "@/components/pip/PipAssets";

export type Mood = "happy" | "love" | "calm" | "surprised" | "sleepy";

/** Each mood is one of Pip's expressions. Order = order shown in the picker. */
export const MOODS: { id: Mood; label: string; Face: ComponentType<AssetProps> }[] = [
  { id: "happy", label: "Happy", Face: PipHappy },
  { id: "love", label: "Loved", Face: PipLove },
  { id: "calm", label: "Calm", Face: PipDefault },
  { id: "surprised", label: "Surprised", Face: PipSurprised },
  { id: "sleepy", label: "Tired", Face: PipSleepy },
];

export const moodLabel = (m: string) => MOODS.find((x) => x.id === m)?.label ?? "Calm";
