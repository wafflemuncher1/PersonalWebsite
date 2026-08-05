import { createClient } from "@/lib/supabase/server";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    profile = (data as Profile) ?? null;
  }

  return (
    <SettingsPanel
      email={user?.email ?? ""}
      createdAt={user?.created_at ?? ""}
      lastSignInAt={user?.last_sign_in_at ?? ""}
      profile={profile}
    />
  );
}
