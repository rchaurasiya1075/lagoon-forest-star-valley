export const SPEEDS = [0.55, 1, 1.55] as const;
export const INTENSITIES = [0.72, 1, 1.28] as const;
export const SPEED_LABELS = ["Calm", "Live", "Rush"] as const;
export const GLOW_LABELS = ["Soft", "Rich", "Bold"] as const;

export type Palette = {
  name: string;
  bg: string;
  colors: readonly [string, string, string];
};

export type Wallpaper = {
  id: string;
  name: string;
  mood: string;
  tag: "Flow" | "Light" | "Weather" | "Motion";
  palettes: readonly Palette[];
};

export const TAGS = ["All", "Yours", "Saved", "Flow", "Light", "Weather", "Motion"] as const;
export type Tag = (typeof TAGS)[number];

export const WALLPAPERS: readonly Wallpaper[] = [
  {
    id: "aurora",
    name: "Aurora",
    mood: "Silk currents",
    tag: "Flow",
    palettes: [
      { name: "Ember", bg: "#14080c", colors: ["#ff5a36", "#ffb067", "#ff8a6a"] },
      { name: "Lagoon", bg: "#07141a", colors: ["#3dffe2", "#7ec8ff", "#d6fff4"] },
      { name: "Rose", bg: "#160910", colors: ["#ff4d7a", "#ffb3c7", "#ffd0a8"] },
    ],
  },
  {
    id: "tide",
    name: "Tide",
    mood: "Slow shore",
    tag: "Flow",
    palettes: [
      { name: "Dusk", bg: "#0c1218", colors: ["#1c4b6e", "#3d8f8a", "#d7c4a3"] },
      { name: "Ink", bg: "#0a0c10", colors: ["#243044", "#4d6d8a", "#c9d4df"] },
      { name: "Copper", bg: "#140e0a", colors: ["#6b3418", "#c46a32", "#f0c9a0"] },
    ],
  },
  {
    id: "drift",
    name: "Drift",
    mood: "Soft bokeh",
    tag: "Light",
    palettes: [
      { name: "Honey", bg: "#100e0c", colors: ["#ffb067", "#fff1d6", "#ff7a45"] },
      { name: "Mist", bg: "#0e1214", colors: ["#b7d0d8", "#ffffff", "#6aa8b8"] },
      { name: "Berry", bg: "#120c10", colors: ["#ff6b8a", "#ffd0dc", "#7a3048"] },
    ],
  },
  {
    id: "pulse",
    name: "Pulse",
    mood: "Quiet halo",
    tag: "Light",
    palettes: [
      { name: "Signal", bg: "#0c0e12", colors: ["#ff5a36", "#ffd2c4", "#ff8f6b"] },
      { name: "Lime", bg: "#0c100c", colors: ["#c6f25a", "#f4ffd0", "#6ea832"] },
      { name: "Ice", bg: "#0a1014", colors: ["#9ad7ff", "#e8f6ff", "#3d7ea8"] },
    ],
  },
  {
    id: "rain",
    name: "Rain",
    mood: "Night glass",
    tag: "Weather",
    palettes: [
      { name: "Storm", bg: "#070b12", colors: ["#8eb4d4", "#d5e6f2", "#3d5f80"] },
      { name: "Amber", bg: "#100c08", colors: ["#e8b56a", "#fff0d0", "#8a5a28"] },
      { name: "Neon", bg: "#070910", colors: ["#5cffc8", "#d8fff2", "#1a6b58"] },
    ],
  },
  {
    id: "embers",
    name: "Embers",
    mood: "Rising heat",
    tag: "Weather",
    palettes: [
      { name: "Hearth", bg: "#100806", colors: ["#ff5a36", "#ffc48a", "#ff8a3d"] },
      { name: "Gold", bg: "#100e08", colors: ["#f0c36a", "#fff4d2", "#c47a28"] },
      { name: "Ash", bg: "#101010", colors: ["#e8e4dc", "#ffb08a", "#8a847c"] },
    ],
  },
  {
    id: "orbit",
    name: "Orbit",
    mood: "Quiet rings",
    tag: "Motion",
    palettes: [
      { name: "Coral", bg: "#0c0c10", colors: ["#ff5a36", "#ffd0c2", "#ffb067"] },
      { name: "Aqua", bg: "#081014", colors: ["#5ce1ff", "#d8fbff", "#2f8cff"] },
      { name: "Sand", bg: "#12100c", colors: ["#e6c27a", "#fff6e4", "#a88448"] },
    ],
  },
  {
    id: "lattice",
    name: "Lattice",
    mood: "Long road",
    tag: "Motion",
    palettes: [
      { name: "Drive", bg: "#07080c", colors: ["#ff5a36", "#ffb067", "#3a2018"] },
      { name: "Grid", bg: "#070a0c", colors: ["#3dffe2", "#9af7ff", "#0d3a34"] },
      { name: "Dawn", bg: "#100c10", colors: ["#ff8ab0", "#ffe0c2", "#5a2840"] },
    ],
  },
];

export function wallpaperById(id: string): Wallpaper {
  return WALLPAPERS.find((wall) => wall.id === id) ?? WALLPAPERS[0];
}
