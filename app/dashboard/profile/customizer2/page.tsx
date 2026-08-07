import { createClient } from "@/lib/supabase/server";
import { mergeCustomizer2Settings } from "@/lib/customizer-presets";
import { ProfileCustomizer2 } from "@/components/customizer2/ProfileCustomizer2";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Customizer2Page() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profileData } = user
    ? await supabase
        .from("profiles")
        .select("id, username, display_name, customizer2_settings")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const profile = profileData as Pick<Profile, "id" | "username" | "display_name" | "customizer2_settings"> | null;

  const initialSettings = mergeCustomizer2Settings(profile?.customizer2_settings);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Customizer 2</h1>
        <p className="mt-1 text-sm text-zinc-500">
          An experimental, more advanced profile customizer. Once you hit Save, these settings go live on your
          public profile page.
        </p>
      </div>

      <ProfileCustomizer2
        initialSettings={initialSettings}
        profileId={profile?.id}
        displayName={profile?.display_name ?? ""}
        username={profile?.username ?? ""}
      />
    </div>
  );
}
