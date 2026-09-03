"use client";

import { useRef } from "react";
import { useSwallowTransition } from "@/components/transition/TransitionProvider";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  onBeforeNavigate,
}: {
  className?: string;
  onBeforeNavigate?: () => void;
}) {
  const { triggerTransition } = useSwallowTransition();
  const dotRef = useRef<HTMLSpanElement>(null);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    onBeforeNavigate?.();
    const rect = dotRef.current?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    triggerTransition(x, y, "/");
  }

  return (
    <button
      onClick={handleClick}
      className={cn("flex items-center gap-2", className)}
      aria-label="Go to home"
    >
      <span
        ref={dotRef}
        className="h-2.5 w-2.5 rounded-full bg-signal-400 shadow-[0_0_14px_3px_rgba(62,194,245,0.6)]"
      />
      <span className="text-sm font-semibold tracking-wide text-white">NOCTURNE</span>
    </button>
  );
}
