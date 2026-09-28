import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Pause, Play } from "lucide-react";
import { fileToImage, loadBlob, saveBlob, useLws, type ProjectKind } from "@/lib/lws-store";

type Tool = "edit" | "filter" | "ai" | "animate" | "depth" | "live" | null;

type EditState = {
  rotate: number;
  flipH: boolean;
  flipV: boolean;
  brightness: number;
  contrast: number;
  saturate: number;
  exposure: number;
  highlights: number;
  shadows: number;
  blur: number;
  vignette: number;
  grain: number;
  temperature: number;
  tint: number;
  sharpness: number;
  perspective: number;
  size: number;
  filter: string;
  intensity: number;
  crop: "free" | "story" | "square" | "wide";
};

const NEUTRAL: EditState = {
  rotate: 0,
  flipH: false,
  flipV: false,
  brightness: 100,
  contrast: 100,
  saturate: 100,
  exposure: 0,
  highlights: 0,
  shadows: 0,
  blur: 0,
  vignette: 0,
  grain: 0,
  temperature: 0,
  tint: 0,
  sharpness: 0,
  perspective: 0,
  size: 100,
  filter: "original",
  intensity: 100,
  crop: "free",
};

const FILTERS: Record<string, string> = {
  original: "none",
  vintage: "sepia(0.5) contrast(1.05) saturate(0.8)",
  cinematic: "contrast(1.2) saturate(0.8) brightness(0.92)",
  hdr: "contrast(1.3) saturate(1.25)",
  mono: "grayscale(1) contrast(1.1)",
  warm: "sepia(0.25) saturate(1.2)",
  cold: "saturate(0.85) hue-rotate(18deg)",
  neon: "saturate(1.8) contrast(1.2) hue-rotate(-18deg)",
  cyber: "contrast(1.25) saturate(1.4) hue-rotate(40deg)",
  dream: "contrast(0.9) saturate(1.2) brightness(1.08)",
  retro: "sepia(0.35) contrast(1.1) saturate(0.7)",
  sunset: "sepia(0.3) saturate(1.35) hue-rotate(-15deg)",
  night: "brightness(0.75) contrast(1.2) saturate(0.8)",
  film: "sepia(0.15) contrast(1.05) saturate(0.75)",
  cartoon: "contrast(1.45) saturate(1.5)",
  anime: "saturate(1.35) contrast(1.15) brightness(1.05)",
  comic: "contrast(1.6) saturate(1.1)",
  sketch: "grayscale(1) contrast(1.8) brightness(1.15)",
  three: "contrast(1.2) saturate(0.9) brightness(1.05)",
  fantasy: "saturate(1.4) hue-rotate(-20deg) contrast(1.1)",
};

const MOTIONS = ["Zoom in", "Zoom out", "Pan left", "Pan right", "Pan up", "Pan down", "Ken Burns", "Float", "Shake", "Glow", "Particle", "Wave", "Camera"] as const;

function baseFilter(edit: EditState) {
  const bright = edit.brightness + edit.exposure;
  const contrast = edit.contrast + edit.sharpness * 0.45;
  const hue = edit.temperature + edit.tint;
  return `brightness(${bright}%) contrast(${contrast}%) saturate(${edit.saturate}%) hue-rotate(${hue}deg) blur(${edit.blur}px)`;
}

function cropOf(img: HTMLImageElement, crop: EditState["crop"]) {
  if (crop === "free") return { x: 0, y: 0, w: img.width, h: img.height };
  const target = crop === "story" ? 9 / 16 : crop === "square" ? 1 : 16 / 9;
  const current = img.width / img.height;
  if (current > target) {
    const w = img.height * target;
    return { x: (img.width - w) / 2, y: 0, w, h: img.height };
  }
  const h = img.width / target;
  return { x: 0, y: (img.height - h) / 2, w: img.width, h };
}

