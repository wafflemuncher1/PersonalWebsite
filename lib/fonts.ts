import {
  Poppins,
  Montserrat,
  Bebas_Neue,
  Space_Grotesk,
  Playfair_Display,
  Orbitron,
  Permanent_Marker,
  Press_Start_2P,
} from "next/font/google";

// A small curated catalog of Google Fonts a profile can pick for its
// display name, description, and audio track name. Loaded once here (per
// next/font's requirement that font loader calls be static, top-level, and
// evaluated at build time — not something we can invoke dynamically per
// profile) and looked up by key at render time. Every font is fixed at
// weight 400 rather than trying to load per-font weight ranges: some of
// these are non-variable single-weight fonts and next/font's `weight`
// option type differs per font family, so pinning everything to the one
// weight every family is guaranteed to have keeps this simple and avoids
// guessing at each font's supported weight list. Bold/italic toggles still
// apply on top via CSS (the browser synthesizes them), which is a fine
// trade-off for a customization picker like this.
const poppins = Poppins({ subsets: ["latin"], weight: "400", display: "swap" });
const montserrat = Montserrat({ subsets: ["latin"], weight: "400", display: "swap" });
const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: "400", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: "400", display: "swap" });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], weight: "400", display: "swap" });
const orbitron = Orbitron({ subsets: ["latin"], weight: "400", display: "swap" });
const permanentMarker = Permanent_Marker({ subsets: ["latin"], weight: "400", display: "swap" });
const pressStart2p = Press_Start_2P({ subsets: ["latin"], weight: "400", display: "swap" });

export type FontKey =
  | "default"
  | "poppins"
  | "montserrat"
  | "bebas-neue"
  | "space-grotesk"
  | "playfair-display"
  | "orbitron"
  | "permanent-marker"
  | "press-start-2p";

export const FONT_OPTIONS: { key: FontKey; label: string; className: string }[] = [
  { key: "default", label: "Default", className: "" },
  { key: "poppins", label: "Poppins", className: poppins.className },
  { key: "montserrat", label: "Montserrat", className: montserrat.className },
  { key: "bebas-neue", label: "Bebas Neue", className: bebasNeue.className },
  { key: "space-grotesk", label: "Space Grotesk", className: spaceGrotesk.className },
  { key: "playfair-display", label: "Playfair Display", className: playfairDisplay.className },
  { key: "orbitron", label: "Orbitron", className: orbitron.className },
  { key: "permanent-marker", label: "Permanent Marker", className: permanentMarker.className },
  { key: "press-start-2p", label: "Press Start 2P", className: pressStart2p.className },
];

// Looks up the next/font className for a stored font key — "" (meaning "no
// override, inherit the site's default font") for "default" or anything
// unrecognized.
export function fontClassName(key: string | null | undefined): string {
  return FONT_OPTIONS.find((f) => f.key === key)?.className ?? "";
}
