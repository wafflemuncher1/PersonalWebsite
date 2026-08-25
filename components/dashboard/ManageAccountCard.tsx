import Link from "next/link";
import { Palette, Link2, ShoppingBag, LayoutTemplate, Settings, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";

const ITEMS = [
  { href: "/dashboard/profile/customize", icon: Palette, label: "Customize profile" },
  { href: "/dashboard/profile/links", icon: Link2, label: "Manage links" },
  { href: "/dashboard/profile/shop", icon: ShoppingBag, label: "Manage shop" },
  { href: "/dashboard/profile/templates", icon: LayoutTemplate, label: "Browse templates" },
  { href: "/dashboard/settings", icon: Settings, label: "Account settings" },
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
            className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-zinc-200 transition-all duration-200 ease-premium hover:translate-x-0.5 hover:border-gold-400/25 hover:bg-gold-400/[0.06]"
          >
            <item.icon className="h-4 w-4 shrink-0 text-zinc-500 transition-colors group-hover:text-gold-400" strokeWidth={1.75} />
            <span className="flex-1">{item.label}</span>
            <ArrowRight className="h-3.5 w-3.5 text-zinc-600 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </Card>
  );
}
