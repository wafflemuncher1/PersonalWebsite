"use client";

import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { HexColorPicker } from "react-colorful";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

export function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {description && <p className="mt-1 text-xs text-zinc-500">{description}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </Card>
  );
}

export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  unit = "%",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  unit?: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-zinc-300">{label}</span>
        <motion.span
          key={value}
          initial={{ opacity: 0.4, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15 }}
          className="font-mono text-zinc-500"
        >
          {value}
          {unit}
        </motion.span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-violet-500"
      />
    </div>
  );
}

export function ColorField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-left transition hover:border-white/15",
          disabled && "pointer-events-none opacity-40"
        )}
      >
        <span className="text-xs font-medium text-zinc-300">{label}</span>
        <span className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase text-zinc-500">{value}</span>
          <span
            className="h-6 w-9 rounded-md border border-white/15 shadow-inner"
            style={{ background: value }}
          />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full z-30 mt-2 rounded-xl border border-white/10 bg-ink-950 p-3 shadow-glow"
          >
            <HexColorPicker color={value} onChange={onChange} />
            <input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="mt-2 w-full rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-center font-mono text-xs text-white outline-none focus:border-violet-500/50"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ToggleRow({
  label,
  sub,
  checked,
  onChange,
}: {
  label: string;
  sub?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-white/5 bg-white/[0.02] p-3.5">
      <div>
        <p className="text-sm text-zinc-200">{label}</p>
        {sub && <p className="text-xs text-zinc-500">{sub}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200",
          checked ? "bg-violet-500" : "bg-white/10"
        )}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className="h-5 w-5 rounded-full bg-white shadow"
          style={{ marginLeft: checked ? "auto" : 0 }}
        />
      </button>
    </div>
  );
}

export function UploadTile({
  label,
  hint,
  previewUrl,
  uploading,
  onUpload,
  onRemove,
}: {
  label: string;
  hint?: string;
  previewUrl: string;
  uploading: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => {
      const file = accepted[0];
      if (file) onUpload(file);
    },
    accept: { "image/*": [] },
    multiple: false,
    disabled: uploading,
  });
  const ext = previewUrl.split("?")[0].split(".").pop();

  return (
    <div>
      <p className="mb-2 text-sm text-zinc-300">{label}</p>
      <motion.div
        {...getRootProps()}
        whileHover={uploading ? undefined : { scale: 1.01 }}
        whileTap={uploading ? undefined : { scale: 0.99 }}
        className={cn(
          "relative aspect-video cursor-pointer overflow-hidden rounded-xl border transition-colors",
          isDragActive ? "border-violet-400 bg-violet-500/10" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.03]"
        )}
      >
        <input {...getInputProps()} />
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-zinc-600">
            <span className="text-2xl">{isDragActive ? "⬇" : "+"}</span>
            <span className="text-xs">{isDragActive ? "Drop to upload" : "Click or drag to upload"}</span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-white">
            Uploading…
          </div>
        )}

        {previewUrl && !uploading && (
          <div className="pointer-events-none absolute right-2 top-2 flex items-center gap-1.5">
            {ext && (
              <span className="pointer-events-auto rounded-md bg-black/60 px-1.5 py-0.5 font-mono text-[9px] uppercase text-zinc-300">
                .{ext}
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="pointer-events-auto flex h-5 w-5 items-center justify-center rounded-md bg-red-500/80 text-[10px] text-white transition hover:bg-red-500"
              aria-label={`Remove ${label.toLowerCase()}`}
            >
              ✕
            </button>
          </div>
        )}
      </motion.div>
      {hint && <p className="mt-1.5 text-[11px] text-zinc-600">{hint}</p>}
    </div>
  );
}

export function AudioDropzone({
  hint,
  hasFile,
  uploading,
  onUpload,
}: {
  hint?: string;
  hasFile: boolean;
  uploading: boolean;
  onUpload: (file: File) => void;
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted) => {
      const file = accepted[0];
      if (file) onUpload(file);
    },
    accept: { "audio/*": [] },
    multiple: false,
    disabled: uploading,
  });

  return (
    <div>
      <motion.div
        {...getRootProps()}
        whileHover={uploading ? undefined : { scale: 1.005 }}
        whileTap={uploading ? undefined : { scale: 0.995 }}
        className={cn(
          "flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3.5 transition-colors",
          isDragActive ? "border-violet-400 bg-violet-500/10" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.03]"
        )}
      >
        <input {...getInputProps()} />
        <span className="flex items-center gap-2 text-sm text-zinc-300">
          <span>🎵</span>
          {uploading
            ? "Uploading…"
            : hasFile
              ? "Track uploaded — click or drag to replace"
              : isDragActive
                ? "Drop to upload"
                : "Click or drag audio here"}
        </span>
      </motion.div>
      {hint && <p className="mt-1.5 text-[11px] text-zinc-600">{hint}</p>}
    </div>
  );
}
