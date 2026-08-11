"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Pagination } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import { ProfileEntryGate } from "@/components/profile/ProfileEntryGate";
import { ExternalLinkGate } from "@/components/profile/ExternalLinkGate";
import { trackLinkClick } from "@/lib/track-click";
import { cn } from "@/lib/utils";
import type { ShopItem } from "@/lib/types";

type AudioGateProps = {
  audioSrc: string;
  audioTitle: string;
  audioCoverUrl: string;
  audioNameColor: string;
  audioNameFontSize: number;
  audioNameBold: boolean;
  audioNameFont: string;
  audioGlowEnabled: boolean;
  audioGlowStrength: number;
  audioGlowColor: string;
  introText: string;
  introTextColor: string;
  introFontSize: number;
  introGlowEnabled: boolean;
  introGlowStrength: number;
  introGlowColor: string;
};

// Full-page vertical snap-scroll for the public profile: page 1 is the
// profile card pinned near the top of the viewport (not vertically
// centered, so it never shifts position as content below it changes —
// e.g. the audio player card appearing after the entry gate), page 2 (for
// now) is a plain-text About Me section, with dot navigation on the right
// instead of a normal scrollbar. A short, low `speed` keeps each wheel/swipe
// feeling like a snappy hard cut to the next page (see the note on the
// Swiper element for why it isn't 0). Reuses the same Swiper setup already
// proven in the dashboard's Profile Customizer 2 (vertical direction +
// Mousewheel/Pagination modules, pagination container rendered as a Swiper
// sibling so it isn't affected by the wrapper's slide transform).
export function ProfileExperience({
  audioGateProps,
  cardElement,
  aboutMeText,
  aboutTextStyle,
  aboutFontClass,
  aboutBoxStyle,
  secondaryBoxStyle,
  shopItems,
  shopTitle,
  shopFontClass,
  shopBoxStyle,
  shopNameStyle,
  shopDescStyle,
  username,
}: {
  audioGateProps: AudioGateProps | null;
  cardElement: ReactNode;
  aboutMeText: string;
  aboutTextStyle: React.CSSProperties;
  aboutFontClass: string;
  aboutBoxStyle: React.CSSProperties;
  secondaryBoxStyle: React.CSSProperties;
  shopItems: ShopItem[];
  shopTitle: string;
  shopFontClass: string;
  shopBoxStyle: React.CSSProperties;
  shopNameStyle: React.CSSProperties;
  shopDescStyle: React.CSSProperties;
  username: string;
}) {
  // Scrolling stays off until the visitor has clicked through the audio
  // gate (if there is one) — the gate's own overlay already blocks
  // interaction while it's up, this is just a belt-and-suspenders match.
  const [entered, setEntered] = useState(!audioGateProps);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperClass | null>(null);

  // Swiper's Mousewheel module only binds its wheel listener based on
  // whether `mousewheel` was truthy at *init* time. Profiles with an audio
  // gate mount with `entered = false`, so if the wheel module is toggled
  // purely via the declarative prop later, the listener never actually
  // gets attached and scrolling stays dead forever even after the visitor
  // clicks through. Keeping the module enabled at init and instead calling
  // its own `enable()`/`disable()` API here — the officially supported way
  // to toggle it post-mount — makes it reliably turn on the moment the
  // gate is cleared.
  useEffect(() => {
    const s = swiperRef.current;
    if (!s) return;
    if (entered) {
      s.mousewheel.enable();
      s.allowTouchMove = true;
    } else {
      s.mousewheel.disable();
      s.allowTouchMove = false;
    }
  }, [entered]);

  const slide1Content = audioGateProps ? (
    <ProfileEntryGate {...audioGateProps} onEnter={() => setEntered(true)}>
      {cardElement}
    </ProfileEntryGate>
  ) : (
    cardElement
  );

  // Three pages: profile card, About Me, Shop. The hint below reads off of
  // this so it'll stay correct if more pages get added later.
  const totalSlides = 3;
  const showScrollHint = entered && activeIndex === 0 && totalSlides > 1;

  return (
    <div className="relative z-10 h-full w-full">
      <Swiper
        modules={[Mousewheel, Pagination]}
        direction="vertical"
        mousewheel={{ forceToAxis: true, releaseOnEdges: true, sensitivity: 1 }}
        allowTouchMove={entered}
        // A true 0ms speed sounds "instant" but it breaks Swiper internally —
        // without a real CSS transition, the browser never fires
        // `transitionend`, so Swiper's animating-lock never clears and every
        // wheel/swipe after the first one gets silently ignored. A short,
        // snappy duration keeps the "shoot to the next page" feel while
        // keeping the transition lifecycle (and therefore repeated
        // scrolling) working correctly.
        speed={220}
        pagination={{ el: ".profile-pagination", clickable: true }}
        onSwiper={(s) => {
          swiperRef.current = s;
          if (!entered) s.mousewheel.disable();
        }}
        onSlideChange={(s) => setActiveIndex(s.activeIndex)}
        className="profile-swiper"
      >
        <SwiperSlide>
          <div className="flex h-full w-full justify-center px-6 pt-20 sm:pt-24">
            <div className="flex w-full max-w-[63rem] flex-col items-center gap-4">{slide1Content}</div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="flex h-full w-full items-center justify-center px-6">
            <div className="w-full max-w-2xl">
              <h2 className="text-3xl font-extrabold text-white">About me</h2>
              <div className={cn("mt-4 rounded-2xl p-5", aboutFontClass)} style={aboutBoxStyle}>
                <p className="whitespace-pre-wrap" style={aboutTextStyle}>
                  {aboutMeText || "This person hasn't written anything yet."}
                </p>
              </div>
              {/* Reserved for future widgets (e.g. now-playing, timezone) — styled
                  now via the customizer's "More Info Boxes" section, empty for now. */}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="h-24 rounded-2xl" style={secondaryBoxStyle} />
                <div className="h-24 rounded-2xl" style={secondaryBoxStyle} />
              </div>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="flex h-full w-full items-center justify-center px-6">
            <div className="w-full max-w-2xl">
              <h2 className={cn("text-3xl font-extrabold text-white", shopFontClass)}>{shopTitle}</h2>
              {shopItems.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500">Nothing here yet.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {shopItems.map((item) => (
                    <ShopItemRow
                      key={item.id}
                      item={item}
                      fontClass={shopFontClass}
                      boxStyle={shopBoxStyle}
                      nameStyle={shopNameStyle}
                      descStyle={shopDescStyle}
                      username={username}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </SwiperSlide>
      </Swiper>

      <div className="profile-pagination pointer-events-none fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-3 sm:flex" />

      {showScrollHint && (
        <div className="pointer-events-none fixed inset-x-0 bottom-16 z-20 flex justify-center">
          <div className="animate-bounce rounded-full border border-white/10 bg-ink-950/80 px-3.5 py-1.5 text-[11px] font-medium text-zinc-400 backdrop-blur">
            ↓ scroll down for more
          </div>
        </div>
      )}
    </div>
  );
}

// One shop row: an image square on the left, then a box with the item's
// name + description — clicking anywhere on the box opens the link.
// Routed through the same "leaving this site" warning used for unverified
// custom links, since shop links are just as unverified.
function ShopItemRow({
  item,
  fontClass,
  boxStyle,
  nameStyle,
  descStyle,
  username,
}: {
  item: ShopItem;
  fontClass: string;
  boxStyle: React.CSSProperties;
  nameStyle: React.CSSProperties;
  descStyle: React.CSSProperties;
  username: string;
}) {
  return (
    <ExternalLinkGate
      url={item.link_url}
      onConfirm={() => {
        trackLinkClick(username, item.name || "Shop item", item.link_url);
        window.open(item.link_url, "_blank", "noopener,noreferrer");
      }}
      className="flex w-full items-stretch gap-3 text-left transition hover:scale-[1.01]"
    >
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white/5">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className={cn("flex flex-1 flex-col justify-center rounded-2xl p-4", fontClass)} style={boxStyle}>
        <p className="truncate text-sm font-semibold" style={nameStyle}>
          {item.name || "Untitled item"}
        </p>
        {item.description && (
          <p className="mt-0.5 line-clamp-2 text-xs" style={descStyle}>
            {item.description}
          </p>
        )}
      </div>
    </ExternalLinkGate>
  );
}
