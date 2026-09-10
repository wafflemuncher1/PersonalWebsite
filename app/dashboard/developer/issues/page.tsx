import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IssuesBoard } from "@/components/dev/IssuesBoard";
import type { IssueReportWithReporter } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DeveloperIssuesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "dev") {
    redirect("/dashboard/profile/customize");
  }

  const { data: reports } = await supabase
    .from("issue_reports")
    .select("*, profiles(username, display_name)")
    .order("created_at", { ascending: false });

  return <IssuesBoard initialReports={(reports ?? []) as unknown as IssueReportWithReporter[]} />;
}
