"use client";

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
        <span className="font-mono text-zinc-500">
          {value}
          {unit}
        </span>
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
  return (
    <label
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3",
        disabled && "pointer-events-none opacity-40"
      )}
    >
      <span className="text-xs font-medium text-zinc-300">{label}</span>
      <span className="flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase text-zinc-500">{value}</span>
        <input
          type="color"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-9 cursor-pointer rounded border border-white/10 bg-transparent p-0"
        />
      </span>
    </label>
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
    <label className="flex items-center justify-between gap-4 rounded-lg border border-white/5 bg-white/[0.02] p-3.5">
      <div>
        <p className="text-sm text-zinc-200">{label}</p>
        {sub && <p className="text-xs text-zinc-500">{sub}</p>}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 shrink-0 rounded border-white/20 bg-white/5 accent-violet-500"
      />
    </label>
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
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  const ext = previewUrl.split("?")[0].split(".").pop();
  return (
    <div>
      <p className="mb-2 text-sm text-zinc-300">{label}</p>
      <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
        <label className="flex h-full w-full cursor-pointer items-center justify-center transition hover:bg-white/[0.03]">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt={label} className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-zinc-600">
              <span className="text-2xl">+</span>
              <span className="text-xs">Click to upload</span>
            </div>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={uploading} />
        </label>

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
              onClick={onRemove}
              className="pointer-events-auto flex h-5 w-5 items-center justify-center rounded-md bg-red-500/80 text-[10px] text-white transition hover:bg-red-500"
              aria-label={`Remove ${label.toLowerCase()}`}
            >
              ✕
            </button>
          </div>
        )}
      </div>
      {hint && <p className="mt-1.5 text-[11px] text-zinc-600">{hint}</p>}
    </div>
  );
}
