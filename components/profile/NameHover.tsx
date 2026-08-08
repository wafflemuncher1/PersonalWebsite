"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Wraps the display name so hovering it reveals the @username as a small
// tooltip, instead of showing the handle inline all the time.
export function NameHover({ username, children }: { username: string; children: ReactNode }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative inline-block cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute left-1/2 top-full z-30 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/85 px-2 py-1 font-mono text-[11px] text-white shadow-lg"
          >
            @{username}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
