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
