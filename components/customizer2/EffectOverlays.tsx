// Precomputed (not random) particle layouts so server-rendered and
// client-rendered markup always match — no hydration mismatch.

const SPARKLE_DOTS = [
  { left: "8%", top: "15%", delay: "0s", size: "10px" },
  { left: "88%", top: "22%", delay: "0.3s", size: "8px" },
  { left: "20%", top: "72%", delay: "0.6s", size: "9px" },
  { left: "70%", top: "80%", delay: "0.9s", size: "7px" },
  { left: "45%", top: "10%", delay: "1.2s", size: "8px" },
  { left: "92%", top: "60%", delay: "0.4s", size: "6px" },
];

const FLOAT_DOTS = [
  { left: "12%", top: "30%", delay: "0s", size: "6px" },
  { left: "80%", top: "40%", delay: "0.5s", size: "5px" },
  { left: "35%", top: "68%", delay: "1s", size: "7px" },
  { left: "62%", top: "18%", delay: "1.5s", size: "5px" },
];

const STARS = [
  { left: "5%", top: "10%", delay: "0s" },
  { left: "18%", top: "35%", delay: "0.4s" },
  { left: "30%", top: "8%", delay: "0.8s" },
  { left: "48%", top: "25%", delay: "1.1s" },
  { left: "60%", top: "60%", delay: "0.2s" },
  { left: "72%", top: "15%", delay: "0.6s" },
  { left: "85%", top: "45%", delay: "1.3s" },
  { left: "92%", top: "70%", delay: "0.9s" },
  { left: "40%", top: "80%", delay: "1.5s" },
  { left: "10%", top: "60%", delay: "0.7s" },
];

const FALL_STREAKS = [
  { left: "8%", delay: "0s", duration: "3.2s" },
  { left: "20%", delay: "0.5s", duration: "3.8s" },
  { left: "34%", delay: "1s", duration: "3.1s" },
  { left: "48%", delay: "0.2s", duration: "4s" },
  { left: "60%", delay: "1.4s", duration: "3.4s" },
  { left: "74%", delay: "0.8s", duration: "3.6s" },
  { left: "86%", delay: "0.3s", duration: "3.9s" },
];

export function ProfileEffectOverlay({ effect, color }: { effect: string; color: string }) {
  if (effect === "sparkle") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {SPARKLE_DOTS.map((d, i) => (
          <span
            key={i}
            className="absolute animate-sparkle rounded-full"
            style={{ left: d.left, top: d.top, width: d.size, height: d.size, background: color, animationDelay: d.delay }}
          />
        ))}
      </div>
    );
  }

  if (effect === "floating") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {FLOAT_DOTS.map((d, i) => (
          <span
            key={i}
            className="absolute animate-float rounded-full opacity-50"
            style={{ left: d.left, top: d.top, width: d.size, height: d.size, background: color, animationDelay: d.delay }}
          />
        ))}
      </div>
    );
  }

  if (effect === "glow-pulse") {
    return (
      <div
        className="pointer-events-none absolute inset-0 animate-pulse-glow rounded-2xl"
        style={{ boxShadow: `inset 0 0 0 2px ${color}, 0 0 30px 2px ${color}55` }}
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
        <div className="absolute inset-x-0 top-0 h-[3px] animate-shimmer" style={gradient} />
        <div className="absolute inset-x-0 bottom-0 h-[3px] animate-shimmer" style={gradient} />
        <div className="absolute inset-y-0 left-0 w-[3px] animate-shimmer" style={gradient} />
        <div className="absolute inset-y-0 right-0 w-[3px] animate-shimmer" style={gradient} />
      </div>
    );
  }

  return null;
}

export function BackgroundEffectOverlay({ effect, color }: { effect: string; color: string }) {
  if (effect === "stars") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="absolute h-[3px] w-[3px] animate-sparkle rounded-full bg-white"
            style={{ left: s.left, top: s.top, animationDelay: s.delay }}
          />
        ))}
      </div>
    );
  }

  if (effect === "rain") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {FALL_STREAKS.map((s, i) => (
          <span
            key={i}
            className="absolute top-0 w-px animate-fall opacity-60"
            style={{
              left: s.left,
              height: "26%",
              background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.7))",
              animationDelay: s.delay,
              animationDuration: s.duration,
            }}
          />
        ))}
      </div>
    );
  }

  if (effect === "snow") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {FALL_STREAKS.map((s, i) => (
          <span
            key={i}
            className="absolute top-0 h-1.5 w-1.5 animate-fall rounded-full bg-white/80"
            style={{ left: s.left, animationDelay: s.delay, animationDuration: s.duration }}
          />
        ))}
      </div>
    );
  }

  if (effect === "waves") {
    return (
      <div
        className="pointer-events-none absolute inset-0 animate-shimmer opacity-40"
        style={{
          backgroundImage: `linear-gradient(120deg, transparent 20%, ${color}55 50%, transparent 80%)`,
          backgroundSize: "200% 100%",
        }}
      />
    );
  }

  return null;
}
