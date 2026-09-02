export type ProfileLink = {
  label: string;
  url: string;
  icon?: string;
};

// Row shape for the profile_links table — the structured, platform-aware
// replacement for the freeform ProfileLink jsonb above. Rendered live on the
// public page under the description via LinkWidgets.
export type ProfileLinkItem = {
  id: string;
  profile_id: string;
  platform: "youtube" | "tiktok" | "instagram" | "facebook" | "custom";
  url: string;
  label: string | null;
  is_custom_logo: boolean;
  custom_color: string | null;
  icon_choice: "youtube" | "tiktok" | "instagram" | "facebook" | null;
  glow_enabled: boolean;
  glow_strength: number;
  glow_color: string;
  custom_icon_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

// Row shape for the profile_shop_items table — user-listed items shown on
// the public profile's Shop page (image square + name/description box,
// clicking through to link_url). Mirrors the profile_links pattern.
export type ShopItem = {
  id: string;
  profile_id: string;
  image_url: string;
  name: string;
  description: string;
  link_url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type Profile = {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  location: string;
  avatar_url: string | null;
  background_url: string | null;
  links: ProfileLink[];
  theme: string;
  layout: "top" | "side";
  bg_type: "solid" | "gradient" | "image" | "video";
  bg_color: string;
  bg_color_2: string;
  background_video_url: string;
  cursor_animation:
    | "none"
    | "sparkle"
    | "glow"
    | "rainbow"
    | "bubble"
    | "fire"
    | "snow"
    | "confetti"
    | "emoji"
    | "trail";
  cursor_color: string;
  name_color: string;
  name_animation: "none" | "typewriter" | "scramble" | "wave" | "bounce" | "shimmer" | "glitch";
  name_font_size: number;
  name_bold: boolean;
  name_italic: boolean;
  name_font: string;
  description_font_size: number;
  description_bold: boolean;
  description_italic: boolean;
  description_color: string;
  description_animation: "none" | "typewriter" | "scramble";
  description_font: string;
  name_glow_enabled: boolean;
  name_glow_strength: number;
  name_glow_color: string;
  cursor_emoji: string;
  profile_effect: "none" | "spin" | "pulse" | "rainbow" | "sparkle";
  card_color: string;
  card_opacity: number;
  card_border_color: string;
  card_outline_enabled: boolean;
  card_outline_width: number;
  show_location: boolean;
  location_position: "bottom-left" | "bottom-right" | "card";
  link_widget_size: number;
  audio_url: string;
  audio_title: string;
  audio_cover_url: string;
  audio_name_color: string;
  audio_name_font_size: number;
  audio_name_bold: boolean;
  audio_name_font: string;
  audio_glow_enabled: boolean;
  audio_glow_strength: number;
  audio_glow_color: string;
  intro_text: string;
  intro_text_color: string;
  intro_text_font_size: number;
  intro_glow_enabled: boolean;
  intro_glow_strength: number;
  intro_glow_color: string;
  about_me: string;
  about_text_color: string;
  about_text_font_size: number;
  about_text_bold: boolean;
  about_text_font: string;
  about_glow_enabled: boolean;
  about_glow_strength: number;
  about_glow_color: string;
  about_box_color: string;
  about_box_opacity: number;
  about_box_outline_enabled: boolean;
  about_box_outline_width: number;
  about_box_border_color: string;
  secondary_box_color: string;
  secondary_box_opacity: number;
  secondary_box_outline_enabled: boolean;
  secondary_box_outline_width: number;
  secondary_box_border_color: string;
  shop_title: string;
  shop_box_color: string;
  shop_box_opacity: number;
  shop_box_outline_enabled: boolean;
  shop_box_outline_width: number;
  shop_box_border_color: string;
  shop_name_color: string;
  shop_desc_color: string;
  shop_text_font: string;
  about_me_enabled: boolean;
  shop_enabled: boolean;
  journal_heatmap_enabled: boolean;
  show_stats: boolean;
  username_changed_at: string | null;
  role: "normal" | "tester" | "dev";
  is_banned: boolean;
  banned_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
};

// Badge catalog — never written to by users, only by us. `icon` is a key
// into lib/badge-icons.ts, not a literal component.
export type BadgeDef = {
  key: string;
  name: string;
  description: string;
  icon: string;
  created_at: string;
};

export type Streak = {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  color: string;
  goal_per_week: number;
  archived: boolean;
  show_on_profile: boolean;
  created_at: string;
};
