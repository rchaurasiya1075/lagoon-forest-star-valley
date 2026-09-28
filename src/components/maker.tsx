import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ArrowLeft, Check, ImagePlus, Trash2 } from "lucide-react";
import { WALLPAPERS, wallpaperById } from "@/lib/catalog";
import {
  MOTION_LABELS,
  MOTIONS,
  deletePhoto,
  fileToWallpaper,
  savePhoto,
  usePhotos,
  type CustomMeta,
  type Motion,
} from "@/lib/customs";
import { useStudio } from "@/lib/studio-store";
import { WallpaperCanvas } from "@/components/wallpaper-canvas";
import { CharacterLive } from "@/components/character-live";

export function Maker() {
  const editId = useStudio((s) => s.editId);
  const customs = useStudio((s) => s.customs);
  const close = useStudio((s) => s.close);
  const upsertCustom = useStudio((s) => s.upsertCustom);
  const removeCustom = useStudio((s) => s.removeCustom);
  const setLive = useStudio((s) => s.setLive);
  const { photos, remember } = usePhotos();
  const existing = customs.find((item) => item.id === editId) ?? null;
  const fileRef = useRef<HTMLInputElement>(null);

  const [src, setSrc] = useState<string>(existing ? (photos[existing.id] ?? "") : "");
  const [scene, setScene] = useState(existing?.scene ?? "aurora");
  const [motion, setMotion] = useState<Motion>(existing?.motion ?? "look");
  const [turn, setTurn] = useState(existing?.turn ?? 0);
  const [lean, setLean] = useState(existing?.lean ?? 0);
  const [move, setMove] = useState(existing?.move ?? 0.7);
  const [lookX, setLookX] = useState(existing?.lookX ?? 0);
  const [lookY, setLookY] = useState(existing?.lookY ?? 0);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const drag = useRef<{ x: number; y: number; lookX: number; lookY: number } | null>(null);

  const wall = wallpaperById(scene);
  const palette = wall.palettes[0];
  const photo = src || (existing ? photos[existing.id] : "") || "";

  useEffect(() => {
    if (!src && existing && photos[existing.id]) setSrc(photos[existing.id]);
  }, [existing, photos, src]);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      const data = await fileToWallpaper(file);
      setSrc(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not use that photo");
    }
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!photo) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, lookX, lookY };
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = drag.current;
    if (!start) return;
    const dx = (event.clientX - start.x) / 140;
    const dy = (event.clientY - start.y) / 180;
    setLookX(clamp(start.lookX + dx, -1, 1));
    setLookY(clamp(start.lookY + dy, -1, 1));
  }

  function onPointerUp() {
    drag.current = null;
  }

  async function apply() {
    if (!photo) {
      setError("Add a photo first");
      return;
    }
    setBusy(true);
    setError(null);
    const id = existing?.id ?? `photo-${Date.now()}`;
    const meta: CustomMeta = {
      id,
      name: existing?.name ?? "My photo",
      scene,
      motion,
      turn,
      lean,
      move,
      lookX,
      lookY,
    };
    try {
      await savePhoto(id, photo);
      remember(id, photo);
      upsertCustom(meta);
      setLive(id);
      setNote("Set as your live wallpaper");
      window.setTimeout(() => setNote(null), 1600);
    } catch {
      setError("Could not save this photo on the phone");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!existing) return;
    await deletePhoto(existing.id);
    removeCustom(existing.id);
    close();
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="relative min-h-0 flex-1">
        <WallpaperCanvas
          scene={wall.id}
          bg={palette.bg}
          colors={palette.colors}
          speed={1}
          intensity={1}
          fps={30}
          className="absolute inset-0 h-full w-full"
        />
        <div
          className="pose-stage absolute inset-0"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {photo ? (
            <CharacterLive
              src={photo}
              motion={motion}
              turn={turn}
              lean={lean}
              move={move}
              lookX={lookX}
              lookY={lookY}
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-8">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-14 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-fg"
              >
                <ImagePlus className="size-5" />
                Add a photo
              </button>
            </div>
          )}
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-2 pt-2">
          <button
            type="button"
            onClick={close}
            aria-label="Back"
            className="pointer-events-auto grid size-11 place-items-center rounded-full bg-bg/55 text-fg backdrop-blur-md"
          >
            <ArrowLeft className="size-5" />
          </button>
          <p className="rounded-full bg-bg/55 px-3 py-2 text-sm backdrop-blur-md">Your character</p>
          <span className="size-11" />
        </div>
      </div>

      <div className="dock max-h-[46%] overflow-y-auto border-t border-border bg-bg/85 px-3 py-3 backdrop-blur-xl">
        {note ? <p className="mb-2 rounded-full bg-fg px-3 py-2 text-center text-sm text-bg">{note}</p> : null}
        {error ? <p className="mb-2 text-center text-sm text-primary">{error}</p> : null}
        <p className="px-1 text-sm text-muted">Drag the photo to turn them in 3D.</p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="h-11 flex-1 rounded-2xl border border-border bg-surface text-sm font-medium"
          >
            {photo ? "Change photo" : "Choose photo"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              void onFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1">
          {MOTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMotion(item)}
              className={
                item === motion
                  ? "h-11 rounded-xl bg-fg text-xs font-medium text-bg"
                  : "h-11 rounded-xl bg-surface text-xs text-muted"
              }
            >
              {MOTION_LABELS[item]}
            </button>
          ))}
        </div>
        <Slider label="Turn" min={-40} max={40} value={turn} onChange={setTurn} />
        <Slider label="Lean" min={-24} max={24} value={lean} onChange={setLean} />
        <Slider label="Move" min={0} max={100} value={Math.round(move * 100)} onChange={(value) => setMove(value / 100)} />
        <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
          {WALLPAPERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setScene(item.id)}
              className={
                item.id === scene
                  ? "h-11 shrink-0 rounded-full bg-fg px-3 text-xs font-medium text-bg"
                  : "h-11 shrink-0 rounded-full border border-border px-3 text-xs text-muted"
              }
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          {existing ? (
            <button
              type="button"
              aria-label="Remove this wallpaper"
              onClick={() => void remove()}
              className="grid size-12 place-items-center rounded-2xl border border-border bg-surface"
            >
              <Trash2 className="size-5" />
            </button>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={() => void apply()}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-primary-fg disabled:opacity-60"
          >
            <Check className="size-4" />
            Set live
          </button>
        </div>
      </div>
    </div>
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
    <label className="mt-2 block px-1">
      <span className="text-xs text-muted">{label}</span>
      <input
        className="pose-range"
        type="range"
        min={min}
        max={max}
        value={value}
        aria-label={label}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
