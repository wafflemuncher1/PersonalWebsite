"use client";

import { useEffect, useRef, useState } from "react";

export function AudioPlayer({
  src,
  autoplay,
  showVolumeSlider,
}: {
  src: string;
  autoplay: boolean;
  showVolumeSlider: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.6);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!autoplay) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => {
        // Autoplay blocked by the browser until the visitor interacts with the page — that's fine.
      });
  }, [autoplay]);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-ink-950/90 px-3 py-2 shadow-glow backdrop-blur">
      <audio ref={audioRef} src={src} loop />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause audio" : "Play audio"}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20 text-sm text-violet-300 transition hover:bg-violet-500/30"
      >
        {playing ? "⏸" : "▶"}
      </button>
      {showVolumeSlider && (
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="Volume"
          className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-white/10 accent-violet-500"
        />
      )}
    </div>
  );
}
