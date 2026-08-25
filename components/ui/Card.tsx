import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("surface rounded-2xl", className)} {...props} />;
}

export function CardHover({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("surface surface-hover rounded-2xl", className)} {...props} />;
}
