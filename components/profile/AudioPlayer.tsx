"use client";

import H5AudioPlayer, { RHAP_UI } from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";

export function AudioPlayer({
  src,
  autoplay,
  showVolumeSlider,
}: {
  src: string;
  autoplay: boolean;
  showVolumeSlider: boolean;
}) {
  return (
    <div
      className="fixed bottom-4 right-4 z-50 w-64 overflow-hidden rounded-2xl border border-white/10 bg-ink-950/90 shadow-glow backdrop-blur
      [&_.rhap_container]:!bg-transparent [&_.rhap_container]:!p-2.5 [&_.rhap_container]:!shadow-none
      [&_.rhap_progress-filled]:!bg-violet-500 [&_.rhap_progress-indicator]:!bg-violet-300 [&_.rhap_progress-indicator]:!shadow-none
      [&_.rhap_download-progress]:!bg-white/10 [&_.rhap_progress-bar-show-download]:!bg-white/5
      [&_.rhap_time]:!text-[10px] [&_.rhap_time]:!text-zinc-400
      [&_.rhap_volume-bar]:!bg-white/10 [&_.rhap_volume-indicator]:!bg-violet-300
      [&_.rhap_main-controls-button]:!text-violet-300 [&_.rhap_volume-button]:!text-violet-300
      [&_svg]:!fill-violet-300"
    >
      <H5AudioPlayer
        src={src}
        autoPlay={autoplay}
        loop
        layout="horizontal-reverse"
        showJumpControls={false}
        showSkipControls={false}
        showFilledProgress
        customAdditionalControls={[]}
        customVolumeControls={showVolumeSlider ? [RHAP_UI.VOLUME] : []}
      />
    </div>
  );
}
