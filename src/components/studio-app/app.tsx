import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Download,
  FolderHeart,
  Heart,
  Home,
  ImagePlus,
  LayoutGrid,
  Pause,
  Play,
  Search,
  Settings,
  Share2,
  Sparkles,
} from "lucide-react";
import { CATEGORIES, WALLPAPERS, byCategory, wallpaperById, type CategoryId } from "@/data/wallpapers";
import { clearBlobs, loadBlob, useLws } from "@/lib/lws-store";
import { WallpaperPoster } from "@/components/studio-app/poster";
import { downloadWallpaper } from "@/components/studio-app/live-photo";
import { CreateStudio } from "@/components/studio-app/create-studio";
import type { WallpaperItem } from "@/data/wallpapers";

type Screen =
  | { name: "splash" }
  | { name: "home" }
  | { name: "categories" }
  | { name: "category"; id: CategoryId }
  | { name: "preview"; id: string }
  | { name: "search" }
  | { name: "settings" }
  | { name: "create"; projectId?: string }
  | { name: "creations" };

const FEATURED = CATEGORIES.map((category) => `${category.id}-01`);

export function StudioApp() {
  const theme = useLws((s) => s.theme);
  const [stack, setStack] = useState<Screen[]>([{ name: "splash" }]);
  const screen = stack[stack.length - 1] ?? { name: "home" };

  useEffect(() => {
    void useLws.persist.rehydrate();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const mode =
      theme === "auto" ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : theme;
    root.dataset.theme = mode;
  }, [theme]);

  useEffect(() => {
    if (screen.name !== "splash") return;
    const id = window.setTimeout(() => setStack([{ name: "home" }]), 2600);
    return () => window.clearTimeout(id);
  }, [screen.name]);

  const push = (next: Screen) => setStack((items) => [...items, next]);
  const pop = () => setStack((items) => (items.length > 1 ? items.slice(0, -1) : [{ name: "home" }]));
  const go = (next: Screen) => setStack([next]);

  const showNav = screen.name === "home" || screen.name === "categories" || screen.name === "create" || screen.name === "creations";

  return (
    <div className="min-h-dvh bg-stage text-fg md:grid md:place-items-center md:py-6">
      <div className="safe-top relative mx-auto flex h-dvh w-full max-w-[440px] flex-col overflow-hidden bg-bg md:h-[min(880px,calc(100dvh-3rem))] md:rounded-3xl md:border md:border-border">
        {screen.name === "splash" ? <Splash onSkip={() => setStack([{ name: "home" }])} /> : null}
        {screen.name === "home" ? <HomeScreen open={push} /> : null}
        {screen.name === "categories" ? <CategoriesScreen open={push} /> : null}
        {screen.name === "category" ? <CategoryScreen id={screen.id} back={pop} open={push} /> : null}
        {screen.name === "preview" ? <PreviewScreen id={screen.id} back={pop} /> : null}
        {screen.name === "search" ? <SearchScreen back={pop} open={push} /> : null}
        {screen.name === "settings" ? <SettingsScreen back={pop} /> : null}
        {screen.name === "create" ? <CreateStudio onBack={pop} resumeId={screen.projectId} /> : null}
        {screen.name === "creations" ? <CreationsScreen open={push} /> : null}
        {showNav ? (
          <nav className="dock grid grid-cols-4 border-t border-border bg-bg/90 backdrop-blur-xl">
            <NavButton label="Home" on={screen.name === "home"} onClick={() => go({ name: "home" })}>
              <Home className="size-5" />
            </NavButton>
            <NavButton label="Create" on={screen.name === "create"} emphasize onClick={() => go({ name: "create" })}>
              <ImagePlus className="size-5" />
            </NavButton>
            <NavButton label="Characters" on={screen.name === "categories"} onClick={() => go({ name: "categories" })}>
              <LayoutGrid className="size-5" />
            </NavButton>
            <NavButton label="Creations" on={screen.name === "creations"} onClick={() => go({ name: "creations" })}>
              <FolderHeart className="size-5" />
            </NavButton>
          </nav>
        ) : null}
      </div>
    </div>
  );
}

