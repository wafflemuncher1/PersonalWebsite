"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const EASE_PREMIUM = [0.16, 1, 0.3, 1] as const;

// Single-element mount-in fade — used for page headers, hero cards, and
// anything that isn't part of a staggered list.
export function Reveal({
  children,
  delay = 0,
  className,
  y = 10,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: EASE_PREMIUM }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const groupVariants: Variants = {
  hidden: {},
  show: (stagger: number = 0.06) => ({
    transition: { staggerChildren: stagger },
  }),
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_PREMIUM } },
};

// Pair with RevealItem for staggered grids/lists (stat tiles, card grids,
// entry feeds) — children animate in one after another instead of popping
// in all at once.
export function RevealGroup({
  children,
  className,
  stagger = 0.06,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      custom={stagger}
      variants={groupVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
