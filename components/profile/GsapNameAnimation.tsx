"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrambleTextPlugin);
}

// guns.lol itself runs on GSAP, so "scramble" uses GSAP's own (now-free)
// ScrambleTextPlugin rather than a hand-rolled imitation. "wave" is a simple
// per-letter stagger tween — no plugin needed for that one.
export function GsapNameAnimation({
  text,
  variant,
  className,
  style,
}: {
  text: string;
  variant: "scramble" | "wave";
  className?: string;
  style?: React.CSSProperties;
}) {
  const scope = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      if (!scope.current) return;

      if (variant === "scramble") {
        gsap.to(scope.current, {
          duration: 1.4,
          scrambleText: {
            text,
            chars: "upperAndLowerCase",
            speed: 0.4,
            revealDelay: 0.2,
          },
          repeat: -1,
          repeatDelay: 1.8,
        });
      }

      if (variant === "wave") {
        const letters = scope.current.querySelectorAll<HTMLSpanElement>("[data-letter]");
        gsap.to(letters, {
          y: -6,
          duration: 0.5,
          ease: "sine.inOut",
          stagger: {
            each: 0.06,
            repeat: -1,
            yoyo: true,
          },
        });
      }
    },
    { scope, dependencies: [text, variant] }
  );

  if (variant === "wave") {
    return (
      <h1 ref={scope} className={className} style={style}>
        {text.split("").map((char, i) => (
          <span key={i} data-letter className="inline-block" style={{ whiteSpace: "pre" }}>
            {char}
          </span>
        ))}
      </h1>
    );
  }

  return (
    <h1 ref={scope} className={className} style={style}>
      {text}
    </h1>
  );
}
