import { redirect } from "next/navigation";

// Dashboard Builder was retired — bounce anyone who still has this URL
// bookmarked over to Dashboard 2 instead of leaving a dead page up. The
// component this page used to render (DashboardBuilder.tsx) and its widget
// registry are left in place but unused, since there's no way to delete
// files in this environment — nothing imports them anymore, so they're
// inert.
export default function DashboardBuilderPage() {
  redirect("/dashboard/dashboard-2");
}
