"use client";

import { buildWeeks, toDateKey, todayKey } from "@/lib/utils";
import { cn } from "@/lib/utils";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function Heatmap({
  loggedDates,
  weeksCount = 20,
  onDayClick,
  size = "sm",
  showMonths = false,
}: {
  loggedDates: Set<string>;
  weeksCount?: number;
  onDayClick?: (dateKey: string) => void;
  size?: "sm" | "md";
  showMonths?: boolean;
}) {
  const weeks = buildWeeks(weeksCount);
  const today = todayKey();
  const cellSize = size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5";

  return (
    <div className="inline-block">
      {showMonths && (
        <div className="mb-1 flex gap-[3px] pl-0.5" style={{ marginLeft: 0 }}>
          {weeks.map((week, i) => {
            const first = week[0];
            const showLabel =
              i === 0 || first.getDate() <= 7 && weeks[i - 1][0].getMonth() !== first.getMonth();
            return (
              <div key={i} className={cn(size === "sm" ? "w-2.5" : "w-3.5", "font-mono text-[9px] text-zinc-600")}>
                {showLabel ? MONTH_LABELS[first.getMonth()] : ""}
              </div>
            );
          })}
        </div>
      )}
      <div className="flex gap-[3px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day) => {
              const key = toDateKey(day);
              const isFuture = key > today;
              const logged = loggedDates.has(key);
              return (
                <button
                  key={key}
                  type="button"
                  disabled={isFuture || !onDayClick}
                  onClick={() => onDayClick?.(key)}
                  title={`${key}${logged ? " · done" : ""}`}
                  className={cn(
                    cellSize,
                    "rounded-[3px] transition",
                    isFuture
                      ? "bg-transparent"
                      : logged
                      ? "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]"
                      : "bg-white/[0.06] hover:bg-white/[0.14]",
                    onDayClick && !isFuture ? "cursor-pointer" : "cursor-default"
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
