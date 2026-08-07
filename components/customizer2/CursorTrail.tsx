"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// This stays hand-rolled rather than moving to tsparticles' external "trail"
// interaction: that plugin isn't part of the slim bundle (it ships as a
// separate @tsparticles/interaction-external-trail package) and its
// interactivity.modes.trail option shape isn't stable enough to verify
// without a local build to compile against. The custom animation ask is
// covered instead by animating each point with framer-motion below, instead
// of the old CSS keyframe.
type Point = { x: number; y: number; id: number; hue: number };

export function CursorTrail({
  effect,
  color,
  containerRef,
}: {
  effect: string;
  color: string;
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
      const hue = hueRef.current;
      setPoints((prev) => [...prev.slice(-16), { x, y, id, hue }]);
      window.setTimeout(() => {
        setPoints((prev) => prev.filter((p) => p.id !== id));
      }, 650);
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
          const dotColor = effect === "rainbow" ? `hsl(${p.hue}, 90%, 65%)` : color;
          const size = effect === "glow" ? 14 : 7;
          return (
            <motion.span
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: p.x,
                top: p.y,
                width: size,
                height: size,
                background: dotColor,
                boxShadow: effect === "glow" ? `0 0 16px 4px ${color}` : `0 0 8px 2px ${dotColor}`,
              }}
              initial={{ opacity: 0.9, scale: 1 }}
              animate={{ opacity: 0, scale: 0.25 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
