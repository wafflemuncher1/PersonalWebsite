import {
  UserCircle,
  Palette,
  Link2,
  ShoppingBag,
  LayoutTemplate,
  Terminal,
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
    ],
  },
];

// Only ever shown to profiles with role = 'dev'.
export const DEV_GROUP: NavGroup = {
  key: "developer",
  label: "Developer",
  icon: Terminal,
  items: [{ href: "/dashboard/developer", label: "Developer", icon: Terminal }],
};
