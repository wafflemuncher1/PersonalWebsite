"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

// Wraps a custom (unverified) link widget: clicking it opens a warning
// modal instead of navigating straight away, since — unlike the YouTube/
// TikTok/Instagram/Facebook links — there's no domain check backing a
// custom link's destination.
export function ExternalLinkGate({
  url,
  onConfirm,
  className,
  style,
  children,
}: {
  url: string;
  onConfirm: () => void;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className} style={style}>
        {children}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-white/10 bg-ink-950 p-5 shadow-2xl"
            >
              <div className="flex items-center gap-2.5 text-amber-400">
                <ExternalLink className="h-5 w-5" />
                <p className="text-sm font-semibold text-white">You&apos;re leaving this site</p>
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-zinc-400">
                This is a custom link that hasn&apos;t been verified. Make sure you trust it before continuing.
              </p>
              <p className="mt-2 truncate rounded-lg bg-white/5 px-2.5 py-1.5 font-mono text-[11px] text-zinc-500">
                {url}
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg border border-white/10 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onConfirm();
                  }}
                  className="flex-1 rounded-lg bg-amber-500 py-2 text-xs font-semibold text-black transition hover:bg-amber-400"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
