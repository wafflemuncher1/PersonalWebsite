import { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatTile({
  icon,
  title,
  value,
  sub,
  href,
}: {
  icon: ReactNode;
  title: string;
  value: ReactNode;
  sub?: string;
  href: string;
}) {
  return (
    <div
      className={cn(
        "glass-inset glass-inset-hover group flex flex-col rounded-xl p-5 transition-all duration-200 ease-premium hover:border-primary/25"
      )}
    >
      <div className="mb-2.5 flex items-center gap-2 text-sm font-medium text-foreground">
        <span className="text-muted-foreground transition-transform duration-200 group-hover:scale-110 group-hover:text-primary">
          {icon}
        </span>
        {title}
      </div>
      <div className="line-clamp-1 text-lg font-semibold">{value}</div>
      {sub && <div className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{sub}</div>}
      <Link
        href={href}
        className="mt-auto flex items-center gap-1 pt-3 text-sm font-medium text-primary transition-all duration-200 hover:gap-2"
      >
        View more <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
