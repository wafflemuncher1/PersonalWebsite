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
  show_stats: boolean;
  plan: Plan;
  subscription_status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  view_count: number;
  dashboard2_layout: string[] | null;
  created_at: string;
  updated_at: string;
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
