"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

// Renders two pieces together: a fixed top-left speaker button (works from
// anywhere in the tree — `fixed` ignores normal document flow) that lets a
// visitor mute/unmute, and a small player card meant to sit directly under
// the profile box wherever this component is placed in the layout. Both
// pieces share one <audio> element so play state stays in sync.
export function ProfileAudioPlayer({
  src,
  title,
  coverUrl,
  nameColor,
  nameFontSize,
  nameBold,
  glowEnabled,
  glowStrength,
  glowColor,
}: {
  src: string;
  title: string;
  coverUrl: string;
  nameColor: string;
  nameFontSize: number;
  nameBold: boolean;
  glowEnabled: boolean;
  glowStrength: number;
  glowColor: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Try to autoplay with sound immediately. Browsers block that unless the
  // visitor has already interacted with this site before, so if it's
  // rejected we fall back to muted autoplay (always allowed) — the track
  // is rolling either way, and the visitor can unmute from the speaker
  // button. There's no way to force sound-on autoplay every single time;
  // that's a browser-level restriction, not something the page controls.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = false;
    audio
      .play()
      .then(() => {
        setPlaying(true);
        setMuted(false);
      })
      .catch(() => {
        audio.muted = true;
        setMuted(true);
        audio
          .play()
          .then(() => setPlaying(true))
          .catch(() => setPlaying(false));
      });
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

  const glowStr = glowStrength / 100;
  const nameStyle: React.CSSProperties = {
    color: nameColor,
    fontSize: `${nameFontSize}px`,
    fontWeight: nameBold ? 700 : 500,
    textShadow: glowEnabled
      ? [
          `0 0 ${4 + glowStr * 10}px ${glowColor}`,
          `0 0 ${10 + glowStr * 24}px ${glowColor}`,
          `0 0 ${18 + glowStr * 40}px ${glowColor}`,
        ].join(", ")
      : undefined,
  };

  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="metadata" />

      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? "Unmute audio" : "Mute audio"}
        className="fixed left-5 top-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/40 text-zinc-200 backdrop-blur transition hover:bg-black/60"
      >
        {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>

      <div className="flex w-full max-w-xs items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-3.5 py-3 backdrop-blur">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/10">
          {coverUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={coverUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-zinc-500">♪</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate" style={nameStyle}>
            {title || "Untitled Track"}
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
  );
}
