import { useEffect, useRef } from "react";
import type { WallpaperItem } from "@/data/wallpapers";
import { drawLivePhoto, loadWallpaper } from "@/components/studio-app/live-photo";

export function WallpaperPoster({
  item,
  playing = false,
  className,
}: {
  item: WallpaperItem;
  playing?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let alive = true;
    let tries = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const img = loadWallpaper(item.src);

    const draw = (now: number) => {
      if (!alive) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2 || !img.complete || img.naturalWidth < 2) {
        if ((playing || tries < 40) && alive) {
          tries += 1;
          raf = requestAnimationFrame(draw);
        }
        return;
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const live = playing && !reduce;
      drawLivePhoto(ctx, img, w, h, item, live ? now / 1000 : 0);
      if (live) raf = requestAnimationFrame(draw);
    };

    draw(0);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [item, playing]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
