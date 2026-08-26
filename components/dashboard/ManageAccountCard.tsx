import Link from "next/link";
import { Palette, Link2, ShoppingBag, LayoutTemplate, Settings, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const ITEMS = [
  { href: "/dashboard/profile/customize", icon: Palette, label: "Customize profile" },
  { href: "/dashboard/profile/links", icon: Link2, label: "Manage links" },
  { href: "/dashboard/profile/shop", icon: ShoppingBag, label: "Manage shop" },
  { href: "/dashboard/profile/templates", icon: LayoutTemplate, label: "Browse templates" },
  { href: "/dashboard/settings", icon: Settings, label: "Account settings" },
];

export function ManageAccountCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage your account</CardTitle>
        <CardDescription>Customize your page, links, and account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-2.5 text-sm font-medium transition-all duration-200 ease-premium hover:translate-x-0.5 hover:border-primary/25 hover:bg-primary/[0.06]"
          >
            <item.icon className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" strokeWidth={1.75} />
            <span className="flex-1">{item.label}</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
