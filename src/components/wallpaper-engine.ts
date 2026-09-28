export type RGB = readonly [string, string, string];

export type DrawArgs = {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  w: number;
  h: number;
  t: number;
  dt: number;
  speed: number;
  intensity: number;
  bg: string;
  colors: RGB;
};

type Bag = { key: string; w: number; items: unknown[] };

const bags = new WeakMap<HTMLCanvasElement, Bag>();

function rng(seed: number) {
  let a = seed >>> 0 || 1;
  return () => {
    a = (Math.imul(a, 1664525) + 1013904223) >>> 0;
    return a / 4294967296;
  };
}

function bagFor(d: DrawArgs, key: string, count: number, make: (rand: () => number, i: number) => unknown) {
  const existing = bags.get(d.canvas);
  if (existing && existing.key === key && existing.w === d.w && existing.items.length === count) {
    return existing.items;
  }
  const rand = rng((d.w * 17 + d.h * 3 + key.length * 97) | 0);
  const items = Array.from({ length: count }, (_, i) => make(rand, i));
  bags.set(d.canvas, { key, w: d.w, items });
  return items;
}

function fill(d: DrawArgs) {
  const { ctx, w, h, bg } = d;
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
}

function vignette(d: DrawArgs) {
  const { ctx, w, h } = d;
  const g = ctx.createRadialGradient(w / 2, h * 0.42, w * 0.15, w / 2, h * 0.5, Math.max(w, h) * 0.72);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.5)");
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function aurora(d: DrawArgs) {
  fill(d);
  const { ctx, w, h, t, speed, intensity, colors } = d;
  ctx.lineCap = "round";
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    const amp = h * (0.07 + i * 0.012) * intensity;
    const y0 = h * (0.22 + i * 0.1);
    const phase = t * speed * (0.45 + i * 0.08);
    for (let x = 0; x <= w; x += 5) {
      const y =
        y0 +
        Math.sin(x * 0.007 + phase + i) * amp +
        Math.sin(x * 0.018 - phase * 0.7 + i * 1.4) * amp * 0.38;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = colors[i % 3];
    ctx.globalAlpha = 0.22 + (i % 3) * 0.06;
    ctx.lineWidth = Math.max(8, h * (0.045 + (i % 2) * 0.02));
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  vignette(d);
}

function tide(d: DrawArgs) {
  fill(d);
  const { ctx, w, h, t, speed, intensity, colors } = d;
  for (let i = 0; i < 4; i += 1) {
    const base = h * (0.38 + i * 0.13);
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, base);
    for (let x = 0; x <= w; x += 6) {
      const y =
        base +
        Math.sin(x * 0.011 + t * speed * (0.7 + i * 0.12) + i) * h * 0.045 * intensity +
        Math.sin(x * 0.004 - t * speed * 0.32 + i * 0.6) * h * 0.028;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = colors[i % 3];
    ctx.globalAlpha = 0.22 + i * 0.1;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  vignette(d);
}

function drift(d: DrawArgs) {
  fill(d);
  const { ctx, w, h, t, speed, intensity, colors } = d;
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 7; i += 1) {
    const x = w * (0.5 + Math.sin(t * speed * 0.22 + i * 1.15) * 0.34);
    const y = h * (0.48 + Math.cos(t * speed * 0.17 + i * 0.9) * 0.3);
    const r = Math.min(w, h) * (0.18 + (i % 3) * 0.06) * intensity;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, colors[i % 3]);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.38;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  vignette(d);
}

function pulse(d: DrawArgs) {
  fill(d);
  const { ctx, w, h, t, speed, intensity, colors } = d;
  const cx = w / 2;
  const cy = h * 0.46;
  const maxR = Math.hypot(w, h) * 0.55;
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.42 * intensity);
  glow.addColorStop(0, colors[0]);
  glow.addColorStop(0.45, colors[2]);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 5; i += 1) {
    const p = (t * speed * 0.16 + i / 5) % 1;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(1, p * maxR), 0, Math.PI * 2);
    ctx.strokeStyle = colors[i % 3];
    ctx.globalAlpha = (1 - p) * 0.6;
    ctx.lineWidth = Math.max(1.5, w * 0.004);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  vignette(d);
}

type Drop = { x: number; y: number; v: number; len: number; a: number };

