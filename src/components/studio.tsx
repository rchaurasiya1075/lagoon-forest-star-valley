import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Heart, ImagePlus, Shuffle } from "lucide-react";
import {
  GLOW_LABELS,
  INTENSITIES,
  SPEED_LABELS,
  SPEEDS,
  TAGS,
  WALLPAPERS,
  wallpaperById,
  type Tag,
} from "@/lib/catalog";
import { PhotoProvider, usePhotos } from "@/lib/customs";
import { tuneFor, useStudio } from "@/lib/studio-store";
import { WallpaperCanvas } from "@/components/wallpaper-canvas";
import { Maker } from "@/components/maker";

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

export function Studio() {
  const mode = useStudio((s) => s.mode);
  useEffect(() => {
    void useStudio.persist.rehydrate();
  }, []);

  return (
    <div className="min-h-dvh bg-stage text-fg md:grid md:place-items-center md:py-6">
      <div className="safe-top relative mx-auto flex h-dvh w-full max-w-[440px] flex-col overflow-hidden bg-bg md:h-[min(880px,calc(100dvh-3rem))] md:rounded-3xl md:border md:border-border">
        <PhotoProvider>
          {mode === "browse" ? <Browse /> : mode === "make" ? <Maker /> : <Stage />}
        </PhotoProvider>
      </div>
    </div>
  );
}

