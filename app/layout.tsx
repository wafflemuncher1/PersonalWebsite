import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { TransitionProvider } from "@/components/transition/TransitionProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Nocturne — bio link + private life tracker",
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
    <html lang="en" className={`dark ${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-ink-950 font-sans antialiased noise">
        <TransitionProvider>{children}</TransitionProvider>
      </body>
    </html>
  );
}
