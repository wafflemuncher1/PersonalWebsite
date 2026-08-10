"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrambleTextPlugin);
}

// guns.lol itself runs on GSAP, so "scramble" uses GSAP's own (now-free)
// ScrambleTextPlugin rather than a hand-rolled imitation. "wave" and
// "bounce" are per-letter stagger tweens — no plugin needed for those.
export function GsapNameAnimation({
  text,
  variant,
  className,
  style,
  as: Tag = "h1",
}: {
  text: string;
  variant: "scramble" | "wave" | "bounce";
  className?: string;
  style?: React.CSSProperties;
  // Lets the same scramble/wave/bounce tweens drive both the display name
  // (h1) and the description (p) without duplicating this component.
  as?: "h1" | "p";
}) {
  // Typed as HTMLElement (rather than a HTMLHeadingElement |
  // HTMLParagraphElement union) because TS's `ref` prop resolution for a
  // dynamically-chosen intrinsic tag (`Tag` below) doesn't accept a union
  // ref type cleanly — GSAP only needs querySelectorAll, which every
  // HTMLElement has. The `as any` on the ref prop below is the standard
  // escape hatch for this exact "polymorphic tag + typed ref" TS limitation.
  const scope = useRef<HTMLElement>(null);

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

      if (variant === "bounce") {
        const letters = scope.current.querySelectorAll<HTMLSpanElement>("[data-letter]");
        gsap.fromTo(
          letters,
          { y: 0 },
          {
            y: -10,
            duration: 0.5,
            ease: "elastic.out(1, 0.4)",
            stagger: { each: 0.05, from: "start" },
            repeat: -1,
            repeatDelay: 1.6,
            yoyo: true,
          }
        );
      }
    },
    { scope, dependencies: [text, variant] }
  );

  const refProp = scope as unknown as React.Ref<HTMLHeadingElement & HTMLParagraphElement>;

  if (variant === "wave" || variant === "bounce") {
    return (
      <Tag ref={refProp} className={className} style={style}>
        {text.split("").map((char, i) => (
          <span key={i} data-letter className="inline-block" style={{ whiteSpace: "pre" }}>
            {char}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag ref={refProp} className={className} style={style}>
      {text}
    </Tag>
  );
}
