"use client";

import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  DEFAULT_DASHBOARD2_LAYOUT,
  DEFAULT_LAYOUT,
  SPAN_CLASS,
  WIDGET_BY_KEY,
  WIDGET_DEFS,
  isStatKey,
  isWidgetKey,
} from "@/lib/dashboard-widgets";
import { AccountStatisticsPlaceholder, WIDGET_PLACEHOLDERS } from "@/components/dashboard/widgets/placeholders";
import type { Dashboard2Layout } from "@/lib/types";

type DragState = { source: "palette" | "canvas"; key: string; x: number; y: number };

const NO_DRAG_TOUCH: React.CSSProperties = { touchAction: "none" };

export function DashboardBuilder({
  initialDashboard,
  profileId,
}: {
  initialDashboard: Dashboard2Layout;
  profileId: string | undefined;
}) {
  const [layout, setLayout] = useState<string[]>(initialDashboard.layout.filter(isWidgetKey));
  const [accountStats, setAccountStats] = useState<string[]>(initialDashboard.accountStats);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [statsOpen, setStatsOpen] = useState(false);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [hoverZone, setHoverZone] = useState<string | null>(null);
  const lastZoneRef = useRef<string | null>(null);

  const placedKeys = useMemo(() => new Set([...layout, ...accountStats]), [layout, accountStats]);
  const available = useMemo(() => WIDGET_DEFS.filter((w) => !placedKeys.has(w.key)), [placedKeys]);
  const statsAvailable = available.filter((w) => w.group === "Stats");
  const overviewAvailable = available.filter((w) => w.group === "Overview");
  const activityAvailable = available.filter((w) => w.group === "Activity");

  function performDrop(key: string, zone: string | null) {
    if (!zone) return;

    if (zone === "account-stats") {
      if (!isStatKey(key)) return;
      setLayout((prev) => prev.filter((k) => k !== key));
      setAccountStats((prev) => (prev.includes(key) ? prev : [...prev, key].slice(0, 4)));
      return;
    }

    setAccountStats((prev) => prev.filter((k) => k !== key));

    if (zone === "end") {
      setLayout((prev) => [...prev.filter((k) => k !== key), key]);
      return;
    }

    if (zone.startsWith("slot-")) {
      const index = parseInt(zone.slice(5), 10);
      setLayout((prev) => {
        const without = prev.filter((k) => k !== key);
        const at = Math.min(Math.max(index, 0), without.length);
        return [...without.slice(0, at), key, ...without.slice(at)];
      });
    }
  }

  function startDrag(source: "palette" | "canvas", key: string, e: ReactPointerEvent) {
    e.preventDefault();
    setDrag({ source, key, x: e.clientX, y: e.clientY });
    lastZoneRef.current = null;
    setHoverZone(null);

    function onMove(ev: PointerEvent) {
      setDrag((d) => (d ? { ...d, x: ev.clientX, y: ev.clientY } : d));
      const el = document.elementFromPoint(ev.clientX, ev.clientY) as HTMLElement | null;
      const zoneEl = el?.closest("[data-dropzone]") as HTMLElement | null;
      const zone = zoneEl?.getAttribute("data-dropzone") ?? null;
      lastZoneRef.current = zone;
      setHoverZone(zone);
    }

    function onUp() {
      performDrop(key, lastZoneRef.current);
      setDrag(null);
      setHoverZone(null);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function removeKey(key: string) {
    setLayout((prev) => prev.filter((k) => k !== key));
    setAccountStats((prev) => prev.filter((k) => k !== key));
  }

  async function handleSave() {
    if (!profileId) return;
    setStatus("saving");
    const supabase = createClient();
    const payload: Dashboard2Layout = { layout, accountStats };
    const { error } = await supabase.from("profiles").update({ dashboard2_layout: payload }).eq("id", profileId);
    setStatus(error ? "error" : "done");
    if (!error) setTimeout(() => setStatus("idle"), 2000);
  }

  function handleReset() {
    setLayout([...DEFAULT_LAYOUT]);
    setAccountStats([...DEFAULT_DASHBOARD2_LAYOUT.accountStats]);
  }

  function handleClear() {
    setLayout([]);
    setAccountStats([]);
  }

  const draggingIsStat = !!drag && isStatKey(drag.key);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Smaller sidebar: available components */}
      <aside className="shrink-0 space-y-5 lg:w-64">
        <div className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Drag onto your dashboard</p>

          {/* Stats — collapsible dropdown */}
          <div>
            <button
              type="button"
              onClick={() => setStatsOpen((o) => !o)}
              className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-violet-500/30 hover:text-white"
            >
              <span>Stats {statsAvailable.length > 0 && `(${statsAvailable.length})`}</span>
              <span className={`transition-transform duration-200 ${statsOpen ? "rotate-180" : ""}`}>⌄</span>
            </button>
            {statsOpen && (
              <div className="mt-2 space-y-2">
                {statsAvailable.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-white/10 p-2.5 text-[11px] text-zinc-600">
                    All stats are placed.
                  </p>
                ) : (
                  statsAvailable.map((w) => (
                    <div
                      key={w.key}
                      style={NO_DRAG_TOUCH}
                      onPointerDown={(e) => startDrag("palette", w.key, e)}
                      className="flex cursor-grab items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-zinc-300 transition active:cursor-grabbing hover:border-violet-500/30 hover:bg-violet-500/[0.08]"
                    >
                      <span>{w.icon}</span> {w.label}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {[
            { label: "Overview", items: overviewAvailable },
            { label: "Activity", items: activityAvailable },
          ].map(
            (group) =>
              group.items.length > 0 && (
                <div key={group.label}>
                  <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-zinc-600">
                    {group.label}
                  </p>
                  <div className="space-y-2">
                    {group.items.map((w) => (
                      <div
                        key={w.key}
                        style={NO_DRAG_TOUCH}
                        onPointerDown={(e) => startDrag("palette", w.key, e)}
                        className="flex cursor-grab items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-zinc-300 transition active:cursor-grabbing hover:border-violet-500/30 hover:bg-violet-500/[0.08]"
                      >
                        <span>{w.icon}</span> {w.label}
                      </div>
                    ))}
                  </div>
                </div>
              )
          )}

          {available.length === 0 && (
            <p className="rounded-lg border border-dashed border-white/10 p-3 text-xs text-zinc-600">
              Every component is already on your dashboard.
            </p>
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

      {/* Dashboard canvas — static placeholders only, no live data or links */}
      <div className="min-w-0 flex-1">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
          Your dashboard — {layout.length} component{layout.length === 1 ? "" : "s"}
        </p>

        <div className="relative rounded-2xl">
          <div className="pointer-events-none absolute -inset-1 animate-pulse rounded-2xl bg-violet-500/25 blur-xl" />
          <div className="relative rounded-2xl border-2 border-violet-500/40 bg-ink-950 p-4">
            {layout.length === 0 ? (
              <div
                data-dropzone="end"
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-24 text-center transition ${
                  hoverZone === "end" ? "border-violet-400 bg-violet-500/[0.08]" : "border-white/10"
                }`}
              >
                <span className="mb-3 text-4xl">🧩</span>
                <p className="text-lg font-medium text-zinc-300">Please drag and drop dashboard components</p>
                <p className="mt-1 text-sm text-zinc-500">Pick something from the left to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {layout.filter(isWidgetKey).map((key, index) => {
                  const def = WIDGET_BY_KEY[key];
                  if (!def) return null;
                  const zoneName = `slot-${index}`;
                  const isSlotHover = hoverZone === zoneName;

                  return (
                    <div
                      key={key}
                      data-dropzone={zoneName}
                      className={`${SPAN_CLASS[def.span]} rounded-2xl transition ${
                        isSlotHover ? "ring-2 ring-violet-400" : ""
                      }`}
                    >
                      <div
                        style={NO_DRAG_TOUCH}
                        onPointerDown={(e) => startDrag("canvas", key, e)}
                        className="group relative h-full cursor-grab active:cursor-grabbing"
                      >
                        <button
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={() => removeKey(key)}
                          className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-md bg-black/70 text-xs text-white opacity-0 transition hover:bg-red-500/80 group-hover:opacity-100"
                          aria-label={`Remove ${def.label}`}
                        >
                          ✕
                        </button>

                        {key === "account_statistics" ? (
                          <AccountStatisticsPlaceholder
                            nestedStats={accountStats}
                            isDropTarget={draggingIsStat}
                            isHovering={hoverZone === "account-stats"}
                            onRemoveStat={(k) => setAccountStats((prev) => prev.filter((x) => x !== k))}
                            onStatPointerDown={(k, e) => startDrag("canvas", k, e)}
                          />
                        ) : (
                          (() => {
                            const Placeholder = WIDGET_PLACEHOLDERS[key];
                            return Placeholder ? <Placeholder /> : null;
                          })()
                        )}
                      </div>
                    </div>
                  );
                })}

                <div
                  data-dropzone="end"
                  className={`col-span-2 flex h-16 items-center justify-center rounded-xl border border-dashed text-xs transition md:col-span-4 ${
                    hoverZone === "end" ? "border-violet-400 bg-violet-500/[0.06] text-violet-300" : "border-white/10 text-zinc-600"
                  }`}
                >
                  drop here to add to the end
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating drag ghost, follows the pointer */}
      {drag && WIDGET_BY_KEY[drag.key] && (
        <div
          className="pointer-events-none fixed z-50 flex items-center gap-2 rounded-xl border border-violet-400/60 bg-ink-950/95 px-3.5 py-2.5 text-sm font-medium text-white shadow-glow"
          style={{ left: drag.x + 14, top: drag.y + 14 }}
        >
          <span>{WIDGET_BY_KEY[drag.key].icon}</span>
          {WIDGET_BY_KEY[drag.key].label}
        </div>
      )}
    </div>
  );
}
