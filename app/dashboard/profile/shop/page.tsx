import { createClient } from "@/lib/supabase/server";
import { ShopForm } from "@/components/profile/ShopForm";
import type { Profile, ShopItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProfileShopPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  let items: ShopItem[] = [];
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    profile = (data as Profile) ?? null;

    const { data: itemRows } = await supabase
      .from("profile_shop_items")
      .select("*")
      .eq("profile_id", user.id)
      .order("sort_order", { ascending: true });
    items = (itemRows as ShopItem[]) ?? [];
  }

  return <ShopForm profile={profile} initialItems={items} />;
}
