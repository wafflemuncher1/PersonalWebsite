import Link from "next/link";
import { Eye, Link2, Target, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HeroStat } from "@/components/dashboard/HeroStat";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { cn, toDateKey, addDays } from "@/lib/utils";
import type { LinkClickEvent, Profile, ProfileViewEvent } from "@/lib/types";

export const dynamic = "force-dynamic";

const RANGES = [
  { key: "3", label: "3 days" },
  { key: "7", label: "7 days" },
  { key: "30", label: "30 days" },
] as const;

function deviceEmoji(device: string) {
  if (device === "Mobile") return "📱";
  if (device === "Tablet") return "📟";
  if (device === "Desktop") return "🖥";
  return "❓";
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { range?: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rangeKey = RANGES.some((r) => r.key === searchParams.range) ? searchParams.range! : "7";
  const rangeDays = parseInt(rangeKey, 10);

  const { data: profileData } = user
    ? await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
    : { data: null };
  const profile = profileData as Profile | null;

  const startDate = addDays(new Date(), -(rangeDays - 1));
  startDate.setHours(0, 0, 0, 0);

  const [{ data: viewEvents }, { data: clickEvents }] = profile
    ? await Promise.all([
        supabase
          .from("profile_view_events")
          .select("*")
          .eq("profile_id", profile.id)
          .gte("viewed_at", startDate.toISOString())
          .order("viewed_at", { ascending: true }),
        supabase
          .from("link_click_events")
          .select("*")
          .eq("profile_id", profile.id)
          .gte("clicked_at", startDate.toISOString())
          .order("clicked_at", { ascending: true }),
      ])
    : [{ data: [] }, { data: [] }];

  const views = (viewEvents ?? []) as ProfileViewEvent[];
  const clicks = (clickEvents ?? []) as LinkClickEvent[];

  const totalClicks = clicks.length;
  const totalViews = views.length;
  const clickRate = totalViews > 0 ? Math.round((totalClicks / totalViews) * 1000) / 10 : 0;
  const avgDailyViews = Math.round((totalViews / rangeDays) * 10) / 10;

  // Daily views bucketed for the chart
  const dayBuckets: { key: string; label: string; count: number }[] = [];
  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = addDays(new Date(), -i);
    const key = toDateKey(d);
    dayBuckets.push({
      key,
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: 0,
    });
  }
  const bucketByKey = new Map(dayBuckets.map((b) => [b.key, b]));
  for (const v of views) {
    const key = toDateKey(new Date(v.viewed_at));
    const bucket = bucketByKey.get(key);
    if (bucket) bucket.count += 1;
  }
  const maxDaily = Math.max(1, ...dayBuckets.map((b) => b.count));

  // Devices
  const deviceCounts = new Map<string, number>();
  for (const v of views) {
    const d = v.device || "Unknown";
    deviceCounts.set(d, (deviceCounts.get(d) ?? 0) + 1);
  }
  const deviceRows = Array.from(deviceCounts.entries()).sort((a, b) => b[1] - a[1]);
  const maxDevice = Math.max(1, ...deviceRows.map(([, c]) => c));

  // Countries
  const countryCounts = new Map<string, number>();
  for (const v of views) {
    const c = v.country || "Unknown";
    countryCounts.set(c, (countryCounts.get(c) ?? 0) + 1);
  }
  const countryRows = Array.from(countryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxCountry = Math.max(1, ...countryRows.map(([, c]) => c));

  return (
    <div className="space-y-8">
      <Reveal>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Account Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your profile performance and see how many people are visiting your profile.
        </p>
      </Reveal>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-2xl border bg-muted/30 p-1">
          {RANGES.map((r) => (
            <Link
              key={r.key}
              href={`/dashboard/analytics?range=${r.key}`}
              className={cn(
                "rounded-xl px-3.5 py-1.5 text-xs font-medium transition duration-200 ease-premium active:scale-95",
                rangeKey === r.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              Last {r.label}
            </Link>
          ))}
        </div>
        <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Last updated just now</p>
      </div>

      <RevealGroup className="grid grid-cols-2 gap-4 lg:grid-cols-4" stagger={0.07}>
        <RevealItem>
          <HeroStat icon={<Link2 className="h-4 w-4" />} label="Total link clicks" value={totalClicks} />
        </RevealItem>
        <RevealItem>
          <HeroStat icon={<Target className="h-4 w-4" />} label="Click rate" value={`${clickRate}%`} />
        </RevealItem>
        <RevealItem>
          <HeroStat icon={<Eye className="h-4 w-4" />} label="Profile views" value={totalViews} />
        </RevealItem>
        <RevealItem>
          <HeroStat
            icon={<TrendingUp className="h-4 w-4" />}
            label="Avg. daily views"
            value={avgDailyViews.toLocaleString()}
          />
        </RevealItem>
      </RevealGroup>

      <Reveal delay={0.08}>
        <Card>
          <CardHeader>
            <CardTitle>Profile views</CardTitle>
            <CardDescription>In the last {rangeDays} days</CardDescription>
          </CardHeader>
          <CardContent>
            {totalViews === 0 ? (
              <EmptyChart message="No views yet in this range." />
            ) : (
              <div className="flex h-40 items-end gap-1.5">
                {dayBuckets.map((b) => (
                  <div key={b.key} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-32 w-full items-end">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-primary/50 to-primary transition-all duration-500 ease-premium hover:from-primary/70 hover:to-primary"
                        style={{ height: `${Math.max(4, (b.count / maxDaily) * 100)}%` }}
                        title={`${b.label}: ${b.count}`}
                      />
                    </div>
                    {(rangeDays <= 7 || dayBuckets.indexOf(b) % Math.ceil(rangeDays / 8) === 0) && (
                      <span className="font-mono text-[9px] text-muted-foreground">{b.label}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Reveal>

      <RevealGroup className="grid gap-6 lg:grid-cols-2" stagger={0.08}>
        <RevealItem>
          <Card>
            <CardHeader>
              <CardTitle>Visitor devices</CardTitle>
            </CardHeader>
            <CardContent>
              {deviceRows.length === 0 ? (
                <EmptyChart message="No device data yet." />
              ) : (
                <div className="space-y-3">
                  {deviceRows.map(([device, count]) => (
                    <div key={device}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-foreground/90">
                          <span>{deviceEmoji(device)}</span> {device}
                        </span>
                        <span className="font-mono text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-700 ease-premium"
                          style={{ width: `${Math.max(4, (count / maxDevice) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </RevealItem>

        <RevealItem>
          <Card>
            <CardHeader>
              <CardTitle>Top countries by views</CardTitle>
            </CardHeader>
            <CardContent>
              {countryRows.length === 0 ? (
                <EmptyChart message="No location data yet." />
              ) : (
                <div className="space-y-3">
                  {countryRows.map(([country, count]) => (
                    <div key={country}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-foreground/90">{country}</span>
                        <span className="font-mono text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-700 ease-premium"
                          style={{ width: `${Math.max(4, (count / maxCountry) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </RevealItem>
      </RevealGroup>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-24 items-center justify-center rounded-lg border border-dashed">
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
  );
}
