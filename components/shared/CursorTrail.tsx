"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MousePointer2 } from "lucide-react";

// This stays hand-rolled rather than moving to tsparticles' external "trail"
// interaction: that plugin isn't part of the slim bundle (it ships as a
// separate @tsparticles/interaction-external-trail package) and its
// interactivity.modes.trail option shape isn't stable enough to verify
// without a local build to compile against. Each effect below is a small,
// declarative visual recipe rather than its own code path, so adding more
// effects is just adding another case.
type Point = { x: number; y: number; id: number; hue: number; seed: number };

type Visual = {
  kind?: "dot" | "emoji" | "icon";
  content?: string;
  background: string;
  size: number;
  radius: number;
  border?: string;
  boxShadow?: string;
  initial: { opacity: number; scale: number; y: number; rotate?: number };
  animate: { opacity: number; scale: number; y: number; rotate?: number };
};

function getVisual(effect: string, p: Point, color: string, emoji: string): Visual {
  switch (effect) {
    case "emoji":
      return {
        kind: "emoji",
        content: emoji || "✨",
        background: "transparent",
        size: 20,
        radius: 0,
        initial: { opacity: 0.95, scale: 1, y: 0, rotate: p.seed * 30 - 15 },
        animate: { opacity: 0, scale: 1.3, y: -14, rotate: p.seed * 30 - 15 },
      };
    case "trail":
      return {
        kind: "icon",
        background: color,
        size: 16,
        radius: 0,
        initial: { opacity: 0.85, scale: 1, y: 0 },
        animate: { opacity: 0, scale: 0.8, y: 6 },
      };
    case "glow":
      return {
        background: color,
        size: 14,
        radius: 9999,
        boxShadow: `0 0 16px 4px ${color}`,
        initial: { opacity: 0.9, scale: 1, y: 0 },
        animate: { opacity: 0, scale: 0.25, y: 0 },
      };
    case "rainbow": {
      const c = `hsl(${p.hue}, 90%, 65%)`;
      return {
        background: c,
        size: 7,
        radius: 9999,
        boxShadow: `0 0 8px 2px ${c}`,
        initial: { opacity: 0.9, scale: 1, y: 0 },
        animate: { opacity: 0, scale: 0.25, y: 0 },
      };
    }
    case "bubble":
      return {
        background: `${color}33`,
        size: 16,
        radius: 9999,
        border: `1.5px solid ${color}`,
        boxShadow: `0 0 6px 1px ${color}55`,
        initial: { opacity: 0.55, scale: 0.4, y: 0 },
        animate: { opacity: 0, scale: 1.7, y: 0 },
      };
    case "fire": {
      const c = `hsl(${8 + p.seed * 35}, 95%, 55%)`;
      return {
        background: c,
        size: 8,
        radius: 9999,
        boxShadow: `0 0 10px 3px ${c}`,
        initial: { opacity: 0.95, scale: 1, y: 0 },
        animate: { opacity: 0, scale: 0.35, y: -18 },
      };
    }
    case "snow":
      return {
        background: "#eaf6ff",
        size: 5 + p.seed * 4,
        radius: 9999,
        boxShadow: "0 0 6px 1px rgba(255,255,255,0.6)",
        initial: { opacity: 0.9, scale: 1, y: 0 },
        animate: { opacity: 0, scale: 0.9, y: 20 },
      };
    case "confetti": {
      const c = `hsl(${p.hue}, 85%, 60%)`;
      return {
        background: c,
        size: 6,
        radius: 2,
        initial: { opacity: 0.95, scale: 1, y: 0, rotate: 0 },
        animate: { opacity: 0, scale: 0.6, y: 12, rotate: p.seed * 300 - 150 },
      };
    }
    case "sparkle":
    default:
      return {
        background: color,
        size: 7,
        radius: 9999,
        boxShadow: `0 0 8px 2px ${color}`,
        initial: { opacity: 0.9, scale: 1, y: 0 },
        animate: { opacity: 0, scale: 0.25, y: 0 },
      };
  }
}

export function CursorTrail({
  effect,
  color,
  emoji = "✨",
  containerRef,
}: {
  effect: string;
  color: string;
  emoji?: string;
  containerRef?: React.RefObject<HTMLElement>;
}) {
  const [points, setPoints] = useState<Point[]>([]);
  const idRef = useRef(0);
  const hueRef = useRef(0);

  useEffect(() => {
    if (effect === "none") return;

    function onMove(e: MouseEvent) {
      const rect = containerRef?.current?.getBoundingClientRect();
      const x = rect ? e.clientX - rect.left : e.clientX;
      const y = rect ? e.clientY - rect.top : e.clientY;
      idRef.current += 1;
      const id = idRef.current;
      hueRef.current = (hueRef.current + 35) % 360;
      const point: Point = { x, y, id, hue: hueRef.current, seed: Math.random() };
      setPoints((prev) => [...prev.slice(-16), point]);
      window.setTimeout(() => {
        setPoints((prev) => prev.filter((p) => p.id !== id));
      }, 750);
    }

    const scoped = containerRef?.current;
    if (scoped) {
      scoped.addEventListener("mousemove", onMove);
      return () => scoped.removeEventListener("mousemove", onMove);
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [effect, containerRef]);

  if (effect === "none") return null;

  const wrapperClass = containerRef
    ? "pointer-events-none absolute inset-0 overflow-hidden"
    : "pointer-events-none fixed inset-0 z-[999]";

  return (
    <div className={wrapperClass}>
      <AnimatePresence>
        {points.map((p) => {
          const v = getVisual(effect, p, color, emoji);

          if (v.kind === "emoji") {
            return (
              <motion.span
                key={p.id}
                className="absolute select-none"
                style={{ left: p.x, top: p.y, fontSize: v.size, lineHeight: 1 }}
                initial={v.initial}
                animate={v.animate}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                {v.content}
              </motion.span>
            );
          }

          if (v.kind === "icon") {
            return (
              <motion.span
                key={p.id}
                className="absolute"
                style={{ left: p.x, top: p.y }}
                initial={v.initial}
                animate={v.animate}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <MousePointer2 size={v.size} color={v.background} fill={v.background} fillOpacity={0.25} />
              </motion.span>
            );
          }

          return (
            <motion.span
              key={p.id}
              className="absolute"
              style={{
                left: p.x,
                top: p.y,
                width: v.size,
                height: v.size,
                background: v.background,
                borderRadius: v.radius,
                border: v.border,
                boxShadow: v.boxShadow,
              }}
              initial={v.initial}
              animate={v.animate}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
