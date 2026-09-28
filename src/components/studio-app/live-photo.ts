import type { Motion, WallpaperItem } from "@/data/wallpapers";

const cache = new Map<string, HTMLImageElement>();

export function loadWallpaper(src: string) {
  let img = cache.get(src);
  if (!img) {
    img = new Image();
    img.decoding = "async";
    img.src = src;
    cache.set(src, img);
  }
  return img;
}

export function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  zoom: number,
  ox: number,
  oy: number,
) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (!iw || !ih) return;
  const scale = Math.max(w / iw, h / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.drawImage(img, (w - dw) / 2 + ox * w, (h - dh) / 2 + oy * h, dw, dh);
}

export function drawLivePhoto(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  item: WallpaperItem,
  time: number,
) {
  const playing = time > 0;
  const zoom = playing ? 1.14 + Math.sin(time * 0.45 + item.seed) * 0.05 : 1.06;
  const ox = playing ? Math.sin(time * 0.28 + item.seed) * 0.035 : 0;
  const oy = playing ? Math.cos(time * 0.22 + item.seed * 0.7) * 0.028 : 0;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#07080c";
  ctx.fillRect(0, 0, w, h);
  drawCover(ctx, img, w, h, zoom, ox, oy);
  if (playing) paintMotes(ctx, w, h, item.motion, time, item.seed);
}

export function downloadWallpaper(item: WallpaperItem) {
  const img = loadWallpaper(item.src);
  const save = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 1280;
    const ctx = canvas.getContext("2d");
    if (!ctx || img.naturalWidth < 2) return;
    drawLivePhoto(ctx, img, 720, 1280, item, 0);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/jpeg", 0.92);
    link.download = `${item.id}.jpg`;
    link.click();
  };
  if (img.complete && img.naturalWidth > 2) save();
  else img.addEventListener("load", save, { once: true });
}

function paintMotes(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  motion: Motion,
  time: number,
  seed: number,
) {
  const count = 28;
  ctx.save();
  for (let i = 0; i < count; i += 1) {
    const sway = Math.sin(time * 1.3 + i + seed) * w * 0.02;
    const xBase = (((i * 47 + seed * 13) % 100) / 100) * w;
    const phase = (i * 0.17 + seed * 0.02) % 1;
    if (motion === "rain") {
      const y = ((phase + time * 0.62) % 1) * h;
      ctx.strokeStyle = "rgba(186, 230, 255, 0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(xBase, y);
      ctx.lineTo(xBase - 3, y + 16);
      ctx.stroke();
      continue;
    }
    const rising = motion === "sparks" || motion === "embers" || motion === "stars";
    const speed = motion === "snow" ? 0.07 : motion === "stars" ? 0.025 : rising ? 0.11 : 0.09;
    const travel = (phase + time * speed) % 1;
    const y = rising ? h - travel * h : travel * h;
    const x = xBase + sway;
    ctx.globalAlpha = 0.28 + (i % 5) * 0.1;
    ctx.fillStyle =
      motion === "petals"
        ? "rgba(255, 214, 226, 0.95)"
        : motion === "sparks"
          ? "rgba(255, 214, 120, 0.95)"
          : motion === "embers"
            ? "rgba(255, 148, 72, 0.9)"
            : "rgba(255, 255, 255, 0.92)";
    ctx.beginPath();
    ctx.arc(x, y, motion === "stars" ? 1.3 : 2.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
