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
// existing profile card, page 2 (for now) is an About Me section, with dot
// navigation on the right instead of a normal scrollbar. Reuses the exact
// Swiper setup already proven in the dashboard's Profile Customizer 2
// (vertical direction + Mousewheel/Pagination modules, pagination container
// rendered as a Swiper sibling so it isn't affected by the wrapper's slide
// transform).
export function ProfileExperience({
  audioGateProps,
  cardElement,
  aboutMeText,
  aboutCardStyle,
  aboutTextStyle,
}: {
  audioGateProps: AudioGateProps | null;
  cardElement: ReactNode;
  aboutMeText: string;
  aboutCardStyle: React.CSSProperties;
  aboutTextStyle: React.CSSProperties;
}) {
  // Scrolling stays off until the visitor has clicked through the audio
  // gate (if there is one) — the gate's own overlay already blocks
  // interaction while it's up, this is just a belt-and-suspenders match.
  const [entered, setEntered] = useState(!audioGateProps);

  const slide1Content = audioGateProps ? (
    <ProfileEntryGate {...audioGateProps} onEnter={() => setEntered(true)}>
      {cardElement}
    </ProfileEntryGate>
  ) : (
    cardElement
  );

  return (
    <div className="relative z-10 h-full w-full">
      <Swiper
        modules={[Mousewheel, Pagination]}
        direction="vertical"
        mousewheel={entered}
        allowTouchMove={entered}
        pagination={{ el: ".profile-pagination", clickable: true }}
        className="profile-swiper"
      >
        <SwiperSlide>
          <div className="flex h-full w-full items-center justify-center px-6">
            <div className="flex w-full max-w-[63rem] flex-col items-center gap-4">{slide1Content}</div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="flex h-full w-full items-center justify-center px-6">
            <div className="w-full max-w-2xl rounded-2xl p-10 text-center shadow-xl" style={aboutCardStyle}>
              <h2 className="text-2xl font-bold text-white">About Me</h2>
              <p className="mt-4 whitespace-pre-wrap" style={aboutTextStyle}>
                {aboutMeText || "This person hasn't written anything yet."}
              </p>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>

      <div className="profile-pagination pointer-events-none fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-3 sm:flex" />
    </div>
  );
}
