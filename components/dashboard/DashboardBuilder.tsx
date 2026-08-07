"use client";

import { useLayoutEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_LAYOUT, SPAN_CLASS, WIDGET_BY_KEY, WIDGET_DEFS, isWidgetKey } from "@/lib/dashboard-widgets";
import { WIDGET_COMPONENTS } from "@/components/dashboard/widgets/registry";
import type { DashboardData } from "@/lib/dashboard-data";

type DragPayload = { source: "palette" | "canvas"; key: string };

function readPayload(e: DragEvent): DragPayload | null {
  try {
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return null;
    return JSON.parse(raw) as DragPayload;
  } catch {
    return null;
  }
}

export function DashboardBuilder({
  data,
  initialLayout,
  profileId,
}: {
  data: DashboardData;
  initialLayout: string[];
  profileId: string | undefined;
}) {
  const [layout, setLayout] = useState<string[]>(initialLayout.filter(isWidgetKey));
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [dragOverEnd, setDragOverEnd] = useState(false);

  const PREVIEW_SCALE = 0.55;
  const previewInnerRef = useRef<HTMLDivElement>(null);
  const [previewHeight, setPreviewHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    if (previewInnerRef.current) {
      setPreviewHeight(previewInnerRef.current.scrollHeight * PREVIEW_SCALE);
    }
  }, [layout]);

  const available = useMemo(() => WIDGET_DEFS.filter((w) => !layout.includes(w.key)), [layout]);
  const groups = useMemo(() => {
    const byGroup = new Map<string, typeof WIDGET_DEFS>();
    for (const w of available) {
      const list = byGroup.get(w.group) ?? [];
      list.push(w);
      byGroup.set(w.group, list);
    }
    return Array.from(byGroup.entries());
  }, [available]);

  function insertAt(key: string, index: number) {
    setLayout((prev) => {
      const withoutKey = prev.filter((k) => k !== key);
      const at = Math.min(Math.max(index, 0), withoutKey.length);
      return [...withoutKey.slice(0, at), key, ...withoutKey.slice(at)];
    });
  }

  function removeKey(key: string) {
    setLayout((prev) => prev.filter((k) => k !== key));
  }

  function onDropAtIndex(e: DragEvent, index: number) {
    e.preventDefault();
    setDragOverEnd(false);
    const payload = readPayload(e);
    if (!payload) return;
    insertAt(payload.key, index);
  }

  function onDropAtEnd(e: DragEvent) {
    e.preventDefault();
    setDragOverEnd(false);
    const payload = readPayload(e);
    if (!payload) return;
    insertAt(payload.key, layout.length);
  }

  function startPaletteDrag(e: DragEvent, key: string) {
    e.dataTransfer.setData("application/json", JSON.stringify({ source: "palette", key }));
    e.dataTransfer.effectAllowed = "copy";
  }

  function startCanvasDrag(e: DragEvent, key: string) {
    e.dataTransfer.setData("application/json", JSON.stringify({ source: "canvas", key }));
    e.dataTransfer.effectAllowed = "move";
  }

  async function handleSave() {
    if (!profileId) return;
    setStatus("saving");
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ dashboard2_layout: layout })
      .eq("id", profileId);
    setStatus(error ? "error" : "done");
    if (!error) setTimeout(() => setStatus("idle"), 2000);
  }

  function handleReset() {
    setLayout([...DEFAULT_LAYOUT]);
  }

  function handleClear() {
    setLayout([]);
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Smaller sidebar: available components */}
      <aside className="shrink-0 space-y-5 lg:w-64">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            Drag onto your dashboard
          </p>
          {groups.length === 0 ? (
            <p className="rounded-lg border border-dashed border-white/10 p-3 text-xs text-zinc-600">
              Every component is already on your dashboard.
            </p>
          ) : (
            <div className="space-y-4">
              {groups.map(([group, items]) => (
                <div key={group}>
                  <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-zinc-600">{group}</p>
                  <div className="space-y-2">
                    {items.map((w) => (
                      <div
                        key={w.key}
                        draggable
                        onDragStart={(e) => startPaletteDrag(e, w.key)}
                        className="flex cursor-grab items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-zinc-300 transition active:cursor-grabbing hover:border-violet-500/30 hover:bg-violet-500/[0.08]"
                      >
                        <span>{w.icon}</span> {w.label}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2 border-t border-white/5 pt-4">
          <button
            onClick={handleSave}
            disabled={status === "saving"}
            className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:from-violet-500 hover:to-violet-400 disabled:opacity-60"
          >
            {status === "saving" ? "Saving…" : status === "done" ? "Saved ✓" : "Save layout"}
          </button>
          <button
            onClick={handleReset}
            className="w-full rounded-lg border border-white/10 px-4 py-2 text-xs text-zinc-400 transition hover:border-white/20 hover:text-white"
          >
            Reset to default
          </button>
          <button
            onClick={handleClear}
            className="w-full rounded-lg border border-white/10 px-4 py-2 text-xs text-zinc-400 transition hover:border-red-500/30 hover:text-red-300"
          >
            Clear dashboard
          </button>
          {status === "error" && <p className="text-xs text-red-400">Couldn&apos;t save — try again.</p>}
        </div>
      </aside>

      {/* Tiny live dashboard preview / drop target */}
      <div className="min-w-0 flex-1">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
          Your dashboard — {layout.length} component{layout.length === 1 ? "" : "s"}
        </p>
        <div className="max-h-[560px] overflow-y-auto overflow-x-hidden rounded-2xl border border-white/10 bg-ink-950 p-3">
          <div style={{ height: previewHeight }} className="relative">
          <div
            ref={previewInnerRef}
            style={{
              transform: `scale(${PREVIEW_SCALE})`,
              transformOrigin: "top left",
              width: `${100 / PREVIEW_SCALE}%`,
            }}
          >
            {layout.length === 0 ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverEnd(true);
                }}
                onDragLeave={() => setDragOverEnd(false)}
                onDrop={onDropAtEnd}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-24 text-center transition ${
                  dragOverEnd ? "border-violet-500/60 bg-violet-500/[0.06]" : "border-white/10"
                }`}
              >
                <span className="mb-3 text-4xl">🧩</span>
                <p className="text-lg font-medium text-zinc-300">
                  Please drag and drop dashboard components
                </p>
                <p className="mt-1 text-sm text-zinc-500">Pick something from the left to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {layout.filter(isWidgetKey).map((key, index) => {
                  const Widget = WIDGET_COMPONENTS[key];
                  const def = WIDGET_BY_KEY[key];
                  if (!Widget || !def) return null;
                  return (
                    <div
                      key={key}
                      draggable
                      onDragStart={(e) => startCanvasDrag(e, key)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => onDropAtIndex(e, index)}
                      className={`group relative cursor-grab active:cursor-grabbing ${SPAN_CLASS[def.span]}`}
                    >
                      <button
                        onClick={() => removeKey(key)}
                        className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-md bg-black/70 text-xs text-white opacity-0 transition hover:bg-red-500/80 group-hover:opacity-100"
                        aria-label={`Remove ${def.label}`}
                      >
                        ✕
                      </button>
                      <Widget data={data} />
                    </div>
                  );
                })}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDropAtEnd}
                  className="col-span-2 flex h-16 items-center justify-center rounded-xl border border-dashed border-white/10 text-xs text-zinc-600 md:col-span-4"
                >
                  drop here to add to the end
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