function rain(d: DrawArgs) {
  fill(d);
  const { ctx, w, h, speed, dt, colors } = d;
  const glow = ctx.createLinearGradient(0, 0, 0, h);
  glow.addColorStop(0, colors[2]);
  glow.addColorStop(0.45, "rgba(0,0,0,0)");
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  const count = Math.round(46 + (w / 80) * 10);
  const drops = bagFor(d, "rain", count, (rand) => ({
    x: rand() * w,
    y: rand() * h,
    v: 7 + rand() * 11,
    len: 12 + rand() * 22,
    a: 0.2 + rand() * 0.55,
  })) as Drop[];
  ctx.strokeStyle = colors[1];
  ctx.lineWidth = Math.max(1, w * 0.003);
  ctx.lineCap = "round";
  for (const drop of drops) {
    drop.y += drop.v * speed * dt * 60;
    drop.x += speed * dt * 18;
    if (drop.y > h + drop.len) {
      drop.y = -drop.len;
      drop.x = Math.random() * w;
    }
    if (drop.x > w) drop.x = 0;
    ctx.globalAlpha = drop.a;
    ctx.beginPath();
    ctx.moveTo(drop.x, drop.y);
    ctx.lineTo(drop.x - 3, drop.y + drop.len);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  vignette(d);
}

type Ember = { x: number; y: number; v: number; r: number; drift: number; a: number };

function embers(d: DrawArgs) {
  fill(d);
  const { ctx, w, h, speed, dt, colors, intensity, t } = d;
  const floor = ctx.createLinearGradient(0, h * 0.6, 0, h);
  floor.addColorStop(0, "rgba(0,0,0,0)");
  floor.addColorStop(1, colors[0]);
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = floor;
  ctx.fillRect(0, 0, w, h);
  const count = Math.round(36 * intensity);
  const sparks = bagFor(d, "embers", count, (rand) => ({
    x: rand() * w,
    y: rand() * h,
    v: 0.6 + rand() * 1.6,
    r: 1.2 + rand() * 2.8,
    drift: rand() * Math.PI * 2,
    a: 0.35 + rand() * 0.6,
  })) as Ember[];
  for (const spark of sparks) {
    spark.y -= spark.v * speed * dt * 46;
    spark.x += Math.sin(t * 0.8 + spark.drift) * dt * 18;
    if (spark.y < -8) {
      spark.y = h + 4;
      spark.x = Math.random() * w;
    }
    const g = ctx.createRadialGradient(spark.x, spark.y, 0, spark.x, spark.y, spark.r * 7);
    g.addColorStop(0, colors[1]);
    g.addColorStop(0.35, colors[0]);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = spark.a;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(spark.x, spark.y, spark.r * 7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  vignette(d);
}

function orbit(d: DrawArgs) {
  fill(d);
  const { ctx, w, h, t, speed, intensity, colors } = d;
  const cx = w / 2;
  const cy = h * 0.46;
  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.16);
  core.addColorStop(0, colors[1]);
  core.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(cx, cy, w * 0.16, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 3; i += 1) {
    const rx = w * (0.16 + i * 0.15) * (0.9 + intensity * 0.1);
    const ry = rx * 0.38;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, -0.2, 0, Math.PI * 2);
    ctx.strokeStyle = colors[i];
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = Math.max(1, w * 0.003);
    ctx.stroke();
    const angle = t * speed * (0.45 + i * 0.22) + i * 1.7;
    const x = cx + Math.cos(angle) * rx;
    const y = cy + Math.sin(angle) * ry;
    const rad = (5 + intensity * 4) * (w / 360);
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad * 5);
    g.addColorStop(0, colors[1]);
    g.addColorStop(0.4, colors[i]);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, rad * 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  vignette(d);
}

function lattice(d: DrawArgs) {
  fill(d);
  const { ctx, w, h, t, speed, colors, intensity } = d;
  const vanishX = w / 2 + Math.sin(t * speed * 0.15) * w * 0.04;
  const vanishY = h * 0.36;
  const glow = ctx.createRadialGradient(vanishX, vanishY, 0, vanishX, vanishY, w * 0.55);
  glow.addColorStop(0, colors[1]);
  glow.addColorStop(0.35, colors[0]);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalAlpha = 0.45 * intensity;
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = colors[0];
  ctx.lineWidth = Math.max(1, w * 0.003);
  ctx.globalAlpha = 0.55;
  for (let i = -14; i <= 14; i += 1) {
    ctx.beginPath();
    ctx.moveTo(vanishX, vanishY);
    ctx.lineTo(w / 2 + i * w * 0.11, h);
    ctx.stroke();
  }
  const span = h - vanishY;
  for (let i = 1; i < 14; i += 1) {
    const p = ((i / 14 + t * speed * 0.08) % 1);
    const y = vanishY + p * p * span;
    const half = (w * 0.55 * (y - vanishY)) / span;
    ctx.globalAlpha = 0.15 + p * 0.55;
    ctx.beginPath();
    ctx.moveTo(vanishX - half, y);
    ctx.lineTo(vanishX + half, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  vignette(d);
}

const SCENES: Record<string, (d: DrawArgs) => void> = {
  aurora,
  tide,
  drift,
  pulse,
  rain,
  embers,
  orbit,
  lattice,
};

export function drawScene(id: string, args: DrawArgs) {
  const scene = SCENES[id] ?? aurora;
  scene(args);
}
