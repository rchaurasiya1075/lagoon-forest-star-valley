import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemeMode = "dark" | "light" | "auto";
export type ProjectKind = "photo" | "animation" | "live" | "video";

export type ProjectMeta = {
  id: string;
  name: string;
  kind: ProjectKind;
  updated: number;
  favorite: boolean;
};

type LwsState = {
  favorites: string[];
  projects: ProjectMeta[];
  theme: ThemeMode;
  quality: "standard" | "high";
  fps: 24 | 30 | 60;
  notifications: boolean;
  wallpaperTarget: "home" | "lock" | "both";
  toggleFavorite: (id: string) => void;
  upsertProject: (meta: ProjectMeta) => void;
  renameProject: (id: string, name: string) => void;
  removeProject: (id: string) => void;
  toggleProjectFavorite: (id: string) => void;
  setTheme: (theme: ThemeMode) => void;
  setQuality: (quality: "standard" | "high") => void;
  setFps: (fps: 24 | 30 | 60) => void;
  setNotifications: (on: boolean) => void;
  setWallpaperTarget: (target: "home" | "lock" | "both") => void;
  clearLocal: () => void;
};

export const useLws = create<LwsState>()(
  persist(
    (set, get) => ({
      favorites: [],
      projects: [],
      theme: "dark",
      quality: "standard",
      fps: 30,
      notifications: false,
      wallpaperTarget: "both",
      toggleFavorite: (id) => {
        const favorites = get().favorites;
        set({
          favorites: favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id],
        });
      },
      upsertProject: (meta) => {
        const rest = get().projects.filter((item) => item.id !== meta.id);
        set({ projects: [meta, ...rest] });
      },
      renameProject: (id, name) => {
        set({
          projects: get().projects.map((item) => (item.id === id ? { ...item, name, updated: Date.now() } : item)),
        });
      },
      removeProject: (id) => set({ projects: get().projects.filter((item) => item.id !== id) }),
      toggleProjectFavorite: (id) => {
        set({
          projects: get().projects.map((item) => (item.id === id ? { ...item, favorite: !item.favorite } : item)),
        });
      },
      setTheme: (theme) => set({ theme }),
      setQuality: (quality) => set({ quality }),
      setFps: (fps) => set({ fps }),
      setNotifications: (notifications) => set({ notifications }),
      setWallpaperTarget: (wallpaperTarget) => set({ wallpaperTarget }),
      clearLocal: () => set({ projects: [], favorites: [] }),
    }),
    {
      name: "live-wallpaper-studio",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        favorites: state.favorites,
        projects: state.projects,
        theme: state.theme,
        quality: state.quality,
        fps: state.fps,
        notifications: state.notifications,
        wallpaperTarget: state.wallpaperTarget,
      }),
    },
  ),
);

const DB = "lws-projects";
const STORE = "blobs";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveBlob(id: string, dataUrl: string) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(dataUrl, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadBlob(id: string) {
  const db = await openDb();
  const value = await new Promise<string | null>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const request = tx.objectStore(STORE).get(id);
    request.onsuccess = () => resolve((request.result as string) ?? null);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return value;
}

export async function clearBlobs() {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export function fileToImage(file: File, max = 1280): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("That file is not a photo. Choose a JPG or PNG."));
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      reject(new Error("That photo is too large. Try one under 25 MB."));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read that photo."));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.86));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not open that photo. Try a JPG or PNG."));
    };
    img.src = url;
  });
}
