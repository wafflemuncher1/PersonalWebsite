import {
  UserCircle,
  Palette,
  Link2,
  ShoppingBag,
  LayoutTemplate,
  Award,
  Moon,
  NotebookPen,
  BookOpen,
  Flame,
  Target,
  Terminal,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export type NavGroup = {
  key: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    key: "profile",
    label: "Profile",
    icon: UserCircle,
    items: [
      { href: "/dashboard/profile/customize", label: "Customize", icon: Palette },
      { href: "/dashboard/profile/links", label: "Links", icon: Link2 },
      { href: "/dashboard/profile/shop", label: "Shop", icon: ShoppingBag },
      { href: "/dashboard/profile/templates", label: "Templates", icon: LayoutTemplate },
      { href: "/dashboard/badges", label: "Badges", icon: Award },
    ],
  },
  {
    key: "lifestyle",
    label: "Lifestyle",
    icon: Moon,
    items: [
      { href: "/dashboard/notes", label: "Notes", icon: NotebookPen },
      { href: "/dashboard/journal", label: "Journal", icon: BookOpen },
      { href: "/dashboard/streaks", label: "Streaks", icon: Flame },
      { href: "/dashboard/goals", label: "Goals", icon: Target },
    ],
  },
];

// Only ever shown to profiles with is_dev = true (set manually in Supabase).
export const DEV_GROUP: NavGroup = {
  key: "developer",
  label: "Developer",
  icon: Terminal,
  items: [
    { href: "/dashboard/developer", label: "Overview", icon: Terminal },
    { href: "/dashboard/developer/users", label: "Users", icon: Users },
  ],
};
