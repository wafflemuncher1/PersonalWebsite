import { createClient } from "@/lib/supabase/server";
import { ReportIssueForm } from "@/components/testing/ReportIssueForm";
import type { IssueReport } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ReportIssuePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Explicitly scoped to the signed-in user — RLS alone would let a dev see
  // everyone's reports here too, but this page is "your reports," not the
  // triage inbox (that's /dashboard/developer/issues).
  const { data: reports } = await supabase
    .from("issue_reports")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  return <ReportIssueForm initialReports={(reports ?? []) as IssueReport[]} />;
}
