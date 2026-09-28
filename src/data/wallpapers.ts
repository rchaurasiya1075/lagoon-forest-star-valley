export const CATEGORIES = [
  { id: "aoi", label: "Aoi", blurb: "Shrine archer" },
  { id: "ren", label: "Ren", blurb: "Neon rain" },
  { id: "hana", label: "Hana", blurb: "Blossom duelist" },
  { id: "kuro", label: "Kuro", blurb: "Moon fox" },
  { id: "sora", label: "Sora", blurb: "Sky pilot" },
  { id: "mika", label: "Mika", blurb: "Star witch" },
  { id: "yuki", label: "Yuki", blurb: "Winter dancer" },
  { id: "akari", label: "Akari", blurb: "Lantern keeper" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];
export type Motion = "petals" | "rain" | "sparks" | "snow" | "embers" | "stars" | "drift";

export type WallpaperItem = {
  id: string;
  title: string;
  category: CategoryId;
  character: string;
  src: string;
  motion: Motion;
  seed: number;
  animated: true;
};

type Row = [string, Motion];

function pack(category: CategoryId, character: string, rows: Row[]): WallpaperItem[] {
  return rows.map((row, index) => ({
    id: `${category}-0${index + 1}`,
    title: row[0],
    category,
    character,
    src: `/anime/${category}-0${index + 1}.jpg`,
    motion: row[1],
    seed: index * 19 + character.length * 7 + 5,
    animated: true as const,
  }));
}

export const WALLPAPERS: WallpaperItem[] = [
  ...pack("aoi", "Aoi", [
    ["Lantern Gate", "petals"],
    ["Moon Bridge", "petals"],
    ["Shrine Light", "petals"],
  ]),
  ...pack("ren", "Ren", [
    ["Neon Alley", "rain"],
    ["Rain Roof", "rain"],
    ["Wet Glass", "rain"],
  ]),
  ...pack("hana", "Hana", [
    ["Petal Court", "petals"],
    ["Spring Close", "petals"],
    ["First Stance", "petals"],
  ]),
  ...pack("kuro", "Kuro", [
    ["Roof Moon", "sparks"],
    ["Gold Alley", "sparks"],
    ["Edge of Night", "sparks"],
  ]),
  ...pack("sora", "Sora", [
    ["Cloud Deck", "drift"],
    ["Sunset Rail", "drift"],
    ["Cabin Dawn", "drift"],
  ]),
  ...pack("mika", "Mika", [
    ["Comet Glass", "stars"],
    ["Balcony Sky", "stars"],
    ["Star Chart", "stars"],
  ]),
  ...pack("yuki", "Yuki", [
    ["Snow Garden", "snow"],
    ["Lantern Path", "snow"],
    ["Winter Close", "snow"],
  ]),
  ...pack("akari", "Akari", [
    ["Market Glow", "embers"],
    ["Night Stall", "embers"],
    ["Lantern Walk", "embers"],
  ]),
];

export function wallpaperById(id: string) {
  return WALLPAPERS.find((item) => item.id === id) ?? null;
}

export function byCategory(id: CategoryId) {
  return WALLPAPERS.filter((item) => item.category === id);
}
