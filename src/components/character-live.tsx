import { useEffect, useRef } from "react";
import type { Motion } from "@/lib/customs";

export type CharacterPose = {
  motion: Motion;
  turn: number;
  lean: number;
  move: number;
  lookX: number;
  lookY: number;
};

type Props = CharacterPose & {
  src: string;
  className?: string;
};

export function CharacterLive({ src, className, ...pose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const poseRef = useRef(pose);
  poseRef.current = pose;

  useEffect(() => {
    const canvas = canvasRef.current;
    const shell = shellRef.current;
    if (!canvas || !shell) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    let ready = false;
    img.onload = () => {
      ready = true;
    };
    img.src = src;

    let raf = 0;
    let alive = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const frame = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      if (!ready || document.hidden) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      const p = poseRef.current;
      const amp = (reduce ? 0.2 : 0.35) + p.move * (reduce ? 0.15 : 0.9);
      const t = reduce ? 0.4 : now / 1000;
      const speed = p.motion === "spin" ? 0.9 : p.motion === "float" ? 0.7 : 1.15;
      const sway = Math.sin(t * speed);
      const bobWave = Math.sin(t * (p.motion === "float" ? 1.6 : 1.05));

      let yaw = p.turn * 0.55 + p.lookX * 28;
      let pitch = p.lean * 0.7 - p.lookY * 18;
      let roll = p.lean * 0.15;
      let hop = 0;
      if (!reduce) {
        if (p.motion === "sway") {
          yaw += sway * 14 * amp;
          roll += sway * 4 * amp;
        } else if (p.motion === "look") {
          yaw += sway * 18 * amp;
          pitch += Math.cos(t * 0.7) * 6 * amp;
        } else if (p.motion === "float") {
          hop = bobWave * 18 * amp;
          yaw += Math.sin(t * 0.55) * 8 * amp;
          pitch += bobWave * 4 * amp;
        } else {
          yaw += sway * 26 * amp;
          roll += sway * 7 * amp;
          hop = Math.abs(sway) * 8 * amp;
        }
      }

      const ir = img.width / img.height;
      const cr = w / h;
      let dw: number;
      let dh: number;
      if (ir > cr) {
        dw = w * 0.72;
        dh = dw / ir;
      } else {
        dh = h * 0.62;
        dw = dh * ir;
      }
      const ox = (w - dw) / 2;
      const oy = h * 0.16 + hop * dpr;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.beginPath();
      ctx.ellipse(w / 2, oy + dh * 0.96, dw * 0.32, Math.max(6, dh * 0.03), 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(w / 2, oy + dh * 0.82);
      ctx.rotate((roll * Math.PI) / 180);
      ctx.drawImage(img, -dw / 2, -dh * 0.82, dw, dh);
      ctx.restore();

      shell.style.transform = `perspective(820px) rotateY(${yaw}deg) rotateX(${pitch}deg) translateY(${-hop}px)`;
    };

    raf = requestAnimationFrame(frame);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [src]);

  return (
    <div ref={shellRef} className={className} style={{ transformStyle: "preserve-3d" }}>
      <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
    </div>
  );
}