function Splash({ onSkip }: { onSkip: () => void }) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden">
      <div className="splash-orb" />
      <div className="splash-bits" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <button type="button" onClick={onSkip} className="relative flex flex-col items-center">
        <div className="splash-mark grid size-24 place-items-center rounded-3xl border border-fg/15 bg-surface/80">
          <Sparkles className="size-10 text-primary" />
        </div>
        <p className="font-display mt-6 text-center text-3xl leading-none tracking-tight">Live Wallpaper Studio</p>
        <p className="mt-3 text-sm text-muted">Original anime characters. Live when you play.</p>
      </button>
      <a
        href="/LiveWallpaperStudio.apk"
        download="LiveWallpaperStudio.apk"
        className="relative mt-8 flex h-12 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-fg"
      >
        <Download className="size-4" />
        Download APK
      </a>
    </div>
  );
}

function HomeScreen({ open }: { open: (screen: Screen) => void }) {
  const [slide, setSlide] = useState(0);
  const favorites = useLws((s) => s.favorites);
  const toggleFavorite = useLws((s) => s.toggleFavorite);

  useEffect(() => {
    const id = window.setInterval(() => setSlide((value) => (value + 1) % FEATURED.length), 4200);
    return () => window.clearInterval(id);
  }, []);

  const featured = wallpaperById(FEATURED[slide] ?? FEATURED[0]) ?? WALLPAPERS[0];
  const heroes = CATEGORIES.map((category) => byCategory(category.id)[0]).filter((item): item is WallpaperItem => Boolean(item));
  const scenes = WALLPAPERS.filter((item) => !item.id.endsWith("-01"));

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <header className="flex items-center gap-3 px-4 pt-4">
        <span className="grid size-11 place-items-center rounded-2xl bg-surface">
          <Sparkles className="size-5 text-primary" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl leading-none">Live Wallpaper Studio</p>
          <p className="mt-1 text-sm text-muted">{WALLPAPERS.length} anime live walls</p>
        </div>
        <IconButton label="Search" onClick={() => open({ name: "search" })}>
          <Search className="size-5" />
        </IconButton>
        <IconButton label="Settings" onClick={() => open({ name: "settings" })}>
          <Settings className="size-5" />
        </IconButton>
      </header>

      <div
        className="mx-4 mt-4 overflow-hidden rounded-3xl border border-border"
        onPointerDown={(event) => {
          const start = event.clientX;
          const el = event.currentTarget;
          el.setPointerCapture(event.pointerId);
          const move = (ev: PointerEvent) => {
            if (start - ev.clientX > 40) setSlide((value) => (value + 1) % FEATURED.length);
            else if (ev.clientX - start > 40) setSlide((value) => (value + FEATURED.length - 1) % FEATURED.length);
            el.removeEventListener("pointerup", move);
          };
          el.addEventListener("pointerup", move);
        }}
      >
        <div className="banner-pan relative h-52">
          <WallpaperPoster item={featured} className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="text-xs tracking-wide text-fg/80 uppercase">{featured.character}</p>
            <p className="font-display text-2xl leading-none">{featured.title}</p>
            <button
              type="button"
              onClick={() => open({ name: "create" })}
              className="mt-3 h-11 rounded-full bg-primary px-4 text-sm font-semibold text-primary-fg"
            >
              Create now
            </button>
          </div>
        </div>
      </div>

      <Section title="Characters">
        <Rail>
          {heroes.map((item) => (
            <WallCard key={item.id} id={item.id} liked={favorites.includes(item.id)} onLike={() => toggleFavorite(item.id)} onOpen={() => open({ name: "preview", id: item.id })} live />
          ))}
        </Rail>
      </Section>
      <Section title="More scenes">
        <Rail>
          {scenes.map((item) => (
            <WallCard key={item.id} id={item.id} liked={favorites.includes(item.id)} onLike={() => toggleFavorite(item.id)} onOpen={() => open({ name: "preview", id: item.id })} live />
          ))}
        </Rail>
      </Section>
      <button type="button" onClick={() => open({ name: "categories" })} className="mx-4 mb-4 flex h-24 w-[calc(100%-2rem)] flex-col items-start justify-center rounded-3xl border border-border bg-surface px-5 text-left">
        <span className="font-display text-3xl leading-none">Characters</span>
        <span className="mt-1 text-sm text-muted">Aoi, Ren, Hana, and the rest</span>
      </button>
    </div>
  );
}

