import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { TransitionProvider } from "@/components/transition/TransitionProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { cn } from "@/lib/utils";

// Display face for headlines only — everything else stays on Geist. This is
// the single biggest lever against the "Inter/Geist everywhere" AI look:
// Space Grotesk has real character (squared-off curves, a wider stance) that
// a system sans doesn't.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

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
    <html lang="en" className={cn("dark", GeistSans.variable, GeistMono.variable, spaceGrotesk.variable, "font-sans")}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased noise">
        <TooltipProvider delay={200}>
          <TransitionProvider>{children}</TransitionProvider>
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
