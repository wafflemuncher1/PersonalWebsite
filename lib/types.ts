export type Plan = "free" | "pro";
export type SubscriptionStatus =
  | "inactive"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled";

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
  sort_order: number;
  created_at: string;
};

// Saved shape for the Dashboard Builder: `layout` is the ordered list of
// top-level widget keys on Dashboard 2; `accountStats` are stat widget keys
// the user has nested inside the Account Statistics widget instead of
// leaving as their own default tiles.
export type Dashboard2Layout = {
  layout: string[];
  accountStats: string[];
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
  name_animation: "none" | "typewriter" | "scramble" | "wave";
  name_font_size: number;
  name_bold: boolean;
  name_italic: boolean;
  description_font_size: number;
  description_bold: boolean;
  description_italic: boolean;
  description_color: string;
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
  show_stats: boolean;
  username_changed_at: string | null;
  is_dev: boolean;
  plan: Plan;
  subscription_status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  view_count: number;
  dashboard2_layout: Dashboard2Layout | null;
  customizer2_settings: Customizer2Settings | null;
  created_at: string;
  updated_at: string;
};

// State for the test "Profile Customizer 2" page. Fully separate from the
// real bio/location/avatar_url/background_url fields above — nothing here
// touches the live public profile.
export type Customizer2Settings = {
  backgroundUrl: string;
  avatarUrl: string;
  cursorUrl: string;
  cursorEffect: string;
  frame: string;
  opacity: number;
  blur: number;
  profileEffect: string;
  backgroundEffect: string;
  location: string;
  description: string;
  audioUrl: string;
  audioAutoplay: boolean;
  glow: {
    username: boolean;
    socials: boolean;
    badges: boolean;
  };
  colors: {
    accent: string;
    text: string;
    background: string;
    icon: string;
    backgroundEffect: string;
    primary: string;
    secondary: string;
    name: string;
    description: string;
    location: string;
    uid: string;
  };
  disableGradients: boolean;
  toggles: {
    monochromeIcons: boolean;
    animatedTitle: boolean;
    swapBoxColors: boolean;
    volumeControl: boolean;
    useDiscordAvatar: boolean;
    discordAvatarDecoration: boolean;
    statsCorner: boolean;
  };
};

export type Mood = "great" | "good" | "neutral" | "low" | "rough";

export type JournalEntry = {
  id: string;
  user_id: string;
  mood: Mood;
  entry: string;
  created_at: string;
  updated_at: string;
};

export type PublicStats = {
  goals_completed: number;
  active_goals: number;
  active_streaks: number;
  total_check_ins: number;
};

export type ProfileViewEvent = {
  id: string;
  profile_id: string;
  viewed_at: string;
  country: string | null;
  device: string | null;
};

export type LinkClickEvent = {
  id: string;
  profile_id: string;
  link_label: string;
  link_url: string;
  clicked_at: string;
};

export type Note = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  pinned: boolean;
  color: string;
  created_at: string;
  updated_at: string;
};

export type GoalCategory = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  sort_order: number;
  created_at: string;
};

export type GoalStatus = "active" | "completed" | "archived";
export type GoalPriority = "low" | "medium" | "high";

export type Goal = {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  description: string;
  status: GoalStatus;
  priority: GoalPriority;
  progress: number;
  target_date: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

export type Streak = {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  color: string;
  goal_per_week: number;
  archived: boolean;
  created_at: string;
};

export type StreakLog = {
  id: string;
  user_id: string;
  streak_id: string;
  log_date: string;
  note: string | null;
  created_at: string;
};
