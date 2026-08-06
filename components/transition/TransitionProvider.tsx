"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

type Stage = "idle" | "cover-in" | "cover-anim" | "hold" | "reveal-in" | "reveal-anim";

type TransitionContextValue = {
  triggerTransition: (x: number, y: number, href: string) => void;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function useSwallowTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) {
    throw new Error("useSwallowTransition must be used within a TransitionProvider");
  }
  return ctx;
}

const COVER_MS = 520;
const HOLD_MS = 200;
const REVEAL_MS = 520;
const EASE = "cubic-bezier(0.76, 0, 0.24, 1)";

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("idle");
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  // Root layout never unmounts during client-side navigation, so this
  // sequence is safe to run without cleanup/cancellation bookkeeping — it
  // only stops existing at a hard page reload, which resets everything.
  async function triggerTransition(x: number, y: number, href: string) {
    setOrigin({ x, y });

    setStage("cover-in");
    await nextFrame();
    setStage("cover-anim");
    await wait(COVER_MS);

    router.push(href);
    setStage("hold");
    await wait(HOLD_MS);

    setStage("reveal-in");
    await nextFrame();
    setStage("reveal-anim");
    await wait(REVEAL_MS);

    setStage("idle");
  }

  let clipPath = `circle(0px at ${origin.x}px ${origin.y}px)`;
  let transition = "none";

  switch (stage) {
    case "cover-in":
      clipPath = `circle(0px at ${origin.x}px ${origin.y}px)`;
      transition = "none";
      break;
    case "cover-anim":
      clipPath = `circle(150vmax at ${origin.x}px ${origin.y}px)`;
      transition = `clip-path ${COVER_MS}ms ${EASE}`;
      break;
    case "hold":
      clipPath = `circle(150vmax at ${origin.x}px ${origin.y}px)`;
      transition = "none";
      break;
    case "reveal-in":
      clipPath = `circle(150vmax at ${origin.x}px ${origin.y}px)`;
      transition = "none";
      break;
    case "reveal-anim":
      clipPath = `circle(0px at ${origin.x}px ${origin.y}px)`;
      transition = `clip-path ${REVEAL_MS}ms ${EASE}`;
      break;
  }

  return (
    <TransitionContext.Provider value={{ triggerTransition }}>
      {children}
      {stage !== "idle" && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[999] bg-gradient-to-br from-violet-600 to-violet-500"
          style={{ clipPath, transition }}
        />
      )}
    </TransitionContext.Provider>
  );
}
