"use client";

import { useState, type ReactNode } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { ProfileEntryGate } from "@/components/profile/ProfileEntryGate";

type AudioGateProps = {
  audioSrc: string;
  audioTitle: string;
  audioCoverUrl: string;
  audioNameColor: string;
  audioNameFontSize: number;
  audioNameBold: boolean;
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
}: {
  audioGateProps: AudioGateProps | null;
  cardElement: ReactNode;
  aboutMeText: string;
  aboutTextStyle: React.CSSProperties;
}) {
  // Scrolling stays off until the visitor has clicked through the audio
  // gate (if there is one) — the gate's own overlay already blocks
  // interaction while it's up, this is just a belt-and-suspenders match.
  const [entered, setEntered] = useState(!audioGateProps);
  const [activeIndex, setActiveIndex] = useState(0);

  const slide1Content = audioGateProps ? (
    <ProfileEntryGate {...audioGateProps} onEnter={() => setEntered(true)}>
      {cardElement}
    </ProfileEntryGate>
  ) : (
    cardElement
  );

  // Only one extra page (About Me) exists today — this becomes a real
  // count once more pages are added, and the hint below already reads off
  // of it so nothing else needs to change when that happens.
  const totalSlides = 2;
  const showScrollHint = entered && activeIndex === 0 && totalSlides > 1;

  return (
    <div className="relative z-10 h-full w-full">
      <Swiper
        modules={[Mousewheel, Pagination]}
        direction="vertical"
        mousewheel={entered ? { forceToAxis: true, releaseOnEdges: true, sensitivity: 1 } : false}
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
        onSlideChange={(s) => setActiveIndex(s.activeIndex)}
        className="profile-swiper"
      >
        <SwiperSlide>
          <div className="flex h-full w-full justify-center px-6 pt-20 sm:pt-24">
            <div className="flex w-full max-w-[63rem] flex-col items-center gap-4">{slide1Content}</div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-6 text-center">
            <h2 className="text-3xl font-extrabold text-white">About me</h2>
            <p className="max-w-2xl whitespace-pre-wrap" style={aboutTextStyle}>
              {aboutMeText || "This person hasn't written anything yet."}
            </p>
          </div>
        </SwiperSlide>
      </Swiper>

      <div className="profile-pagination pointer-events-none fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-3 sm:flex" />

      {showScrollHint && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center">
          <div className="animate-bounce rounded-full border border-white/10 bg-ink-950/80 px-3.5 py-1.5 text-[11px] font-medium text-zinc-400 backdrop-blur">
            ↓ scroll down for more
          </div>
        </div>
      )}
    </div>
  );
}
