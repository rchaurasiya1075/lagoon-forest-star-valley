import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CustomMeta } from "@/lib/customs";

export type Tune = {
  speed: number;
  glow: number;
  color: number;
};

const DEFAULT_TUNE: Tune = { speed: 1, glow: 1, color: 0 };

type StudioState = {
  liveId: string;
  focusId: string;
  favorites: string[];
  tunes: Record<string, Tune>;
  customs: CustomMeta[];
  mode: "browse" | "stage" | "make";
  editId: string | null;
  setFocus: (id: string) => void;
  open: (id: string) => void;
  close: () => void;
  setLive: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setTune: (id: string, patch: Partial<Tune>) => void;
  startNew: () => void;
  editCustom: (id: string) => void;
  upsertCustom: (meta: CustomMeta) => void;
  removeCustom: (id: string) => void;
};

export const useStudio = create<StudioState>()(
  persist(
    (set, get) => ({
      liveId: "aurora",
      focusId: "aurora",
      favorites: [],
      tunes: {},
      customs: [],
      mode: "browse",
      editId: null,
      setFocus: (id) => set({ focusId: id }),
      open: (id) => set({ focusId: id, mode: "stage" }),
      close: () => set({ mode: "browse" }),
      setLive: (id) => set({ liveId: id, focusId: id }),
      toggleFavorite: (id) => {
        const favorites = get().favorites;
        set({
          favorites: favorites.includes(id)
            ? favorites.filter((item) => item !== id)
            : [...favorites, id],
        });
      },
      setTune: (id, patch) => {
        const current = { ...DEFAULT_TUNE, ...get().tunes[id] };
        set({ tunes: { ...get().tunes, [id]: { ...current, ...patch } } });
      },
      startNew: () => set({ mode: "make", editId: null }),
      editCustom: (id) => set({ mode: "make", editId: id }),
      upsertCustom: (meta) => {
        const customs = get().customs.filter((item) => item.id !== meta.id);
        set({ customs: [meta, ...customs], editId: meta.id });
      },
      removeCustom: (id) => {
        const liveId = get().liveId === id ? "aurora" : get().liveId;
        set({
          customs: get().customs.filter((item) => item.id !== id),
          liveId,
          focusId: liveId,
          mode: "browse",
          editId: null,
        });
      },
    }),
    {
      name: "lumen-studio",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        liveId: state.liveId,
        focusId: state.focusId,
        favorites: state.favorites,
        tunes: state.tunes,
        customs: state.customs,
      }),
    },
  ),
);

export function tuneFor(tunes: Record<string, Tune>, id: string): Tune {
  const raw = tunes[id];
  return {
    speed: clampIndex(raw?.speed, 1, 2),
    glow: clampIndex(raw?.glow, 1, 2),
    color: clampIndex(raw?.color, 0, 2),
  };
}

function clampIndex(value: number | undefined, fallback: number, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.max(0, Math.min(max, Math.round(value)));
}
