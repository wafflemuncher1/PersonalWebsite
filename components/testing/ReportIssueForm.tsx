"use client";

import { useState } from "react";
import { Bug, CheckCircle2, Clock, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { relativeTime } from "@/lib/utils";
import type { IssueReport, IssueSeverity, IssueStatus } from "@/lib/types";

const SEVERITY_BADGE: Record<IssueSeverity, "destructive" | "secondary" | "outline"> = {
  critical: "destructive",
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

const STATUS_META: Record<IssueStatus, { label: string; icon: typeof Clock; className: string }> = {
  open: { label: "Open", icon: Clock, className: "text-muted-foreground" },
  in_progress: { label: "In progress", icon: Clock, className: "text-primary" },
  resolved: { label: "Resolved", icon: CheckCircle2, className: "text-emerald-400" },
  wontfix: { label: "Won't fix", icon: XCircle, className: "text-muted-foreground" },
};

export function ReportIssueForm({ initialReports }: { initialReports: IssueReport[] }) {
  const [reports, setReports] = useState<IssueReport[]>(initialReports);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<IssueSeverity>("medium");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  async function submit() {
    if (!title.trim() || saving) return;
    setSaving(true);
    setError("");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("issue_reports")
      .insert({
        title: title.trim(),
        description: description.trim(),
        severity,
        page_path: typeof window !== "undefined" ? window.location.pathname : "",
        user_id: user?.id,
      })
      .select()
      .single();
    if (error) {
      setError(error.message);
    } else if (data) {
      setReports((prev) => [data as IssueReport, ...prev]);
      setTitle("");
      setDescription("");
      setSeverity("medium");
    }
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Reveal>
        <div className="mb-6">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Report an issue</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Found a bug or something that feels off? Log it here — it goes straight to the dev.
          </p>
        </div>
      </Reveal>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>New report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="What happened? (short summary)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <Textarea
            placeholder="Steps to reproduce, what you expected, anything else useful (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
          <div className="flex items-center justify-between gap-3">
            <Select value={severity} onValueChange={(v) => setSeverity(v as IssueSeverity)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={submit} disabled={saving || !title.trim()}>
              {saving ? "Submitting…" : "Submit report"}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Your reports</h2>

      {reports.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          <Bug className="mx-auto mb-2 h-5 w-5 opacity-50" />
          Nothing reported yet.
        </div>
      ) : (
        <RevealGroup className="space-y-2.5" stagger={0.05}>
          {reports.map((r) => {
            const meta = STATUS_META[r.status];
            const StatusIcon = meta.icon;
            return (
              <RevealItem key={r.id}>
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium">{r.title}</p>
                        <Badge variant={SEVERITY_BADGE[r.severity]}>{r.severity}</Badge>
                      </div>
                      {r.description && <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>}
                      <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
                        {relativeTime(r.created_at)}
                      </p>
                    </div>
                    <div className={`flex shrink-0 items-center gap-1 text-xs font-medium ${meta.className}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {meta.label}
                    </div>
                  </div>
                </Card>
              </RevealItem>
            );
          })}
        </RevealGroup>
      )}
    </div>
  );
}
