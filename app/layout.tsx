import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { TransitionProvider } from "@/components/transition/TransitionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nocturne: bio link + private life tracker",
    template: "%s · Nocturne",
  },
  description:
    "Nocturne: a public bio-link page out front, a private notes/goals/streaks/journal dashboard behind it.",
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-ink-950 font-sans antialiased noise">
        <TransitionProvider>{children}</TransitionProvider>
      </body>
    </html>
  );
}
