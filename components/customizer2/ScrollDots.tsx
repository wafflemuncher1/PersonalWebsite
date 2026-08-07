"use client";

import { cn } from "@/lib/utils";

export function ScrollDots({
  labels,
  activeIndex,
  onDotClick,
  showHint,
}: {
  labels: readonly string[];
  activeIndex: number;
  onDotClick: (index: number) => void;
  showHint: boolean;
}) {
  return (
    <>
      <div className="pointer-events-none absolute inset-y-0 right-2 z-20 hidden items-center sm:flex sm:right-3">
        <div className="pointer-events-auto flex flex-col items-center gap-3">
          {labels.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => onDotClick(i)}
              aria-label={`Jump to ${label}`}
              title={label}
              className="group relative flex h-4 w-4 items-center justify-center"
            >
              <span
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === activeIndex
                    ? "h-2.5 w-2.5 bg-violet-400 shadow-[0_0_10px_2px_rgba(139,92,246,0.7)]"
                    : "h-1.5 w-1.5 bg-white/25 group-hover:bg-white/50"
                )}
              />
              <span className="pointer-events-none absolute right-5 whitespace-nowrap rounded-md border border-white/10 bg-ink-950/95 px-2 py-1 text-[10px] text-zinc-300 opacity-0 shadow-glow transition-opacity duration-150 group-hover:opacity-100">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {showHint && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center">
          <div className="animate-bounce rounded-full border border-white/10 bg-ink-950/80 px-3.5 py-1.5 text-[11px] font-medium text-zinc-400 backdrop-blur">
            ↓ scroll down for more
          </div>
        </div>
      )}
    </>
  );
}
