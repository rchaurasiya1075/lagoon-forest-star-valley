import { useEffect, useRef } from "react";
import { drawScene, type RGB } from "@/components/wallpaper-engine";

type Props = {
  scene: string;
  bg: string;
  colors: RGB;
  speed: number;
  intensity: number;
  fps?: number;
  className?: string;
};

export function WallpaperCanvas({
  scene,
  bg,
  colors,
  speed,
  intensity,
  fps = 30,
  className,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let raf = 0;
    let lastDraw = 0;
    let lastTick = 0;
    let alive = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minGap = 1000 / fps;

    const frame = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      if (now - lastDraw < minGap) return;
      const dt = lastTick === 0 ? 0.016 : Math.min(0.05, (now - lastTick) / 1000);
      lastTick = now;
      lastDraw = now;
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      drawScene(scene, {
        ctx,
        canvas,
        w,
        h,
        t: reduce ? 1.4 : now / 1000,
        dt: reduce ? 0 : dt,
        speed,
        intensity,
        bg,
        colors,
      });
    };

    raf = requestAnimationFrame(frame);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [scene, bg, colors, speed, intensity, fps]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
