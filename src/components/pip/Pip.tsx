"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ComponentType } from "react";
import { Dew, Moss, PipDefault, PipHappy, PipLove, PipPeek, PipSleepy, PipSurprised, PipWave, Sandy, Shelly, type AssetProps } from "./PipAssets";

export type PipPose = "default" | "wave" | "happy" | "love" | "sleepy" | "surprised" | "peek";
export type Companion = "Pip" | "Moss" | "Dew" | "Sandy" | "Shelly";

const POSES: Record<PipPose, ComponentType<AssetProps>> = {
  default: PipDefault, wave: PipWave, happy: PipHappy, love: PipLove, sleepy: PipSleepy, surprised: PipSurprised, peek: PipPeek,
};

export const COMPANIONS: { name: Companion; Face: ComponentType<AssetProps>; vibe: string }[] = [
  { name: "Pip", Face: PipDefault, vibe: "Playful and curious" },
  { name: "Moss", Face: Moss, vibe: "Steady and grounding" },
  { name: "Dew", Face: Dew, vibe: "Gentle and dreamy" },
  { name: "Sandy", Face: Sandy, vibe: "Warm and easygoing" },
  { name: "Shelly", Face: Shelly, vibe: "Quiet and thoughtful" },
];

interface PipProps {
  pose?: PipPose;
  size?: number;
  className?: string;
  /** "bob" floats, "breathe" gently scales, "none" is still. Reduced-motion users always get still. */
  motion?: "bob" | "breathe" | "none";
  companion?: Companion;
}

/**
 * Pip, with a tiny bit of life. The SVGs come from PipAssets.tsx; this only adds
 * motion (bobbing/breathing, a squish on tap) so the art stays swappable.
 */
export function Pip({ pose = "default", size = 120, className, motion: mode = "bob", companion = "Pip" }: PipProps) {
  const reduce = useReducedMotion();
  const Face = companion === "Pip" ? POSES[pose] : COMPANIONS.find((c) => c.name === companion)!.Face;
  const still = reduce || mode === "none";

  return (
    <motion.div
      className={className}
      style={{ width: size, transformOrigin: "50% 100%" }}
      animate={
        still ? undefined : mode === "bob" ? { y: [0, -7, 0] } : { scaleY: [1, 1.035, 1], scaleX: [1, 0.985, 1] }
      }
      transition={still ? undefined : { duration: mode === "bob" ? 3.4 : 4.2, repeat: Infinity, ease: "easeInOut" }}
      whileTap={still ? undefined : { scaleX: 1.08, scaleY: 0.9 }}
    >
      <Face size={size} />
    </motion.div>
  );
}
