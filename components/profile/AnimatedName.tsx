"use client";

import { useEffect, useState } from "react";

// Simple hand-rolled typewriter loop — types the name out, pauses, deletes
// it, pauses, and repeats. Kept as plain setInterval/setTimeout logic rather
// than a library since the whole effect is ~20 lines and doesn't vary in
// behavior; a dependency would be overkill for something this small.
export function AnimatedName({
  text,
  className,
  style,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    if (!text) return;

    let i = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    function tick() {
      if (!deleting) {
        i += 1;
        setDisplay(text.slice(0, i));
        if (i >= text.length) {
          deleting = true;
          timer = setTimeout(tick, 1400);
          return;
        }
        timer = setTimeout(tick, 110);
      } else {
        i -= 1;
        setDisplay(text.slice(0, i));
        if (i <= 0) {
          deleting = false;
          timer = setTimeout(tick, 500);
          return;
        }
        timer = setTimeout(tick, 55);
      }
    }

    timer = setTimeout(tick, 300);
    return () => clearTimeout(timer);
  }, [text]);

  return (
    <h1 className={className} style={style}>
      {display}
      <span className="animate-pulse">|</span>
    </h1>
  );
}
