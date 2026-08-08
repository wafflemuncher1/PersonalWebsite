"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  danger = true,
  loading = false,
  error,
  onCancel,
  onConfirm,
  icon,
}: {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  loading?: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
  icon?: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-ink-950 p-5 shadow-2xl"
          >
            <div className={`flex items-center gap-2.5 ${danger ? "text-red-400" : "text-violet-400"}`}>
              {icon}
              <p className="text-sm font-semibold text-white">{title}</p>
            </div>
            <div className="mt-2.5 text-xs leading-relaxed text-zinc-400">{description}</div>
            {error && <p className="mt-2.5 text-xs text-red-400">{error}</p>}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 rounded-lg border border-white/10 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition disabled:opacity-50 ${
                  danger ? "bg-red-500 text-white hover:bg-red-400" : "bg-violet-500 text-white hover:bg-violet-400"
                }`}
              >
                {loading ? "Working…" : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
