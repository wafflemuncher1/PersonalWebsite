import { ReactNode } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export function SectionSummaryCard({
  icon,
  title,
  value,
  label,
  href,
  cta = "View more",
}: {
  icon: string;
  title: string;
  value: ReactNode;
  label: string;
  href: string;
  cta?: string;
}) {
  return (
    <Card className="flex flex-col p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-300">
        <span>{icon}</span> {title}
      </div>
      <div className="font-display text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-xs text-zinc-500">{label}</div>
      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-violet-400 transition hover:text-violet-300"
      >
        {cta} →
      </Link>
    </Card>
  );
}
