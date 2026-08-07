import { ReactNode } from "react";
import Link from "next/link";

export function StatTile({
  icon,
  title,
  value,
  sub,
  href,
}: {
  icon: string;
  title: string;
  value: ReactNode;
  sub?: string;
  href: string;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-white/5 bg-white/[0.02] p-5">
      <div className="mb-2.5 flex items-center gap-2 text-sm font-medium text-zinc-300">
        <span className="text-base">{icon}</span> {title}
      </div>
      <div className="line-clamp-1 text-lg font-semibold text-white">{value}</div>
      {sub && <div className="mt-1.5 line-clamp-2 text-sm text-zinc-400">{sub}</div>}
      <Link
        href={href}
        className="mt-auto pt-3 text-sm font-medium text-violet-400 transition hover:text-violet-300"
      >
        View more →
      </Link>
    </div>
  );
}