function Browse() {
  const liveId = useStudio((s) => s.liveId);
  const favorites = useStudio((s) => s.favorites);
  const tunes = useStudio((s) => s.tunes);
  const customs = useStudio((s) => s.customs);
  const open = useStudio((s) => s.open);
  const startNew = useStudio((s) => s.startNew);
  const editCustom = useStudio((s) => s.editCustom);
  const toggleFavorite = useStudio((s) => s.toggleFavorite);
  const { photos } = usePhotos();
  const [tag, setTag] = useState<Tag>("All");

  const walls = useMemo(() => {
    if (tag === "Saved") return WALLPAPERS.filter((wall) => favorites.includes(wall.id));
    if (tag === "All") return WALLPAPERS;
    return WALLPAPERS.filter((wall) => wall.tag === tag);
  }, [tag, favorites]);

  const liveCustom = customs.find((item) => item.id === liveId) ?? null;
  const live = wallpaperById(liveCustom?.scene ?? liveId);
  const liveTune = tuneFor(tunes, live.id);
  const livePalette = live.palettes[liveTune.color] ?? live.palettes[0];
  const showCustoms = tag === "All" || tag === "Yours";
  const showWalls = tag !== "Yours";

  return (
    <>
      <header className="px-4 pt-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="font-display text-3xl leading-none tracking-tight">Lumen</p>
            <p className="mt-1 text-sm text-muted">Live wallpapers for your lock screen</p>
          </div>
          <span className="mb-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-fg">
            Live
          </span>
        </div>
        <button
          type="button"
          onClick={startNew}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-primary-fg"
        >
          <ImagePlus className="size-4" />
          Make one from a photo
        </button>
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
          {TAGS.map((item) => {
            const on = item === tag;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setTag(item)}
                className={
                  on
                    ? "h-11 shrink-0 rounded-full bg-fg px-4 text-sm font-medium text-bg"
                    : "h-11 shrink-0 rounded-full border border-border bg-surface px-4 text-sm text-fg"
                }
              >
                {item}
              </button>
            );
          })}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {tag === "Yours" && customs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <p className="font-display text-2xl">No photo yet</p>
            <p className="mt-2 text-sm text-pretty text-muted">
              Add any photo, then drag to turn the character in 3D.
            </p>
          </div>
        ) : walls.length === 0 && !showCustoms ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <p className="font-display text-2xl">Nothing saved yet</p>
            <p className="mt-2 text-sm text-pretty text-muted">
              Open a wallpaper and tap the heart. It stays on this phone.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {showCustoms
              ? customs.map((custom) => {
                  const shot = photos[custom.id];
                  const isLive = custom.id === liveId;
                  return (
                    <div
                      key={custom.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => editCustom(custom.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          editCustom(custom.id);
                        }
                      }}
                      className={
                        isLive
                          ? "relative h-64 overflow-hidden rounded-3xl border-2 border-primary text-left"
                          : "relative h-64 overflow-hidden rounded-3xl border border-border text-left"
                      }
                    >
                      {shot ? (
                        <img src={shot} alt="" className="absolute inset-0 h-full w-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 bg-surface" />
                      )}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg via-bg/70 to-transparent px-3 pt-12 pb-3">
                        <p className="font-display text-xl leading-none">{custom.name}</p>
                        <p className="mt-1 text-sm text-muted">Your photo</p>
                      </div>
                      {isLive ? (
                        <span className="absolute top-3 left-3 rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-fg">
                          On
                        </span>
                      ) : null}
                    </div>
                  );
                })
              : null}
            {showWalls
              ? walls.map((wall) => {
              const tune = tuneFor(tunes, wall.id);
              const palette = wall.palettes[tune.color] ?? wall.palettes[0];
              const saved = favorites.includes(wall.id);
              const isLive = wall.id === liveId;
              return (
                <div
                  key={wall.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => open(wall.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      open(wall.id);
                    }
                  }}
                  className={
                    isLive
                      ? "relative h-64 overflow-hidden rounded-3xl border-2 border-primary text-left"
                      : "relative h-64 overflow-hidden rounded-3xl border border-border text-left"
                  }
                >
                  <WallpaperCanvas
                    scene={wall.id}
                    bg={palette.bg}
                    colors={palette.colors}
                    speed={SPEEDS[tune.speed]}
                    intensity={INTENSITIES[tune.glow]}
                    fps={18}
                    className="absolute inset-0 h-full w-full"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg via-bg/70 to-transparent px-3 pt-12 pb-3">
                    <p className="font-display text-xl leading-none">{wall.name}</p>
                    <p className="mt-1 text-sm text-muted">{wall.mood}</p>
                  </div>
                  {isLive ? (
                    <span className="absolute top-3 left-3 rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-fg">
                      On
                    </span>
                  ) : null}
                  <button
                    type="button"
                    aria-label={saved ? `Unsave ${wall.name}` : `Save ${wall.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleFavorite(wall.id);
                    }}
                    className="absolute top-2 right-2 grid size-11 place-items-center rounded-full bg-bg/70 text-fg"
                  >
                    <Heart className={saved ? "size-5 fill-primary text-primary" : "size-5"} />
                  </button>
                </div>
              );
            })
              : null}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => (liveCustom ? editCustom(liveCustom.id) : open(live.id))}
        className="dock flex items-center gap-3 border-t border-border bg-surface px-4 py-3 text-left"
      >
        <span className="relative size-12 shrink-0 overflow-hidden rounded-2xl">
          {liveCustom && photos[liveCustom.id] ? (
            <img src={photos[liveCustom.id]} alt="" className="h-full w-full object-cover" />
          ) : (
            <WallpaperCanvas
              scene={live.id}
              bg={livePalette.bg}
              colors={livePalette.colors}
              speed={SPEEDS[liveTune.speed]}
              intensity={INTENSITIES[liveTune.glow]}
              fps={16}
              className="absolute inset-0 h-full w-full"
            />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs tracking-wide text-muted uppercase">Now live</span>
          <span className="block truncate font-medium">{liveCustom ? liveCustom.name : live.name}</span>
        </span>
        <span className="text-sm text-primary">Preview</span>
      </button>
    </>
  );
}

function Stage() {
  const focusId = useStudio((s) => s.focusId);
  const liveId = useStudio((s) => s.liveId);
  const favorites = useStudio((s) => s.favorites);
  const tunes = useStudio((s) => s.tunes);
  const close = useStudio((s) => s.close);
  const setLive = useStudio((s) => s.setLive);
  const toggleFavorite = useStudio((s) => s.toggleFavorite);
  const setTune = useStudio((s) => s.setTune);
  const open = useStudio((s) => s.open);
  const now = useClock();
  const [note, setNote] = useState<string | null>(null);

  const wall = wallpaperById(focusId);
  const tune = tuneFor(tunes, wall.id);
  const palette = wall.palettes[tune.color] ?? wall.palettes[0];
  const saved = favorites.includes(wall.id);
  const isLive = liveId === wall.id;

  const time = now
    ? new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(now)
    : "--:--";
  const date = now
    ? new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "short" }).format(now)
    : " ";

  function shuffle() {
    const pool = WALLPAPERS.filter((item) => item.id !== wall.id);
    const next = pool[Math.floor(Math.random() * pool.length)] ?? WALLPAPERS[0];
    open(next.id);
  }

  function apply() {
    setLive(wall.id);
    setNote("Set as your live wallpaper");
    window.setTimeout(() => setNote(null), 1600);
  }

  return (
    <div className="relative min-h-0 flex-1">
      <WallpaperCanvas
        scene={wall.id}
        bg={palette.bg}
        colors={palette.colors}
        speed={SPEEDS[tune.speed]}
        intensity={INTENSITIES[tune.glow]}
        fps={40}
        className="absolute inset-0 h-full w-full"
      />
      <div className="absolute inset-0 flex flex-col">
        <div className="flex items-center justify-between px-2 pt-2">
          <button
            type="button"
            onClick={close}
            aria-label="Back to wallpapers"
            className="grid size-11 place-items-center rounded-full bg-bg/55 text-fg backdrop-blur-md"
          >
            <ArrowLeft className="size-5" />
          </button>
          <p className="rounded-full bg-bg/55 px-3 py-2 text-sm backdrop-blur-md">
            {wall.name}
            <span className="text-muted"> · {palette.name}</span>
          </p>
          <button
            type="button"
            onClick={shuffle}
            aria-label="Shuffle wallpaper"
            className="grid size-11 place-items-center rounded-full bg-bg/55 text-fg backdrop-blur-md"
          >
            <Shuffle className="size-5" />
          </button>
        </div>

        <div className="px-6 pt-10 text-center">
          <p className="text-sm tracking-wide text-fg/80">{date}</p>
          <p className="font-display mt-2 text-7xl leading-none tracking-tight tabular-nums">{time}</p>
        </div>

        <div className="mt-auto px-3 pb-3">
          {note ? (
            <p className="mb-2 rounded-full bg-fg px-3 py-2 text-center text-sm text-bg">{note}</p>
          ) : null}
          <div className="rounded-3xl border border-fg/15 bg-bg/70 p-3 backdrop-blur-xl">
            <p className="px-1 text-sm text-muted">{wall.mood}</p>
            <div className="mt-3 flex gap-2">
              {wall.palettes.map((item, index) => (
                <button
                  key={item.name}
                  type="button"
                  aria-label={`${item.name} colors`}
                  onClick={() => setTune(wall.id, { color: index })}
                  className={
                    index === tune.color
                      ? "h-11 flex-1 rounded-full border-2 border-fg text-sm font-medium"
                      : "h-11 flex-1 rounded-full border border-border text-sm text-muted"
                  }
                >
                  {item.name}
                </button>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <ChipRow
                label="Motion"
                options={SPEED_LABELS}
                value={tune.speed}
                onChange={(speed) => setTune(wall.id, { speed })}
              />
              <ChipRow
                label="Glow"
                options={GLOW_LABELS}
                value={tune.glow}
                onChange={(glow) => setTune(wall.id, { glow })}
              />
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                aria-label={saved ? "Remove from saved" : "Save wallpaper"}
                onClick={() => toggleFavorite(wall.id)}
                className="grid size-12 place-items-center rounded-2xl border border-border bg-surface text-fg"
              >
                <Heart className={saved ? "size-5 fill-primary text-primary" : "size-5"} />
              </button>
              <button
                type="button"
                onClick={apply}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-primary-fg"
              >
                {isLive ? <Check className="size-4" /> : null}
                {isLive ? "Live on this phone" : "Set live"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChipRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: number;
  onChange: (index: number) => void;
}) {
  return (
    <div className="rounded-2xl bg-surface p-1">
      <p className="px-2 pt-1 text-xs text-muted">{label}</p>
      <div className="mt-1 grid grid-cols-3 gap-1">
        {options.map((option, index) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(index)}
            className={
              index === value
                ? "h-11 rounded-xl bg-fg text-xs font-medium text-bg"
                : "h-11 rounded-xl text-xs text-muted"
            }
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
