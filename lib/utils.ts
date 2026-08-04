import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function toDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " · " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function relativeTime(dateStr: string): string {
  const now = new Date().getTime();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(dateStr.slice(0, 10));
}

/** Build a week-major grid of dates ending today, going back `weeksCount` weeks, aligned Sun–Sat. */
export function buildWeeks(weeksCount: number): Date[][] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfWeek = addDays(today, 6 - today.getDay()); // upcoming Saturday
  const start = addDays(endOfWeek, -(weeksCount * 7 - 1));

  const weeks: Date[][] = [];
  let cursor = start;
  for (let w = 0; w < weeksCount; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(cursor);
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  }
  return weeks;
}

/** Given a sorted set of ISO date-key strings (YYYY-MM-DD), compute current & longest streak. */
export function computeStreakStats(dateKeys: Set<string>) {
  let longest = 0;
  let current = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  // current streak: walk backward from today (or yesterday if today not logged yet)
  if (!dateKeys.has(toDateKey(cursor))) {
    cursor = addDays(cursor, -1);
  }
  while (dateKeys.has(toDateKey(cursor))) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  // longest streak: scan all logged dates
  const sorted = Array.from(dateKeys).sort();
  let run = 0;
  let prev: Date | null = null;
  for (const key of sorted) {
    const d = new Date(key + "T00:00:00");
    if (prev && toDateKey(addDays(prev, 1)) === key) {
      run += 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    prev = d;
  }

  return { current, longest, total: dateKeys.size };
}
