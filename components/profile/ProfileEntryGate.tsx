"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { fontClassName } from "@/lib/fonts";

// Wraps the profile card in a blurred, non-interactive overlay with a
// "click to enter" screen on top. The click is a real user gesture, so
// starting audio playback with sound right inside that click handler is
// 100% reliable — no autoplay-policy guesswork needed, unlike trying to
// start sound automatically on page load.
export function ProfileEntryGate({
  audioSrc,
  audioTitle,
  audioCoverUrl,
  audioNameColor,
  audioNameFontSize,
  audioNameBold,
  audioNameFont,
  audioGlowEnabled,
  audioGlowStrength,
  audioGlowColor,
  introText,
  introTextColor,
  introFontSize,
  introGlowEnabled,
  introGlowStrength,
  introGlowColor,
  onEnter,
  children,
}: {
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
  // Fired the moment the visitor clicks through — lets a parent (e.g. the
  // snap-scroll wrapper) know it's now safe to allow scrolling/interaction.
  onEnter?: () => void;
  children: ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [entered, setEntered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  // Portals need a real DOM node to render into, which only exists on the
  // client — guard with a mounted flag so SSR doesn't try to touch
  // `document`.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration || 0);
    const onEnd = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  function handleEnter() {
    setEntered(true);
    onEnter?.();
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = false;
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }

  function handleEnterKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleEnter();
    }
  }

  function toggleMute() {
    const audio = audioRef.current;
    if (!audio) return;
    if (muted) {
      audio.muted = false;
      setMuted(false);
      if (!playing) audio.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      audio.muted = true;
      setMuted(true);
    }
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.muted = false;
      setMuted(false);
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
    }
  }

  function formatTime(s: number) {
    if (!isFinite(s) || s < 0) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${sec}`;
  }

  const introGlowStr = introGlowStrength / 100;
  const introTextStyle: React.CSSProperties = {
    color: introTextColor,
    fontSize: `${introFontSize}px`,
    fontWeight: 700,
    textShadow: introGlowEnabled
      ? [
          `0 0 ${4 + introGlowStr * 10}px ${introGlowColor}`,
          `0 0 ${10 + introGlowStr * 24}px ${introGlowColor}`,
          `0 0 ${18 + introGlowStr * 40}px ${introGlowColor}`,
        ].join(", ")
      : undefined,
  };

  const audioGlowStr = audioGlowStrength / 100;
  const audioNameStyle: React.CSSProperties = {
    color: audioNameColor,
    fontSize: `${audioNameFontSize}px`,
    fontWeight: audioNameBold ? 700 : 500,
    textShadow: audioGlowEnabled
      ? [
          `0 0 ${4 + audioGlowStr * 10}px ${audioGlowColor}`,
          `0 0 ${10 + audioGlowStr * 24}px ${audioGlowColor}`,
          `0 0 ${18 + audioGlowStr * 40}px ${audioGlowColor}`,
        ].join(", ")
      : undefined,
  };

  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  // The gate overlay and the speaker button both need real `position: fixed`
  // relative to the viewport. When this component ends up nested inside a
  // Swiper slide, Swiper applies a CSS transform to an ancestor for the
  // slide animation — and a `transform` on an ancestor turns any fixed
  // descendant's containing block into that ancestor instead of the
  // viewport. Portaling straight to <body> sidesteps that entirely.
  const gateOverlay = (
    <AnimatePresence>
      {!entered && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          role="button"
          tabIndex={0}
          onClick={handleEnter}
          onKeyDown={handleEnterKeyDown}
          className="fixed inset-0 z-[2000] flex cursor-pointer items-center justify-center bg-black/70 px-6 backdrop-blur-sm"
        >
          <motion.p
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            style={introTextStyle}
            className="select-none text-center"
          >
            {introText || "Click to enter"}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const speakerButton = (
    <button
      type="button"
      onClick={toggleMute}
      aria-label={muted ? "Unmute audio" : "Mute audio"}
      className="fixed left-5 top-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/40 text-zinc-200 backdrop-blur transition hover:bg-black/60"
    >
      {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
    </button>
  );

  return (
    <>
      <audio ref={audioRef} src={audioSrc} loop preload="metadata" />

      {mounted ? createPortal(gateOverlay, document.body) : gateOverlay}

      <div
        className="transition-[filter] duration-700 ease-out"
        style={{ filter: entered ? "blur(0px)" : "blur(48px)", pointerEvents: entered ? "auto" : "none" }}
      >
        {children}
      </div>

      {entered && (
        <>
          {mounted ? createPortal(speakerButton, document.body) : speakerButton}

          <div className="flex w-full max-w-xs items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-3.5 py-3 backdrop-blur">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/10">
              {audioCoverUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={audioCoverUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-zinc-500">♪</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className={cn("truncate", fontClassName(audioNameFont))} style={audioNameStyle}>
                {audioTitle || "Untitled Track"}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-violet-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="shrink-0 text-[10px] text-zinc-500">{formatTime(currentTime)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause" : "Play"}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="ml-0.5 h-3.5 w-3.5" />}
            </button>
          </div>
        </>
      )}
    </>
  );
}
