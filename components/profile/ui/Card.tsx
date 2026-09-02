import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// Forked from the old components/ui/Card so the profile-customizer surface
// (CustomizeForm, LinksForm, ShopForm) keeps its exact look and simple
// flat API, independent of whatever components/ui/Card.tsx becomes for
// the dashboard redesign.
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("glass rounded-3xl", className)} {...props} />;
}

export function CardHover({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("glass glass-hover rounded-3xl", className)} {...props} />;
}
