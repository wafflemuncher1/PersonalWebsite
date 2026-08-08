import { createClient } from "@/lib/supabase/server";
import { LinksForm } from "@/components/profile/LinksForm";
import type { Profile, ProfileLinkItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProfileLinksPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  let links: ProfileLinkItem[] = [];
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    profile = (data as Profile) ?? null;

    const { data: linkRows } = await supabase
      .from("profile_links")
      .select("*")
      .eq("profile_id", user.id)
      .order("sort_order", { ascending: true });
    links = (linkRows as ProfileLinkItem[]) ?? [];
  }

  return <LinksForm profile={profile} initialLinks={links} />;
}
