import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("glass rounded-3xl", className)} {...props} />;
}

export function CardHover({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("glass glass-hover rounded-3xl", className)} {...props} />;
}
