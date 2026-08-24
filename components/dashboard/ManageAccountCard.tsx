import Link from "next/link";
import { Card } from "@/components/ui/Card";

const ITEMS = [
  { href: "/dashboard/profile/customize", icon: "🎨", label: "Customize Profile" },
  { href: "/dashboard/profile/links", icon: "🔗", label: "Manage Links" },
  { href: "/dashboard/profile/shop", icon: "🛍", label: "Manage Shop" },
  { href: "/dashboard/profile/templates", icon: "🧩", label: "Browse Templates" },
  { href: "/dashboard/settings", icon: "⚙", label: "Account Settings" },
];

export function ManageAccountCard() {
  return (
    <Card className="p-6">
      <h2 className="text-sm font-medium text-white">Manage your account</h2>
      <p className="mb-4 mt-1 text-xs text-zinc-500">Customize your page, links, and account.</p>
      <div className="space-y-2">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-zinc-200 transition-all duration-200 ease-premium hover:translate-x-0.5 hover:border-violet-500/30 hover:bg-violet-500/[0.08]"
          >
            <span className="transition-transform duration-200 group-hover:scale-110">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </Card>
  );
}
