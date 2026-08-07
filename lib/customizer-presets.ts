import type { Customizer2Settings } from "@/lib/types";

export const DEFAULT_CUSTOMIZER2_SETTINGS: Customizer2Settings = {
  backgroundUrl: "",
  avatarUrl: "",
  cursorUrl: "",
  frame: "none",
  opacity: 100,
  blur: 0,
  profileEffect: "none",
  backgroundEffect: "none",
  location: "",
  description: "",
  glow: { username: false, socials: false, badges: false },
  colors: {
    accent: "#8b5cf6",
    text: "#ffffff",
    background: "#050308",
    icon: "#a78bfa",
    backgroundEffect: "#8b5cf6",
    primary: "#8b5cf6",
    secondary: "#6d28d9",
  },
  disableGradients: false,
  toggles: {
    monochromeIcons: false,
    animatedTitle: false,
    swapBoxColors: false,
    volumeControl: false,
    useDiscordAvatar: false,
    discordAvatarDecoration: false,
  },
};

export type FramePreset = { key: string; label: string; className: string };

// Purely CSS-driven "frame" rings around the avatar — no image assets needed.
export const FRAME_PRESETS: FramePreset[] = [
  { key: "none", label: "None", className: "" },
  { key: "neon", label: "Neon Ring", className: "ring-2 ring-violet-400 shadow-[0_0_24px_4px_rgba(139,92,246,0.55)]" },
  { key: "dashed", label: "Dashed", className: "border-2 border-dashed border-white/50" },
  { key: "double", label: "Double Ring", className: "ring-4 ring-white/15 ring-offset-2 ring-offset-ink-950 border-2 border-violet-400" },
  { key: "pulse", label: "Pulse Glow", className: "ring-2 ring-violet-400 animate-pulse-glow shadow-[0_0_20px_2px_rgba(139,92,246,0.4)]" },
  { key: "spin", label: "Spinning Gradient", className: "__spin_gradient__" },
];

export type EffectPreset = { key: string; label: string; icon: string; description: string };

// "Profile effects" — opened via a flyout menu, layered on/around the preview card.
export const PROFILE_EFFECTS: EffectPreset[] = [
  { key: "none", label: "None", icon: "▢", description: "No extra effect." },
  { key: "sparkle", label: "Sparkle", icon: "✨", description: "Twinkling sparkles around your card." },
  { key: "floating", label: "Floating", icon: "◌", description: "Soft floating particles." },
  { key: "glow-pulse", label: "Glow Pulse", icon: "🌟", description: "Card border pulses with your accent color." },
  { key: "rainbow-border", label: "Rainbow Border", icon: "🌈", description: "Animated shimmering border." },
];

// "Background effects" — a simple dropdown, layered across the preview background.
export const BACKGROUND_EFFECTS: EffectPreset[] = [
  { key: "none", label: "None", icon: "▢", description: "No background effect." },
  { key: "stars", label: "Stars", icon: "★", description: "Twinkling starfield." },
  { key: "rain", label: "Rain", icon: "🌧", description: "Falling rain streaks." },
  { key: "snow", label: "Snow", icon: "❄", description: "Gently falling snow." },
  { key: "waves", label: "Waves", icon: "〰", description: "Shimmering gradient waves." },
];

export const CUSTOMIZER2_SECTIONS = [
  "Background & Avatar",
  "Frame & Cursor",
  "Opacity, Blur & Effects",
  "Location & Description",
  "Glow Settings",
  "Color Customizer",
  "Customization",
] as const;
