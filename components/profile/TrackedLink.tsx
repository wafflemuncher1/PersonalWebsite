"use client";

import type { ReactNode } from "react";
import { trackLinkClick } from "@/lib/track-click";

export function TrackedLink({
  username,
  label,
  url,
  className,
  style,
  children,
}: {
  username: string;
  label: string;
  url: string;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackLinkClick(username, label, url)}
      className={className}
      style={style}
    >
      {children}
    </a>
  );
}
