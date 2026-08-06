import { createClient } from "@/lib/supabase/server";
import { CustomizeForm } from "@/components/profile/CustomizeForm";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CustomizePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    profile = (data as Profile) ?? null;
  }

  return <CustomizeForm profile={profile} />;
}
