import type { ISourceOptions } from "@tsparticles/engine";

// Option builders for the tsparticles-driven presets used by
// components/customizer2/EffectOverlays.tsx. Kept separate from that file so
// the visual tuning lives in one place. Every builder disables fullScreen and
// uses a transparent background since these are always layered inside an
// absolutely-positioned overlay div, not the whole page.

const base: ISourceOptions = {
  fullScreen: { enable: false },
  background: { color: { value: "transparent" } },
  fpsLimit: 60,
  detectRetina: true,
  interactivity: { events: {}, modes: {} },
  particles: { links: { enable: false }, move: { enable: false } },
};

export function sparkleOptions(color: string): ISourceOptions {
  return {
    ...base,
    particles: {
      ...base.particles,
      number: { value: 22 },
      color: { value: color },
      shape: { type: "star" },
      opacity: {
        value: { min: 0.15, max: 0.9 },
        animation: { enable: true, speed: 1.2, sync: false, startValue: "random" },
      },
      size: { value: { min: 1, max: 3 } },
    },
  };
}

export function floatingOptions(color: string): ISourceOptions {
  return {
    ...base,
    particles: {
      ...base.particles,
      number: { value: 14 },
      color: { value: color },
      shape: { type: "circle" },
      opacity: { value: 0.5 },
      size: { value: { min: 2, max: 5 } },
      move: {
        enable: true,
        speed: 0.6,
        direction: "top",
        random: true,
        straight: false,
        outModes: { default: "out" },
      },
    },
  };
}

export function starsOptions(): ISourceOptions {
  return {
    ...base,
    particles: {
      ...base.particles,
      number: { value: 60 },
      color: { value: "#ffffff" },
      shape: { type: "circle" },
      opacity: {
        value: { min: 0.1, max: 1 },
        animation: { enable: true, speed: 0.6, sync: false, startValue: "random" },
      },
      size: { value: { min: 0.5, max: 1.8 } },
    },
  };
}

export function rainOptions(): ISourceOptions {
  return {
    ...base,
    particles: {
      ...base.particles,
      number: { value: 90 },
      color: { value: "#cbd5e1" },
      shape: { type: "circle" },
      opacity: { value: 0.5 },
      size: { value: { min: 0.6, max: 1.4 } },
      move: {
        enable: true,
        speed: { min: 10, max: 16 },
        direction: "bottom",
        straight: true,
        outModes: { default: "out" },
      },
    },
  };
}

export function snowOptions(): ISourceOptions {
  return {
    ...base,
    particles: {
      ...base.particles,
      number: { value: 50 },
      color: { value: "#ffffff" },
      shape: { type: "circle" },
      opacity: { value: { min: 0.4, max: 0.9 } },
      size: { value: { min: 1.5, max: 3.5 } },
      move: {
        enable: true,
        speed: { min: 1, max: 2.5 },
        direction: "bottom",
        random: true,
        straight: false,
        outModes: { default: "out" },
      },
    },
  };
}
