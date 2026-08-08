export type KnownPlatform = "youtube" | "tiktok" | "instagram" | "facebook";
export type Platform = KnownPlatform | "custom";

export const KNOWN_PLATFORMS: KnownPlatform[] = ["youtube", "tiktok", "instagram", "facebook"];

export const PLATFORMS: Record<
  Platform,
  { label: string; brandColor: string; hint: string; validate: (url: string) => boolean }
> = {
  youtube: {
    label: "YouTube",
    brandColor: "#FF0000",
    hint: "e.g. https://youtube.com/@yourchannel",
    validate: (url) => /^https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//i.test(url),
  },
  tiktok: {
    label: "TikTok",
    brandColor: "#010101",
    hint: "e.g. https://tiktok.com/@yourhandle",
    validate: (url) => /^https?:\/\/(www\.|vm\.|vt\.)?tiktok\.com\//i.test(url),
  },
  instagram: {
    label: "Instagram",
    brandColor: "#E1306C",
    hint: "e.g. https://instagram.com/yourhandle",
    validate: (url) => /^https?:\/\/(www\.)?instagram\.com\//i.test(url),
  },
  facebook: {
    label: "Facebook",
    brandColor: "#1877F2",
    hint: "e.g. https://facebook.com/yourpage",
    validate: (url) => /^https?:\/\/(www\.|m\.)?(facebook\.com|fb\.com|fb\.me)\//i.test(url),
  },
  custom: {
    label: "Custom Link",
    brandColor: "#a1a1aa",
    hint: "e.g. https://yourwebsite.com",
    // Any URL is allowed here — there's no fixed domain to check against.
    // This is exactly why clicking one shows the "leaving this site" warning.
    validate: () => true,
  },
};

// Checks that a submitted URL actually belongs to the platform someone
// selected — stops people from picking the YouTube logo and pasting an
// unrelated (or someone else's) link behind it. Custom links skip the
// domain check (there isn't one) but still need a real http(s) URL.
export function validatePlatformUrl(platform: Platform, url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return "Paste a link first.";
  if (!/^https?:\/\//i.test(trimmed)) return "Link must start with http:// or https://.";
  if (!PLATFORMS[platform].validate(trimmed)) {
    return `That doesn't look like a ${PLATFORMS[platform].label} link.`;
  }
  return null;
}