function motionFrame(name: string, p: number) {
  const e = p < 0.5 ? 2 * p * p : 1 - ((-2 * p + 2) ** 2) / 2;
  if (name === "Zoom in") return { z: 1 + e * 0.25, x: 0, y: 0, shake: 0 };
  if (name === "Zoom out") return { z: 1.25 - e * 0.25, x: 0, y: 0, shake: 0 };
  if (name === "Pan left") return { z: 1.15, x: (0.5 - e) * 40, y: 0, shake: 0 };
  if (name === "Pan right") return { z: 1.15, x: (e - 0.5) * 40, y: 0, shake: 0 };
  if (name === "Pan up") return { z: 1.15, x: 0, y: (0.5 - e) * 40, shake: 0 };
  if (name === "Pan down") return { z: 1.15, x: 0, y: (e - 0.5) * 40, shake: 0 };
  if (name === "Ken Burns") return { z: 1 + e * 0.2, x: (e - 0.5) * 24, y: (0.5 - e) * 16, shake: 0 };
  if (name === "Float") return { z: 1.05, x: 0, y: Math.sin(p * Math.PI * 2) * 16, shake: 0 };
  if (name === "Shake") return { z: 1.04, x: Math.sin(p * 40) * 6, y: Math.cos(p * 36) * 4, shake: 1 };
  if (name === "Glow") return { z: 1.02 + Math.sin(p * Math.PI * 2) * 0.03, x: 0, y: 0, shake: 0 };
  if (name === "Particle") return { z: 1.05, x: Math.sin(p * Math.PI * 2) * 8, y: Math.cos(p * Math.PI * 4) * 6, shake: 0 };
  if (name === "Camera") return { z: 1.16 - e * 0.1, x: Math.sin(e * Math.PI) * 26, y: (e - 0.5) * 12, shake: 0 };
  return { z: 1.08, x: Math.sin(p * Math.PI * 2) * 10, y: Math.cos(p * Math.PI * 2) * 6, shake: 0 };
}

