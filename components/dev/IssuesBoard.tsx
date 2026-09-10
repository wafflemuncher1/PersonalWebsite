"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Bug, CheckCircle2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HeroStat } from "@/components/dashboard/HeroStat";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { relativeTime } from "@/lib/utils";
import type { IssueReportWithReporter, IssueSeverity, IssueStatus } from "@/lib/types";

const SEVERITY_BADGE: Record<IssueSeverity, "destructive" | "secondary" | "outline"> = {
  critical: "destructive",
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

const STATUS_OPTIONS: { key: IssueStatus; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In progress" },
  { key: "resolved", label: "Resolved" },
  { key: "wontfix", label: "Won't fix" },
];

type StatusFilter = "all" | IssueStatus;

export function IssuesBoard({ initialReports }: { initialReports: IssueReportWithReporter[] }) {
  const [reports, setReports] = useState<IssueReportWithReporter[]>(initialReports);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const supabase = createClient();

  const filtered = useMemo(
    () => (statusFilter === "all" ? reports : reports.filter((r) => r.status === statusFilter)),
    [reports, statusFilter]
  );

  const openCount = reports.filter((r) => r.status === "open").length;
  const criticalCount = reports.filter((r) => r.severity === "critical" && r.status === "open").length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;

  async function setStatus(id: string, status: IssueStatus) {
    const patch = { status, resolved_at: status === "resolved" ? new Date().toISOString() : null };
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    await supabase.from("issue_reports").update(patch).eq("id", id);
  }

  async function remove(id: string) {
    setReports((prev) => prev.filter((r) => r.id !== id));
    await supabase.from("issue_reports").delete().eq("id", id);
  }

  return (
    <div>
      <Reveal>
        <div className="mb-6">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Issues</h1>
          <p className="mt-1 text-sm text-muted-foreground">Everything testers have flagged, in one inbox.</p>
        </div>
      </Reveal>

      {reports.length > 0 && (
        <RevealGroup className="mb-6 grid grid-cols-3 gap-3" stagger={0.07}>
          <RevealItem>
            <HeroStat icon={<Bug className="h-4 w-4" />} label="Open" value={openCount} />
          </RevealItem>
          <RevealItem>
            <HeroStat icon={<AlertTriangle className="h-4 w-4" />} label="Critical & open" value={criticalCount} />
          </RevealItem>
          <RevealItem>
            <HeroStat icon={<CheckCircle2 className="h-4 w-4" />} label="Resolved" value={resolvedCount} />
          </RevealItem>
        </RevealGroup>
      )}

      <div className="mb-4 flex items-center gap-2">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.key} value={s.key}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
          Nothing here — clean slate.
        </div>
      ) : (
        <RevealGroup className="space-y-2.5" stagger={0.04}>
          {filtered.map((r) => (
            <RevealItem key={r.id}>
              <Card className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium">{r.title}</p>
                      <Badge variant={SEVERITY_BADGE[r.severity]}>{r.severity}</Badge>
                    </div>
                    {r.description && <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>}
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] text-muted-foreground">
                      <span>@{r.profiles?.username ?? "unknown"}</span>
                      <span>·</span>
                      <span>{relativeTime(r.created_at)}</span>
                      {r.page_path && (
                        <>
                          <span>·</span>
                          <span className="truncate">{r.page_path}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Select value={r.status} onValueChange={(v) => setStatus(r.id, v as IssueStatus)}>
                      <SelectTrigger className="h-8 w-[140px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s.key} value={s.key}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button
                      onClick={() => remove(r.id)}
                      title="Delete report"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      )}
    </div>
  );
}
