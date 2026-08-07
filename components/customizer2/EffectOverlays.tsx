"use client";

import { useEffect, useId, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { motion } from "framer-motion";
import {
  floatingOptions,
  rainOptions,
  snowOptions,
  sparkleOptions,
  starsOptions,
} from "@/lib/particles-options";

// True particle presets (sparkle/floating/stars/rain/snow) render through
// tsparticles. Presets that are really just an animated border or gradient
// (glow-pulse, rainbow-border, waves) stay as framer-motion — there's no
// particle system involved, so a particles library would be the wrong tool.
function useParticlesReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      if (mounted) setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);
  return ready;
}

const shimmerTransition = { duration: 3, repeat: Infinity, ease: "linear" as const };
const shimmerAnimate = { backgroundPosition: ["0% 50%", "200% 50%"] };

export function ProfileEffectOverlay({ effect, color }: { effect: string; color: string }) {
  const ready = useParticlesReady();
  const rawId = useId().replace(/[^a-zA-Z0-9-]/g, "");

  if (effect === "sparkle" || effect === "floating") {
    if (!ready) return null;
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Particles
          id={`profile-${effect}-${rawId}`}
          options={effect === "sparkle" ? sparkleOptions(color) : floatingOptions(color)}
          className="h-full w-full"
        />
      </div>
    );
  }

  if (effect === "glow-pulse") {
    return (
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ boxShadow: `inset 0 0 0 2px ${color}, 0 0 30px 2px ${color}55` }}
        animate={{ opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />
    );
  }

  if (effect === "rainbow-border") {
    const gradient = {
      backgroundImage: "linear-gradient(90deg, #f43f5e, #f59e0b, #22c55e, #3b82f6, #8b5cf6, #f43f5e)",
      backgroundSize: "200% 100%",
    };
    return (
      <div className="pointer-events-none absolute inset-0">
        <motion.div className="absolute inset-x-0 top-0 h-[3px]" style={gradient} animate={shimmerAnimate} transition={shimmerTransition} />
        <motion.div className="absolute inset-x-0 bottom-0 h-[3px]" style={gradient} animate={shimmerAnimate} transition={shimmerTransition} />
        <motion.div className="absolute inset-y-0 left-0 w-[3px]" style={gradient} animate={shimmerAnimate} transition={shimmerTransition} />
        <motion.div className="absolute inset-y-0 right-0 w-[3px]" style={gradient} animate={shimmerAnimate} transition={shimmerTransition} />
      </div>
    );
  }

  return null;
}

export function BackgroundEffectOverlay({ effect, color }: { effect: string; color: string }) {
  const ready = useParticlesReady();
  const rawId = useId().replace(/[^a-zA-Z0-9-]/g, "");

  if (effect === "stars" || effect === "rain" || effect === "snow") {
    if (!ready) return null;
    const options = effect === "stars" ? starsOptions() : effect === "rain" ? rainOptions() : snowOptions();
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Particles id={`bg-${effect}-${rawId}`} options={options} className="h-full w-full" />
      </div>
    );
  }

  if (effect === "waves") {
    return (
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: `linear-gradient(120deg, transparent 20%, ${color}55 50%, transparent 80%)`,
          backgroundSize: "200% 100%",
        }}
        animate={shimmerAnimate}
        transition={shimmerTransition}
      />
    );
  }

  return null;
}