export function CreateStudio({ onBack, resumeId }: { onBack: () => void; resumeId?: string | null }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const upsertProject = useLws((s) => s.upsertProject);
  const [src, setSrc] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tool, setTool] = useState<Tool>(null);
  const [edit, setEdit] = useState<EditState>(NEUTRAL);
  const [past, setPast] = useState<EditState[]>([]);
  const [future, setFuture] = useState<EditState[]>([]);
  const [compare, setCompare] = useState(false);
  const [motion, setMotion] = useState<(typeof MOTIONS)[number]>("Ken Burns");
  const [duration, setDuration] = useState(6);
  const [playing, setPlaying] = useState(false);
  const [depth, setDepth] = useState(0.4);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const videoEl = useRef<HTMLVideoElement>(null);
  const [loopVideo, setLoopVideo] = useState(true);
  const [muted, setMuted] = useState(true);
  const [trim, setTrim] = useState({ start: 0, end: 12 });
  const [videoNote, setVideoNote] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const playRef = useRef(0);

  useEffect(() => {
    if (!resumeId) return;
    void loadBlob(resumeId).then((data) => {
      if (data) setSrc(data);
    });
  }, [resumeId]);

  const paintRef = useRef<(progress: number) => void>(() => {});

  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      paintRef.current(0);
    };
    img.src = src;
  }, [src]);

  useEffect(() => {
    if (playing) return;
    const canvas = canvasRef.current;
    if (!canvas || !src) return;
    const draw = () => paintRef.current(0);
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [src, edit, compare, look, depth, tool, playing]);

  useEffect(() => {
    return () => cancelAnimationFrame(playRef.current);
  }, []);

  function paint(progress: number) {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.round((rect.width || 320) * dpr));
    const h = Math.max(1, Math.round((rect.height || 420) * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#07080c";
    ctx.fillRect(0, 0, w, h);
    const state = compare ? NEUTRAL : edit;
    const crop = cropOf(img, state.crop);
    const frame =
      (tool === "animate" || tool === "live") && playing
        ? motionFrame(motion, progress)
        : tool === "depth"
          ? { z: 1.06, x: look.x * 36 * depth, y: look.y * 28 * depth, shake: 0 }
          : { z: 1, x: 0, y: 0, shake: 0 };
    const named = FILTERS[state.filter] ?? "none";
    const amount = state.intensity / 100;
    const plain = compare || state.filter === "original" || named === "none" || amount <= 0;

    const drawPhoto = (zoom: number, ox: number, oy: number, filter: string, alpha = 1) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(w / 2 + ox * dpr, h / 2 + oy * dpr);
      ctx.rotate((state.rotate * Math.PI) / 180);
      ctx.scale(state.flipH ? -1 : 1, state.flipV ? -1 : 1);
      ctx.transform(1, 0, state.perspective / 220, 1, 0, 0);
      const scale = (state.size / 100) * zoom;
      ctx.scale(scale, scale);
      ctx.filter = filter;
      const dw = w * 0.86;
      const dh = dw * (crop.h / crop.w);
      const drawH = Math.min(dh, h * 0.8);
      ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, -dw / 2, -drawH / 2, dw, drawH);
      ctx.restore();
    };

    if (tool === "depth" && !compare) {
      drawPhoto(1.22, -frame.x * 0.45, -frame.y * 0.45, "blur(18px) brightness(70%)");
    }
    if (plain) drawPhoto(frame.z, frame.x, frame.y, compare ? "none" : baseFilter(state));
    else if (amount >= 0.98) drawPhoto(frame.z, frame.x, frame.y, `${baseFilter(state)} ${named}`);
    else {
      drawPhoto(frame.z, frame.x, frame.y, baseFilter(state));
      drawPhoto(frame.z, frame.x, frame.y, `${baseFilter(state)} ${named}`, amount);
    }

    ctx.filter = "none";
    ctx.globalAlpha = 1;
    if (!compare && state.highlights > 0) {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = state.highlights / 280;
      ctx.fillStyle = "#fff6e8";
      ctx.fillRect(0, 0, w, h * 0.62);
      ctx.restore();
    }
    if (!compare && state.shadows > 0) {
      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = state.shadows / 220;
      ctx.fillStyle = "#1a120c";
      ctx.fillRect(0, h * 0.35, w, h * 0.65);
      ctx.restore();
    }
    if (!compare && state.vignette > 0) {
      const g = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.7);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, `rgba(0,0,0,${state.vignette / 140})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
    if (!compare && (state.grain > 0 || (playing && motion === "Particle"))) {
      const specks = state.grain > 0 ? 80 : 36;
      ctx.globalAlpha = state.grain > 0 ? state.grain / 200 : 0.55;
      for (let i = 0; i < specks; i += 1) {
        ctx.fillStyle = i % 2 ? "#fff" : "#000";
        const px = ((i * 97 + progress * 400) % w);
        ctx.fillRect(px, ((i * 53 + progress * 220) % h), 2, 2);
      }
      ctx.globalAlpha = 1;
    }
    if (playing && motion === "Glow") {
      const glow = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.55);
      glow.addColorStop(0, "rgba(46,230,199,0.22)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
    }
  }
  paintRef.current = paint;

  function commit(next: EditState) {
    setPast((items) => [...items.slice(-20), edit]);
    setFuture([]);
    setEdit(next);
  }

  function undo() {
    const prev = past[past.length - 1];
    if (!prev) return;
    setPast((items) => items.slice(0, -1));
    setFuture((items) => [edit, ...items]);
    setEdit(prev);
  }

  function redo() {
    const next = future[0];
    if (!next) return;
    setFuture((items) => items.slice(1));
    setPast((items) => [...items, edit]);
    setEdit(next);
  }

  async function onPhoto(file: File | undefined, extra = 0) {
    if (!file) return;
    setError(null);
    setVideoUrl(null);
    setTool(null);
    setPlaying(false);
    try {
      const quality = useLws.getState().quality;
      const data = await fileToImage(file, quality === "high" ? 1600 : 1080);
      setEdit(NEUTRAL);
      setPast([]);
      setFuture([]);
      setSrc(data);
      if (extra > 0) setNote(`Opened the first photo. ${extra} other file${extra === 1 ? "" : "s"} left untouched.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open that photo.");
    }
  }

  function onVideo(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setError("That file is not a video.");
      return;
    }
    if (file.size > 80 * 1024 * 1024) {
      setError("That video is too large to preview here. Try one under 80 MB.");
      return;
    }
    setError(null);
    setSrc(null);
    setTool(null);
    setVideoNote(null);
    setTrim({ start: 0, end: 12 });
    setVideoUrl(URL.createObjectURL(file));
  }

  function previewMotion() {
    setPlaying(true);
    const start = performance.now();
    const fps = useLws.getState().fps;
    let last = 0;
    const loop = (now: number) => {
      if (now - last < 1000 / fps) {
        playRef.current = requestAnimationFrame(loop);
        return;
      }
      last = now;
      const p = ((now - start) / (duration * 1000)) % 1;
      paintRef.current(p);
      playRef.current = requestAnimationFrame(loop);
    };
    cancelAnimationFrame(playRef.current);
    playRef.current = requestAnimationFrame(loop);
  }

  function stopMotion() {
    setPlaying(false);
    cancelAnimationFrame(playRef.current);
    paint(0);
  }

  async function save(kind: ProjectKind) {
    const canvas = canvasRef.current;
    if (!canvas || !src) {
      setError("Choose a photo before saving.");
      return;
    }
    const id = resumeId ?? `project-${Date.now()}`;
    const data = canvas.toDataURL("image/jpeg", 0.86);
    await saveBlob(id, data);
    upsertProject({
      id,
      name: kind === "live" ? "Live wallpaper" : kind === "animation" ? "Animation" : "Photo",
      kind,
      updated: Date.now(),
      favorite: false,
    });
    setNote("Saved to My Creations. Nothing was changed until you chose this.");
    window.setTimeout(() => setNote(null), 1800);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-2 px-3 pt-3">
        <button type="button" aria-label="Back" onClick={onBack} className="grid size-11 place-items-center rounded-full bg-surface">
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <p className="font-display text-xl leading-none">Create</p>
          <p className="text-sm text-muted">Original stays until you pick a tool</p>
        </div>
      </header>

      <div className="relative mx-3 mt-3 min-h-0 flex-1 overflow-hidden rounded-3xl border border-border bg-surface">
        {src ? (
          <canvas
            ref={canvasRef}
            className="h-full w-full"
            onPointerMove={(event) => {
              if (tool !== "depth") return;
              const rect = event.currentTarget.getBoundingClientRect();
              setLook({
                x: (event.clientX - rect.left) / rect.width * 2 - 1,
                y: (event.clientY - rect.top) / rect.height * 2 - 1,
              });
            }}
          />
        ) : videoUrl ? (
          <video
            ref={videoEl}
            src={videoUrl}
            className="h-full w-full object-contain"
            controls
            playsInline
            muted={muted}
            loop={loopVideo}
            onLoadedMetadata={(event) => {
              const length = event.currentTarget.duration;
              if (Number.isFinite(length)) setTrim({ start: 0, end: Math.min(12, length) });
            }}
            onError={() => setError("This video could not be decoded. Try an MP4.")}
            onTimeUpdate={(event) => {
              const node = event.currentTarget;
              if (node.currentTime >= trim.end) node.currentTime = trim.start;
              if (node.currentTime < trim.start) node.currentTime = trim.start;
            }}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="font-display text-2xl">Add a photo or video</p>
            <p className="text-sm text-pretty text-muted">Nothing is edited until you tap a tool.</p>
            <button type="button" onClick={() => fileRef.current?.click()} className="h-12 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-fg">
              Choose photo
            </button>
            <button type="button" onClick={() => videoRef.current?.click()} className="h-12 rounded-2xl border border-border px-5 text-sm">
              Choose video
            </button>
          </div>
        )}
      </div>

      {error ? <p className="px-4 pt-2 text-center text-sm text-primary">{error}</p> : null}
      {note ? <p className="px-4 pt-2 text-center text-sm text-fg">{note}</p> : null}

      {src ? (
        <div className="dock max-h-[46%] overflow-y-auto px-3 py-3">
          <button type="button" onClick={() => void save("photo")} className="mb-2 h-11 w-full rounded-2xl bg-primary text-sm font-semibold text-primary-fg">
            Save photo
          </button>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ["edit", "Edit"],
                ["filter", "Filter"],
                ["ai", "AI Transform"],
                ["animate", "Animate"],
                ["depth", "3D"],
                ["live", "Live wallpaper"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setTool(id);
                  setAiNote(null);
                  stopMotion();
                }}
                className={tool === id ? "h-11 rounded-2xl bg-fg text-xs font-medium text-bg" : "h-11 rounded-2xl bg-surface text-xs text-muted"}
              >
                {label}
              </button>
            ))}
          </div>

          {tool === "edit" ? (
            <div className="mt-3 space-y-2">
              <div className="flex gap-2">
                <Mini onClick={() => commit({ ...edit, rotate: (edit.rotate + 90) % 360 })}>Rotate</Mini>
                <Mini onClick={() => commit({ ...edit, flipH: !edit.flipH })}>Flip</Mini>
                <Mini onClick={() => commit({ ...edit, flipV: !edit.flipV })}>Flip down</Mini>
              </div>
              <div className="flex gap-2">
                {(["free", "story", "square", "wide"] as const).map((crop) => (
                  <Mini key={crop} on={edit.crop === crop} onClick={() => commit({ ...edit, crop })}>
                    {crop === "story" ? "9:16" : crop === "wide" ? "16:9" : crop === "square" ? "1:1" : "Full"}
                  </Mini>
                ))}
              </div>
              <Slider label="Brightness" min={60} max={160} value={edit.brightness} onChange={(brightness) => commit({ ...edit, brightness })} />
              <Slider label="Exposure" min={-40} max={40} value={edit.exposure} onChange={(exposure) => commit({ ...edit, exposure })} />
              <Slider label="Contrast" min={60} max={170} value={edit.contrast} onChange={(contrast) => commit({ ...edit, contrast })} />
              <Slider label="Highlights" min={0} max={100} value={edit.highlights} onChange={(highlights) => commit({ ...edit, highlights })} />
              <Slider label="Shadows" min={0} max={100} value={edit.shadows} onChange={(shadows) => commit({ ...edit, shadows })} />
              <Slider label="Saturation" min={0} max={200} value={edit.saturate} onChange={(saturate) => commit({ ...edit, saturate })} />
              <Slider label="Temperature" min={-40} max={40} value={edit.temperature} onChange={(temperature) => commit({ ...edit, temperature })} />
              <Slider label="Tint" min={-40} max={40} value={edit.tint} onChange={(tint) => commit({ ...edit, tint })} />
              <Slider label="Sharpness" min={0} max={80} value={edit.sharpness} onChange={(sharpness) => commit({ ...edit, sharpness })} />
              <Slider label="Blur" min={0} max={8} value={edit.blur} onChange={(blur) => commit({ ...edit, blur })} />
              <Slider label="Vignette" min={0} max={100} value={edit.vignette} onChange={(vignette) => commit({ ...edit, vignette })} />
              <Slider label="Grain" min={0} max={100} value={edit.grain} onChange={(grain) => commit({ ...edit, grain })} />
              <Slider label="Perspective" min={-40} max={40} value={edit.perspective} onChange={(perspective) => commit({ ...edit, perspective })} />
              <Slider label="Size" min={70} max={140} value={edit.size} onChange={(size) => commit({ ...edit, size })} />
              <div className="flex gap-2">
                <Mini onClick={undo}>Undo</Mini>
                <Mini onClick={redo}>Redo</Mini>
                <Mini onClick={() => commit(NEUTRAL)}>Reset</Mini>
                <Mini onClick={() => setCompare(true)} onUp={() => setCompare(false)}>
                  Before
                </Mini>
              </div>
            </div>
          ) : null}

          {tool === "filter" ? (
            <div className="mt-3">
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
                {Object.keys(FILTERS).map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => commit({ ...edit, filter: name })}
                    className={edit.filter === name ? "h-11 shrink-0 rounded-full bg-fg px-3 text-xs font-medium text-bg" : "h-11 shrink-0 rounded-full bg-surface px-3 text-xs capitalize text-muted"}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <Slider label="Intensity" min={0} max={100} value={edit.intensity} onChange={(intensity) => commit({ ...edit, intensity })} />
              <div className="mt-2 flex gap-2">
                <Mini onClick={() => setCompare(true)} onUp={() => setCompare(false)}>
                  Before
                </Mini>
                <Mini onClick={() => commit({ ...edit, filter: "original", intensity: 100 })}>Reset</Mini>
              </div>
            </div>
          ) : null}

          {tool === "ai" ? (
            <div className="mt-3 rounded-2xl border border-border bg-surface p-3">
              <p className="text-sm font-medium">Online AI processing required</p>
              <p className="mt-1 text-sm text-pretty text-muted">
                No AI service is connected, so this photo was not transformed. These styles are not applied.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Cartoon", "Anime", "3D", "Comic", "Sketch", "Cyberpunk", "Fantasy", "Cute", "Pixel"].map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setAiNote(`${name}: online AI processing required. Nothing was changed.`)}
                    className="h-11 rounded-full border border-border px-3 text-xs"
                  >
                    {name}
                  </button>
                ))}
              </div>
              {aiNote ? <p className="mt-2 text-sm text-primary">{aiNote}</p> : null}
            </div>
          ) : null}

          {tool === "animate" ? (
            <div className="mt-3">
              <div className="no-scrollbar flex gap-2 overflow-x-auto">
                {MOTIONS.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setMotion(name);
                      stopMotion();
                    }}
                    className={motion === name ? "h-11 shrink-0 rounded-full bg-fg px-3 text-xs font-medium text-bg" : "h-11 shrink-0 rounded-full bg-surface px-3 text-xs text-muted"}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <Slider label="Duration" min={2} max={12} value={duration} onChange={setDuration} />
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={playing ? stopMotion : previewMotion} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-surface text-sm">
                  {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
                  {playing ? "Pause" : "Preview animation"}
                </button>
                <button type="button" onClick={() => void save("animation")} className="h-11 flex-1 rounded-2xl bg-primary text-sm font-semibold text-primary-fg">
                  Save animation
                </button>
              </div>
            </div>
          ) : null}

          {tool === "depth" ? (
            <div className="mt-3">
              <p className="text-sm text-muted">Drag the photo. Foreground shifts over a soft copy.</p>
              <Slider label="Depth" min={0} max={100} value={Math.round(depth * 100)} onChange={(value) => setDepth(value / 100)} />
            </div>
          ) : null}

          {tool === "live" ? (
            <div className="mt-3">
              <p className="text-sm text-pretty text-muted">
                Duration {duration}s, loop on, motion {motion}. Preview it under Animate first. This saves a still for your phone wallpaper picker. It does not install an Android live wallpaper service.
              </p>
              <Slider label="Duration" min={2} max={12} value={duration} onChange={setDuration} />
              <button type="button" onClick={playing ? stopMotion : previewMotion} className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-surface text-sm">
                {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
                {playing ? "Pause" : "Preview live motion"}
              </button>
              <button type="button" onClick={() => void save("live")} className="mt-2 h-12 w-full rounded-2xl bg-primary text-sm font-semibold text-primary-fg">
                Save live wallpaper
              </button>
            </div>
          ) : null}

          {tool === null ? <p className="mt-3 text-sm text-muted">Pick Edit, Filter, Animate, 3D, or Live. AI stays offline until a service is connected.</p> : null}
        </div>
      ) : null}

      {videoUrl ? (
        <div className="space-y-2 px-3 py-3">
          <p className="text-sm text-pretty text-muted">
            Playback starts only when you press play. Trim keeps the player inside the range. A system live wallpaper still has to be set from the phone wallpaper picker.
          </p>
          {videoNote ? <p className="text-sm text-primary">{videoNote}</p> : null}
          <div className="flex gap-2">
            <Mini on={muted} onClick={() => setMuted((value) => !value)}>{muted ? "Muted" : "Sound on"}</Mini>
            <Mini on={loopVideo} onClick={() => setLoopVideo((value) => !value)}>{loopVideo ? "Loop on" : "Loop off"}</Mini>
          </div>
          <Slider label="Start" min={0} max={Math.max(1, Math.floor(trim.end))} value={trim.start} onChange={(start) => setTrim((value) => ({ ...value, start: Math.min(start, value.end - 0.2) }))} />
          <Slider label="End" min={1} max={60} value={Math.round(trim.end)} onChange={(end) => setTrim((value) => ({ ...value, end: Math.max(end, value.start + 0.2) }))} />
          <button
            type="button"
            onClick={() => {
              const node = videoEl.current;
              if (node) node.currentTime = trim.start;
              setVideoNote("Trim is ready in the player. This preview cannot install a live wallpaper service.");
            }}
            className="h-11 w-full rounded-2xl bg-surface text-sm"
          >
            Apply trim
          </button>
        </div>
      ) : null}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          const files = event.target.files;
          void onPhoto(files?.[0], Math.max(0, (files?.length ?? 1) - 1));
          event.target.value = "";
        }}
      />
      <input
        ref={videoRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(event) => {
          onVideo(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
}

function Mini({
  children,
  onClick,
  onUp,
  on,
}: {
  children: string;
  onClick: () => void;
  onUp?: () => void;
  on?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      className={on ? "h-11 flex-1 rounded-xl bg-fg text-xs font-medium text-bg" : "h-11 flex-1 rounded-xl bg-surface text-xs"}
    >
      {children}
    </button>
  );
}

function Slider({
  label,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted">
        {label} {value}
      </span>
      <input className="pose-range" type="range" min={min} max={max} value={value} aria-label={label} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}
