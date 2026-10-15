"use client";

import { motion } from "framer-motion";

/** template.tsx remounts on every navigation, which gives each page a soft entrance. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -8 }}
      transition={{
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1], // Smooth iOS-like cubic bezier
      }}
      className="w-full flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}
