"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

const ACCENT_ICON: Record<string, string> = {
  violet: "text-violet-400",
  amber: "text-amber-400",
  emerald: "text-emerald-400",
  blue: "text-blue-400",
  pink: "text-pink-400",
  red: "text-red-400",
};

function CountUp({ value }: { value: number }) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 120, damping: 20, mass: 0.6 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  return <motion.span>{display}</motion.span>;
}

// Shared, animated small stat card used across Overview and every lifestyle
// page (Streaks/Journal/Goals/Notes) — replaces the ad-hoc local copies that
// used to be duplicated in each board component. Numeric values count up on
// mount/change; string values (e.g. "🤩 Great") render as-is.
export function StatTile({
  icon,
  label,
  value,
  accent = "violet",
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: "violet" | "amber" | "emerald" | "blue" | "pink" | "red";
  className?: string;
}) {
  return (
    <div className={cn("glass glass-hover group rounded-xl p-3.5", className)}>
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className={cn("transition-transform duration-300 group-hover:scale-110", ACCENT_ICON[accent])}>
          {icon}
        </span>
        <span className="text-[11px] text-zinc-500">{label}</span>
      </div>
      <p className="text-lg font-semibold text-white">
        {typeof value === "number" ? <CountUp value={value} /> : value}
      </p>
    </div>
  );
}