function CategoriesScreen({ open }: { open: (screen: Screen) => void }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4">
      <p className="font-display text-3xl leading-none">Characters</p>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        {CATEGORIES.map((category) => {
          const cover = byCategory(category.id)[0];
          return (
            <button key={category.id} type="button" onClick={() => open({ name: "category", id: category.id })} className="relative h-40 overflow-hidden rounded-3xl border border-border text-left">
              {cover ? <WallpaperPoster item={cover} className="absolute inset-0 h-full w-full" /> : null}
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg to-transparent p-3">
                <span className="block font-display text-lg leading-none">{category.label}</span>
                <span className="mt-1 block text-xs text-muted">{category.blurb}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CategoryScreen({ id, back, open }: { id: CategoryId; back: () => void; open: (screen: Screen) => void }) {
  const category = CATEGORIES.find((item) => item.id === id) ?? CATEGORIES[0];
  const items = byCategory(id);
  const [count, setCount] = useState(6);
  const favorites = useLws((s) => s.favorites);
  const toggleFavorite = useLws((s) => s.toggleFavorite);
  const visible = items.slice(0, count);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-2 px-3 pt-3">
        <IconButton label="Back" onClick={back}>
          <ArrowLeft className="size-5" />
        </IconButton>
        <div>
          <p className="font-display text-2xl leading-none">{category.label}</p>
          <p className="text-sm text-muted">{items.length} live walls</p>
        </div>
      </header>
      <div
        className="min-h-0 flex-1 overflow-y-auto px-4 py-3"
        onScroll={(event) => {
          const el = event.currentTarget;
          if (el.scrollTop + el.clientHeight > el.scrollHeight - 80) setCount((value) => Math.min(items.length, value + 4));
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          {visible.map((item) => (
            <div key={item.id} className="relative h-56 overflow-hidden rounded-3xl border border-border">
              <button type="button" onClick={() => open({ name: "preview", id: item.id })} className="absolute inset-0 text-left">
                <WallpaperPoster item={item} className="absolute inset-0 h-full w-full" />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg to-transparent p-3 font-display text-lg leading-none">{item.title}</span>
              </button>
              <button
                type="button"
                aria-label={favorites.includes(item.id) ? "Unfavorite" : "Favorite"}
                onClick={() => toggleFavorite(item.id)}
                className="absolute top-2 right-2 grid size-11 place-items-center rounded-full bg-bg/70"
              >
                <Heart className={favorites.includes(item.id) ? "size-5 fill-primary text-primary" : "size-5"} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewScreen({ id, back }: { id: string; back: () => void }) {
  const item = wallpaperById(id);
  const favorites = useLws((s) => s.favorites);
  const toggleFavorite = useLws((s) => s.toggleFavorite);
  const setWallpaperTarget = useLws((s) => s.setWallpaperTarget);
  const [playing, setPlaying] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  if (!item) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="font-display text-2xl">That wallpaper is missing</p>
        <button type="button" onClick={back} className="mt-4 h-11 rounded-full bg-surface px-4 text-sm">
          Back
        </button>
      </div>
    );
  }

  async function saveStill() {
    const canvas = document.querySelector<HTMLCanvasElement>("[data-preview] canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/jpeg", 0.9);
    link.download = `${item?.id ?? "wallpaper"}.jpg`;
    link.click();
    setNote("Image saved. Set it from your phone's wallpaper picker.");
  }

  return (
    <div className="relative min-h-0 flex-1">
      <div data-preview className="absolute inset-0">
        <WallpaperPoster item={item} playing={playing} className="h-full w-full" />
      </div>
      <div className="absolute inset-0 flex flex-col">
        <div className="flex items-center justify-between px-3 pt-3">
          <IconButton label="Back" onClick={back}>
            <ArrowLeft className="size-5" />
          </IconButton>
          <p className="rounded-full bg-bg/60 px-3 py-2 text-sm backdrop-blur-md">{item.title}</p>
          <IconButton label={favorites.includes(item.id) ? "Unfavorite" : "Favorite"} onClick={() => toggleFavorite(item.id)}>
            <Heart className={favorites.includes(item.id) ? "size-5 fill-primary text-primary" : "size-5"} />
          </IconButton>
        </div>
        <div className="mt-auto px-3 pb-4">
          {note ? <p className="mb-2 rounded-2xl bg-fg px-3 py-2 text-sm text-bg">{note}</p> : null}
          {item.animated ? (
            <button type="button" onClick={() => setPlaying((value) => !value)} className="mb-2 flex h-11 items-center gap-2 rounded-full bg-bg/70 px-4 text-sm backdrop-blur-md">
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
              {playing ? "Pause" : "Play"} · {item.animated ? "loop" : "still"}
            </button>
          ) : null}
          <div className="flex gap-2">
            <IconButton label="Save image" onClick={() => void saveStill()}>
              <Download className="size-5" />
            </IconButton>
            <IconButton
              label="Share"
              onClick={() => {
                const text = `${item.title} — Live Wallpaper Studio`;
                if (navigator.share) void navigator.share({ title: item.title, text }).catch(() => setNote(text));
                else setNote(text);
              }}
            >
              <Share2 className="size-5" />
            </IconButton>
            <button type="button" onClick={() => setSheet(true)} className="h-12 flex-1 rounded-2xl bg-primary text-sm font-semibold text-primary-fg">
              Set wallpaper
            </button>
          </div>
        </div>
      </div>
      {sheet ? (
        <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border border-border bg-bg/95 p-4 backdrop-blur-xl">
          <p className="font-display text-xl">Set wallpaper</p>
          <p className="mt-1 text-sm text-pretty text-muted">
            This preview cannot change the Android system wallpaper. Your choice is saved, and the image downloads so the phone wallpaper picker can use it.
          </p>
          <div className="mt-3 grid gap-2">
            {(
              [
                ["home", "Home screen"],
                ["lock", "Lock screen"],
                ["both", "Home + lock screen"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setWallpaperTarget(id);
                  void saveStill();
                  setSheet(false);
                }}
                className="h-12 rounded-2xl bg-surface text-sm"
              >
                {label}
              </button>
            ))}
            <button type="button" onClick={() => setSheet(false)} className="h-11 text-sm text-muted">
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SearchScreen({ back, open }: { back: () => void; open: (screen: Screen) => void }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return WALLPAPERS.slice(0, 12);
    return WALLPAPERS.filter((item) => `${item.title} ${item.character} ${item.category}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pt-3">
      <div className="flex items-center gap-2">
        <IconButton label="Back" onClick={back}>
          <ArrowLeft className="size-5" />
        </IconButton>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Aoi, rain, shrine..."
          className="h-12 flex-1 rounded-2xl border border-border bg-surface px-3 text-sm text-fg"
        />
      </div>
      <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
        {results.length === 0 ? <p className="pt-10 text-center text-sm text-muted">Nothing matches that.</p> : null}
        <div className="grid grid-cols-2 gap-3">
          {results.map((item) => (
            <button key={item.id} type="button" onClick={() => open({ name: "preview", id: item.id })} className="relative h-48 overflow-hidden rounded-3xl border border-border text-left">
              <WallpaperPoster item={item} className="absolute inset-0 h-full w-full" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg to-transparent p-3 text-sm">{item.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsScreen({ back }: { back: () => void }) {
  const theme = useLws((s) => s.theme);
  const quality = useLws((s) => s.quality);
  const fps = useLws((s) => s.fps);
  const notifications = useLws((s) => s.notifications);
  const setTheme = useLws((s) => s.setTheme);
  const setQuality = useLws((s) => s.setQuality);
  const setFps = useLws((s) => s.setFps);
  const setNotifications = useLws((s) => s.setNotifications);
  const clearLocal = useLws((s) => s.clearLocal);
  const [note, setNote] = useState<string | null>(null);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-3">
      <div className="flex items-center gap-2">
        <IconButton label="Back" onClick={back}>
          <ArrowLeft className="size-5" />
        </IconButton>
        <p className="font-display text-2xl">Settings</p>
      </div>
      <div className="mt-4 space-y-3">
        <Choice label="Theme" value={theme} options={["dark", "light", "auto"]} onChange={setTheme} />
        <Choice label="Wallpaper quality" value={quality} options={["standard", "high"]} onChange={setQuality} />
        <Choice label="FPS" value={String(fps)} options={["24", "30", "60"]} onChange={(value) => setFps(Number(value) as 24 | 30 | 60)} />
        <button type="button" onClick={() => setNotifications(!notifications)} className="flex h-14 w-full items-center justify-between rounded-2xl bg-surface px-4 text-sm">
          Notifications
          <span className="text-muted">{notifications ? "On" : "Off"}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            void clearBlobs();
            clearLocal();
            setNote("Cache cleared.");
          }}
          className="h-14 w-full rounded-2xl bg-surface text-sm"
        >
          Clear cache
        </button>
        <div className="rounded-2xl bg-surface p-4 text-sm text-pretty text-muted">
          Battery: animated previews run only after you press play. Downloads stay on this device. Privacy: photos you edit stay in this browser until you clear cache. About: Live Wallpaper Studio 1.0.0. System live wallpaper needs Android's own wallpaper picker.
        </div>
        {note ? <p className="text-sm">{note}</p> : null}
      </div>
    </div>
  );
}

function CreationsScreen({ open }: { open: (screen: Screen) => void }) {
  const projects = useLws((s) => s.projects);
  const renameProject = useLws((s) => s.renameProject);
  const removeProject = useLws((s) => s.removeProject);
  const toggleProjectFavorite = useLws((s) => s.toggleProjectFavorite);
  const [folder, setFolder] = useState<"all" | "photo" | "animation" | "live" | "favorites">("all");
  const [note, setNote] = useState<string | null>(null);
  const shown = projects.filter((item) => {
    if (folder === "all") return true;
    if (folder === "favorites") return item.favorite;
    return item.kind === folder;
  });

  async function shareProject(name: string) {
    const text = `${name} — Live Wallpaper Studio`;
    if (navigator.share) {
      try {
        await navigator.share({ title: name, text });
        return;
      } catch {
        setNote(text);
        return;
      }
    }
    setNote(text);
  }

  async function downloadProject(id: string, name: string) {
    const data = await loadBlob(id);
    if (!data) {
      setNote("That image is no longer in this browser.");
      return;
    }
    const link = document.createElement("a");
    link.href = data;
    link.download = `${name.replace(/\s+/g, "-").toLowerCase()}.jpg`;
    link.click();
    setNote("Image saved. Set it from your phone wallpaper picker. This app cannot change the system wallpaper.");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pt-4">
      <p className="font-display text-3xl leading-none">My creations</p>
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
        {(["all", "photo", "animation", "live", "favorites"] as const).map((id) => (
          <button key={id} type="button" onClick={() => setFolder(id)} className={folder === id ? "h-11 shrink-0 rounded-full bg-fg px-3 text-xs font-medium text-bg capitalize" : "h-11 shrink-0 rounded-full bg-surface px-3 text-xs text-muted capitalize"}>
            {id}
          </button>
        ))}
      </div>
      {note ? <p className="mt-2 text-sm text-muted">{note}</p> : null}
      <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
        {shown.length === 0 ? (
          <div className="px-4 pt-16 text-center">
            <p className="font-display text-2xl">Nothing saved yet</p>
            <p className="mt-2 text-sm text-muted">Create a photo, animation, or live wallpaper first.</p>
          </div>
        ) : (
          <div className="space-y-2 pb-3">
            {shown.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-surface p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted capitalize">{item.kind}</p>
                  </div>
                  <button type="button" aria-label={item.favorite ? "Unfavorite" : "Favorite"} onClick={() => toggleProjectFavorite(item.id)} className="grid size-11 place-items-center rounded-full bg-bg">
                    <Heart className={item.favorite ? "size-5 fill-primary text-primary" : "size-5"} />
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => open({ name: "create", projectId: item.id })} className="h-10 rounded-xl bg-bg text-xs">
                    Edit again
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const name = window.prompt("Rename", item.name);
                      if (name) renameProject(item.id, name);
                    }}
                    className="h-10 rounded-xl bg-bg text-xs"
                  >
                    Rename
                  </button>
                  <button type="button" onClick={() => void shareProject(item.name)} className="h-10 rounded-xl bg-bg text-xs">
                    Share
                  </button>
                  <button type="button" onClick={() => void downloadProject(item.id, item.name)} className="h-10 rounded-xl bg-bg text-xs">
                    Set wallpaper
                  </button>
                  <button type="button" onClick={() => removeProject(item.id)} className="col-span-2 h-10 rounded-xl bg-bg text-xs">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WallCard({
  id,
  liked,
  onLike,
  onOpen,
  live,
}: {
  id: string;
  liked: boolean;
  onLike: () => void;
  onOpen: () => void;
  live?: boolean;
}) {
  const item = wallpaperById(id);
  if (!item) return null;
  return (
    <div className="relative h-64 w-40 shrink-0 overflow-hidden rounded-3xl border border-border">
      <button type="button" onClick={onOpen} className="absolute inset-0 text-left">
        <WallpaperPoster item={item} className="absolute inset-0 h-full w-full" />
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg via-bg/70 to-transparent p-3">
          <span className="block text-xs text-muted uppercase">{item.character}</span>
          <span className="font-display text-lg leading-none">{item.title}</span>
        </span>
        {live ? <Play className="absolute top-3 left-3 size-5" /> : null}
      </button>
      <button type="button" aria-label="Save image" onClick={() => downloadWallpaper(item)} className={live ? "absolute top-14 left-3 grid size-11 place-items-center rounded-full bg-bg/70" : "absolute top-3 left-3 grid size-11 place-items-center rounded-full bg-bg/70"}>
        <Download className="size-5" />
      </button>
      <button type="button" aria-label={liked ? "Unfavorite" : "Favorite"} onClick={onLike} className="absolute top-2 right-2 grid size-11 place-items-center rounded-full bg-bg/70">
        <Heart className={liked ? "size-5 fill-primary text-primary" : "size-5"} />
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="px-4 font-display text-xl leading-none">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Rail({ children }: { children: ReactNode }) {
  return <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">{children}</div>;
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="grid size-11 place-items-center rounded-full bg-bg/70 text-fg backdrop-blur-md">
      {children}
    </button>
  );
}

function NavButton({
  label,
  on,
  emphasize,
  onClick,
  children,
}: {
  label: string;
  on: boolean;
  emphasize?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} className={on ? "flex h-16 flex-col items-center justify-center gap-1 text-xs text-primary" : "flex h-16 flex-col items-center justify-center gap-1 text-xs text-muted"}>
      <span className={emphasize ? "grid size-9 place-items-center rounded-full bg-primary text-primary-fg" : ""}>{children}</span>
      {label}
    </button>
  );
}

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="rounded-2xl bg-surface p-3">
      <p className="text-sm">{label}</p>
      <div className="mt-2 flex gap-2">
        {options.map((option) => (
          <button key={option} type="button" onClick={() => onChange(option)} className={option === value ? "h-11 flex-1 rounded-xl bg-fg text-xs font-medium text-bg capitalize" : "h-11 flex-1 rounded-xl text-xs text-muted capitalize"}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
