import { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
    <div className="group flex flex-col rounded-xl border border-white/5 bg-white/[0.02] p-5 transition-all duration-200 ease-premium hover:border-gold-400/20 hover:bg-white/[0.035]">
      <div className="mb-2.5 flex items-center gap-2 text-sm font-medium text-zinc-300">
        <span className="text-zinc-500 transition-transform duration-200 group-hover:scale-110 group-hover:text-gold-400">
          {icon}
        </span>
        {title}
      </div>
      <div className="line-clamp-1 text-lg font-semibold text-white">{value}</div>
      {sub && <div className="mt-1.5 line-clamp-2 text-sm text-zinc-400">{sub}</div>}
      <Link
        href={href}
        className="mt-auto flex items-center gap-1 pt-3 text-sm font-medium text-gold-400 transition-all duration-200 hover:gap-2 hover:text-gold-300"
      >
        View more <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
