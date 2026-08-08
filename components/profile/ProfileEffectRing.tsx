"use client";

import { motion } from "framer-motion";

type Effect = "none" | "spin" | "pulse" | "rainbow" | "sparkle";

// Wraps the avatar circle with a decorative ring animation. `size` must match
// the avatar's rendered diameter (px) so the ring/orbit math lines up exactly.
export function ProfileEffectRing({
  effect,
  size,
  color,
  children,
}: {
  effect: Effect;
  size: number;
  color: string;
  children: React.ReactNode;
}) {
  if (effect === "none") return <>{children}</>;

  const pad = 7;
  const ringSize = size + pad * 2;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {effect === "spin" && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: ringSize,
            height: ringSize,
            left: -pad,
            top: -pad,
            border: `3px solid ${color}`,
            borderTopColor: "transparent",
            borderLeftColor: "transparent",
          }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        />
      )}

      {effect === "rainbow" && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: ringSize,
            height: ringSize,
            left: -pad,
            top: -pad,
            border: "3px solid #ff0055",
          }}
          animate={{
            borderColor: ["#ff0055", "#ff8800", "#ffee00", "#22cc66", "#2288ff", "#a855f7", "#ff0055"],
          }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        />
      )}

      {effect === "pulse" && (
        <>
          {[0, 0.75].map((delay) => (
            <motion.div
              key={delay}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                left: 0,
                top: 0,
                border: `2px solid ${color}`,
              }}
              initial={{ opacity: 0.7, scale: 1 }}
              animate={{ opacity: 0, scale: 1.45 }}
              transition={{ repeat: Infinity, duration: 1.5, delay, ease: "easeOut" }}
            />
          ))}
        </>
      )}

      {effect === "sparkle" && (
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        >
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <span
              key={deg}
              className="absolute h-1.5 w-1.5 rounded-full"
              style={{
                background: color,
                boxShadow: `0 0 6px 1px ${color}`,
                left: "50%",
                top: "50%",
                transform: `rotate(${deg}deg) translate(${size / 2}px) rotate(-${deg}deg)`,
              }}
            />
          ))}
        </motion.div>
      )}

      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}
