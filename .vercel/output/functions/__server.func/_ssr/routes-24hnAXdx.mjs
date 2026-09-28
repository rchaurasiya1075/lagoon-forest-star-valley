import { i as __toESM } from "../_runtime.mjs";
import { L as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Search, c as LayoutGrid, d as Heart, f as FolderHeart, i as Settings, l as ImagePlus, m as ArrowLeft, n as Sparkles, o as Play, p as Download, r as Share2, s as Pause, u as House } from "../_libs/lucide-react.mjs";
import { n as persist, r as create, t as createJSONStorage } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-24hnAXdx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CATEGORIES = [
	{
		id: "aoi",
		label: "Aoi",
		blurb: "Shrine archer"
	},
	{
		id: "ren",
		label: "Ren",
		blurb: "Neon rain"
	},
	{
		id: "hana",
		label: "Hana",
		blurb: "Blossom duelist"
	},
	{
		id: "kuro",
		label: "Kuro",
		blurb: "Moon fox"
	},
	{
		id: "sora",
		label: "Sora",
		blurb: "Sky pilot"
	},
	{
		id: "mika",
		label: "Mika",
		blurb: "Star witch"
	},
	{
		id: "yuki",
		label: "Yuki",
		blurb: "Winter dancer"
	},
	{
		id: "akari",
		label: "Akari",
		blurb: "Lantern keeper"
	}
];
function pack(category, character, rows) {
	return rows.map((row, index) => ({
		id: `${category}-0${index + 1}`,
		title: row[0],
		category,
		character,
		src: `/anime/${category}-0${index + 1}.jpg`,
		motion: row[1],
		seed: index * 19 + character.length * 7 + 5,
		animated: true
	}));
}
var WALLPAPERS = [
	...pack("aoi", "Aoi", [
		["Lantern Gate", "petals"],
		["Moon Bridge", "petals"],
		["Shrine Light", "petals"]
	]),
	...pack("ren", "Ren", [
		["Neon Alley", "rain"],
		["Rain Roof", "rain"],
		["Wet Glass", "rain"]
	]),
	...pack("hana", "Hana", [
		["Petal Court", "petals"],
		["Spring Close", "petals"],
		["First Stance", "petals"]
	]),
	...pack("kuro", "Kuro", [
		["Roof Moon", "sparks"],
		["Gold Alley", "sparks"],
		["Edge of Night", "sparks"]
	]),
	...pack("sora", "Sora", [
		["Cloud Deck", "drift"],
		["Sunset Rail", "drift"],
		["Cabin Dawn", "drift"]
	]),
	...pack("mika", "Mika", [
		["Comet Glass", "stars"],
		["Balcony Sky", "stars"],
		["Star Chart", "stars"]
	]),
	...pack("yuki", "Yuki", [
		["Snow Garden", "snow"],
		["Lantern Path", "snow"],
		["Winter Close", "snow"]
	]),
	...pack("akari", "Akari", [
		["Market Glow", "embers"],
		["Night Stall", "embers"],
		["Lantern Walk", "embers"]
	])
];
function wallpaperById(id) {
	return WALLPAPERS.find((item) => item.id === id) ?? null;
}
function byCategory(id) {
	return WALLPAPERS.filter((item) => item.category === id);
}
var useLws = create()(persist((set, get) => ({
	favorites: [],
	projects: [],
	theme: "dark",
	quality: "standard",
	fps: 30,
	notifications: false,
	wallpaperTarget: "both",
	toggleFavorite: (id) => {
		const favorites = get().favorites;
		set({ favorites: favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id] });
	},
	upsertProject: (meta) => {
		set({ projects: [meta, ...get().projects.filter((item) => item.id !== meta.id)] });
	},
	renameProject: (id, name) => {
		set({ projects: get().projects.map((item) => item.id === id ? {
			...item,
			name,
			updated: Date.now()
		} : item) });
	},
	removeProject: (id) => set({ projects: get().projects.filter((item) => item.id !== id) }),
	toggleProjectFavorite: (id) => {
		set({ projects: get().projects.map((item) => item.id === id ? {
			...item,
			favorite: !item.favorite
		} : item) });
	},
	setTheme: (theme) => set({ theme }),
	setQuality: (quality) => set({ quality }),
	setFps: (fps) => set({ fps }),
	setNotifications: (notifications) => set({ notifications }),
	setWallpaperTarget: (wallpaperTarget) => set({ wallpaperTarget }),
	clearLocal: () => set({
		projects: [],
		favorites: []
	})
}), {
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
		wallpaperTarget: state.wallpaperTarget
	})
}));
var DB = "lws-projects";
var STORE = "blobs";
function openDb() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB, 1);
		request.onupgradeneeded = () => {
			if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}
async function saveBlob(id, dataUrl) {
	const db = await openDb();
	await new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, "readwrite");
		tx.objectStore(STORE).put(dataUrl, id);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
	db.close();
}
async function loadBlob(id) {
	const db = await openDb();
	const value = await new Promise((resolve, reject) => {
		const request = db.transaction(STORE, "readonly").objectStore(STORE).get(id);
		request.onsuccess = () => resolve(request.result ?? null);
		request.onerror = () => reject(request.error);
	});
	db.close();
	return value;
}
async function clearBlobs() {
	const db = await openDb();
	await new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, "readwrite");
		tx.objectStore(STORE).clear();
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
	db.close();
}
function fileToImage(file, max = 1280) {
	return new Promise((resolve, reject) => {
		if (!file.type.startsWith("image/")) {
			reject(/* @__PURE__ */ new Error("That file is not a photo. Choose a JPG or PNG."));
			return;
		}
		if (file.size > 26214400) {
			reject(/* @__PURE__ */ new Error("That photo is too large. Try one under 25 MB."));
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
				reject(/* @__PURE__ */ new Error("Could not read that photo."));
				return;
			}
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			URL.revokeObjectURL(url);
			resolve(canvas.toDataURL("image/jpeg", .86));
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(/* @__PURE__ */ new Error("Could not open that photo. Try a JPG or PNG."));
		};
		img.src = url;
	});
}
var cache = /* @__PURE__ */ new Map();
function loadWallpaper(src) {
	let img = cache.get(src);
	if (!img) {
		img = new Image();
		img.decoding = "async";
		img.src = src;
		cache.set(src, img);
	}
	return img;
}
function drawCover(ctx, img, w, h, zoom, ox, oy) {
	const iw = img.naturalWidth;
	const ih = img.naturalHeight;
	if (!iw || !ih) return;
	const scale = Math.max(w / iw, h / ih) * zoom;
	const dw = iw * scale;
	const dh = ih * scale;
	ctx.drawImage(img, (w - dw) / 2 + ox * w, (h - dh) / 2 + oy * h, dw, dh);
}
function drawLivePhoto(ctx, img, w, h, item, time) {
	const playing = time > 0;
	const zoom = playing ? 1.14 + Math.sin(time * .45 + item.seed) * .05 : 1.06;
	const ox = playing ? Math.sin(time * .28 + item.seed) * .035 : 0;
	const oy = playing ? Math.cos(time * .22 + item.seed * .7) * .028 : 0;
	ctx.clearRect(0, 0, w, h);
	ctx.fillStyle = "#07080c";
	ctx.fillRect(0, 0, w, h);
	drawCover(ctx, img, w, h, zoom, ox, oy);
	if (playing) paintMotes(ctx, w, h, item.motion, time, item.seed);
}
function downloadWallpaper(item) {
	const img = loadWallpaper(item.src);
	const save = () => {
		const canvas = document.createElement("canvas");
		canvas.width = 720;
		canvas.height = 1280;
		const ctx = canvas.getContext("2d");
		if (!ctx || img.naturalWidth < 2) return;
		drawLivePhoto(ctx, img, 720, 1280, item, 0);
		const link = document.createElement("a");
		link.href = canvas.toDataURL("image/jpeg", .92);
		link.download = `${item.id}.jpg`;
		link.click();
	};
	if (img.complete && img.naturalWidth > 2) save();
	else img.addEventListener("load", save, { once: true });
}
function paintMotes(ctx, w, h, motion, time, seed) {
	const count = 28;
	ctx.save();
	for (let i = 0; i < count; i += 1) {
		const sway = Math.sin(time * 1.3 + i + seed) * w * .02;
		const xBase = (i * 47 + seed * 13) % 100 / 100 * w;
		const phase = (i * .17 + seed * .02) % 1;
		if (motion === "rain") {
			const y = (phase + time * .62) % 1 * h;
			ctx.strokeStyle = "rgba(186, 230, 255, 0.45)";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(xBase, y);
			ctx.lineTo(xBase - 3, y + 16);
			ctx.stroke();
			continue;
		}
		const rising = motion === "sparks" || motion === "embers" || motion === "stars";
		const travel = (phase + time * (motion === "snow" ? .07 : motion === "stars" ? .025 : rising ? .11 : .09)) % 1;
		const y = rising ? h - travel * h : travel * h;
		const x = xBase + sway;
		ctx.globalAlpha = .28 + i % 5 * .1;
		ctx.fillStyle = motion === "petals" ? "rgba(255, 214, 226, 0.95)" : motion === "sparks" ? "rgba(255, 214, 120, 0.95)" : motion === "embers" ? "rgba(255, 148, 72, 0.9)" : "rgba(255, 255, 255, 0.92)";
		ctx.beginPath();
		ctx.arc(x, y, motion === "stars" ? 1.3 : 2.1, 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.restore();
}
function WallpaperPoster({ item, playing = false, className }) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		let raf = 0;
		let alive = true;
		let tries = 0;
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const img = loadWallpaper(item.src);
		const draw = (now) => {
			if (!alive) return;
			const rect = canvas.getBoundingClientRect();
			if (rect.width < 2 || rect.height < 2 || !img.complete || img.naturalWidth < 2) {
				if ((playing || tries < 40) && alive) {
					tries += 1;
					raf = requestAnimationFrame(draw);
				}
				return;
			}
			const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
			const w = Math.round(rect.width * dpr);
			const h = Math.round(rect.height * dpr);
			if (canvas.width !== w || canvas.height !== h) {
				canvas.width = w;
				canvas.height = h;
			}
			const live = playing && !reduce;
			drawLivePhoto(ctx, img, w, h, item, live ? now / 1e3 : 0);
			if (live) raf = requestAnimationFrame(draw);
		};
		draw(0);
		return () => {
			alive = false;
			cancelAnimationFrame(raf);
		};
	}, [item, playing]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		className,
		"aria-hidden": "true"
	});
}
var NEUTRAL = {
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
	crop: "free"
};
var FILTERS = {
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
	fantasy: "saturate(1.4) hue-rotate(-20deg) contrast(1.1)"
};
var MOTIONS = [
	"Zoom in",
	"Zoom out",
	"Pan left",
	"Pan right",
	"Pan up",
	"Pan down",
	"Ken Burns",
	"Float",
	"Shake",
	"Glow",
	"Particle",
	"Wave",
	"Camera"
];
function baseFilter(edit) {
	const bright = edit.brightness + edit.exposure;
	const contrast = edit.contrast + edit.sharpness * .45;
	const hue = edit.temperature + edit.tint;
	return `brightness(${bright}%) contrast(${contrast}%) saturate(${edit.saturate}%) hue-rotate(${hue}deg) blur(${edit.blur}px)`;
}
function cropOf(img, crop) {
	if (crop === "free") return {
		x: 0,
		y: 0,
		w: img.width,
		h: img.height
	};
	const target = crop === "story" ? 9 / 16 : crop === "square" ? 1 : 16 / 9;
	if (img.width / img.height > target) {
		const w = img.height * target;
		return {
			x: (img.width - w) / 2,
			y: 0,
			w,
			h: img.height
		};
	}
	const h = img.width / target;
	return {
		x: 0,
		y: (img.height - h) / 2,
		w: img.width,
		h
	};
}
function motionFrame(name, p) {
	const e = p < .5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
	if (name === "Zoom in") return {
		z: 1 + e * .25,
		x: 0,
		y: 0,
		shake: 0
	};
	if (name === "Zoom out") return {
		z: 1.25 - e * .25,
		x: 0,
		y: 0,
		shake: 0
	};
	if (name === "Pan left") return {
		z: 1.15,
		x: (.5 - e) * 40,
		y: 0,
		shake: 0
	};
	if (name === "Pan right") return {
		z: 1.15,
		x: (e - .5) * 40,
		y: 0,
		shake: 0
	};
	if (name === "Pan up") return {
		z: 1.15,
		x: 0,
		y: (.5 - e) * 40,
		shake: 0
	};
	if (name === "Pan down") return {
		z: 1.15,
		x: 0,
		y: (e - .5) * 40,
		shake: 0
	};
	if (name === "Ken Burns") return {
		z: 1 + e * .2,
		x: (e - .5) * 24,
		y: (.5 - e) * 16,
		shake: 0
	};
	if (name === "Float") return {
		z: 1.05,
		x: 0,
		y: Math.sin(p * Math.PI * 2) * 16,
		shake: 0
	};
	if (name === "Shake") return {
		z: 1.04,
		x: Math.sin(p * 40) * 6,
		y: Math.cos(p * 36) * 4,
		shake: 1
	};
	if (name === "Glow") return {
		z: 1.02 + Math.sin(p * Math.PI * 2) * .03,
		x: 0,
		y: 0,
		shake: 0
	};
	if (name === "Particle") return {
		z: 1.05,
		x: Math.sin(p * Math.PI * 2) * 8,
		y: Math.cos(p * Math.PI * 4) * 6,
		shake: 0
	};
	if (name === "Camera") return {
		z: 1.16 - e * .1,
		x: Math.sin(e * Math.PI) * 26,
		y: (e - .5) * 12,
		shake: 0
	};
	return {
		z: 1.08,
		x: Math.sin(p * Math.PI * 2) * 10,
		y: Math.cos(p * Math.PI * 2) * 6,
		shake: 0
	};
}
function CreateStudio({ onBack, resumeId }) {
	const fileRef = (0, import_react.useRef)(null);
	const videoRef = (0, import_react.useRef)(null);
	const canvasRef = (0, import_react.useRef)(null);
	const imgRef = (0, import_react.useRef)(null);
	const upsertProject = useLws((s) => s.upsertProject);
	const [src, setSrc] = (0, import_react.useState)(null);
	const [videoUrl, setVideoUrl] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [tool, setTool] = (0, import_react.useState)(null);
	const [edit, setEdit] = (0, import_react.useState)(NEUTRAL);
	const [past, setPast] = (0, import_react.useState)([]);
	const [future, setFuture] = (0, import_react.useState)([]);
	const [compare, setCompare] = (0, import_react.useState)(false);
	const [motion, setMotion] = (0, import_react.useState)("Ken Burns");
	const [duration, setDuration] = (0, import_react.useState)(6);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [depth, setDepth] = (0, import_react.useState)(.4);
	const [look, setLook] = (0, import_react.useState)({
		x: 0,
		y: 0
	});
	const videoEl = (0, import_react.useRef)(null);
	const [loopVideo, setLoopVideo] = (0, import_react.useState)(true);
	const [muted, setMuted] = (0, import_react.useState)(true);
	const [trim, setTrim] = (0, import_react.useState)({
		start: 0,
		end: 12
	});
	const [videoNote, setVideoNote] = (0, import_react.useState)(null);
	const [note, setNote] = (0, import_react.useState)(null);
	const [aiNote, setAiNote] = (0, import_react.useState)(null);
	const playRef = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		if (!resumeId) return;
		loadBlob(resumeId).then((data) => {
			if (data) setSrc(data);
		});
	}, [resumeId]);
	const paintRef = (0, import_react.useRef)(() => {});
	(0, import_react.useEffect)(() => {
		if (!src) return;
		const img = new Image();
		img.onload = () => {
			imgRef.current = img;
			paintRef.current(0);
		};
		img.src = src;
	}, [src]);
	(0, import_react.useEffect)(() => {
		if (playing) return;
		const canvas = canvasRef.current;
		if (!canvas || !src) return;
		const draw = () => paintRef.current(0);
		draw();
		const observer = new ResizeObserver(draw);
		observer.observe(canvas);
		return () => observer.disconnect();
	}, [
		src,
		edit,
		compare,
		look,
		depth,
		tool,
		playing
	]);
	(0, import_react.useEffect)(() => {
		return () => cancelAnimationFrame(playRef.current);
	}, []);
	function paint(progress) {
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
		const frame = (tool === "animate" || tool === "live") && playing ? motionFrame(motion, progress) : tool === "depth" ? {
			z: 1.06,
			x: look.x * 36 * depth,
			y: look.y * 28 * depth,
			shake: 0
		} : {
			z: 1,
			x: 0,
			y: 0,
			shake: 0
		};
		const named = FILTERS[state.filter] ?? "none";
		const amount = state.intensity / 100;
		const plain = compare || state.filter === "original" || named === "none" || amount <= 0;
		const drawPhoto = (zoom, ox, oy, filter, alpha = 1) => {
			ctx.save();
			ctx.globalAlpha = alpha;
			ctx.translate(w / 2 + ox * dpr, h / 2 + oy * dpr);
			ctx.rotate(state.rotate * Math.PI / 180);
			ctx.scale(state.flipH ? -1 : 1, state.flipV ? -1 : 1);
			ctx.transform(1, 0, state.perspective / 220, 1, 0, 0);
			const scale = state.size / 100 * zoom;
			ctx.scale(scale, scale);
			ctx.filter = filter;
			const dw = w * .86;
			const dh = dw * (crop.h / crop.w);
			const drawH = Math.min(dh, h * .8);
			ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, -dw / 2, -drawH / 2, dw, drawH);
			ctx.restore();
		};
		if (tool === "depth" && !compare) drawPhoto(1.22, -frame.x * .45, -frame.y * .45, "blur(18px) brightness(70%)");
		if (plain) drawPhoto(frame.z, frame.x, frame.y, compare ? "none" : baseFilter(state));
		else if (amount >= .98) drawPhoto(frame.z, frame.x, frame.y, `${baseFilter(state)} ${named}`);
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
			ctx.fillRect(0, 0, w, h * .62);
			ctx.restore();
		}
		if (!compare && state.shadows > 0) {
			ctx.save();
			ctx.globalCompositeOperation = "multiply";
			ctx.globalAlpha = state.shadows / 220;
			ctx.fillStyle = "#1a120c";
			ctx.fillRect(0, h * .35, w, h * .65);
			ctx.restore();
		}
		if (!compare && state.vignette > 0) {
			const g = ctx.createRadialGradient(w / 2, h / 2, w * .2, w / 2, h / 2, w * .7);
			g.addColorStop(0, "rgba(0,0,0,0)");
			g.addColorStop(1, `rgba(0,0,0,${state.vignette / 140})`);
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, w, h);
		}
		if (!compare && (state.grain > 0 || playing && motion === "Particle")) {
			const specks = state.grain > 0 ? 80 : 36;
			ctx.globalAlpha = state.grain > 0 ? state.grain / 200 : .55;
			for (let i = 0; i < specks; i += 1) {
				ctx.fillStyle = i % 2 ? "#fff" : "#000";
				const px = (i * 97 + progress * 400) % w;
				ctx.fillRect(px, (i * 53 + progress * 220) % h, 2, 2);
			}
			ctx.globalAlpha = 1;
		}
		if (playing && motion === "Glow") {
			const glow = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * .55);
			glow.addColorStop(0, "rgba(46,230,199,0.22)");
			glow.addColorStop(1, "rgba(0,0,0,0)");
			ctx.fillStyle = glow;
			ctx.fillRect(0, 0, w, h);
		}
	}
	paintRef.current = paint;
	function commit(next) {
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
	async function onPhoto(file, extra = 0) {
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
	function onVideo(file) {
		if (!file) return;
		if (!file.type.startsWith("video/")) {
			setError("That file is not a video.");
			return;
		}
		if (file.size > 83886080) {
			setError("That video is too large to preview here. Try one under 80 MB.");
			return;
		}
		setError(null);
		setSrc(null);
		setTool(null);
		setVideoNote(null);
		setTrim({
			start: 0,
			end: 12
		});
		setVideoUrl(URL.createObjectURL(file));
	}
	function previewMotion() {
		setPlaying(true);
		const start = performance.now();
		const fps = useLws.getState().fps;
		let last = 0;
		const loop = (now) => {
			if (now - last < 1e3 / fps) {
				playRef.current = requestAnimationFrame(loop);
				return;
			}
			last = now;
			const p = (now - start) / (duration * 1e3) % 1;
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
	async function save(kind) {
		const canvas = canvasRef.current;
		if (!canvas || !src) {
			setError("Choose a photo before saving.");
			return;
		}
		const id = resumeId ?? `project-${Date.now()}`;
		await saveBlob(id, canvas.toDataURL("image/jpeg", .86));
		upsertProject({
			id,
			name: kind === "live" ? "Live wallpaper" : kind === "animation" ? "Animation" : "Photo",
			kind,
			updated: Date.now(),
			favorite: false
		});
		setNote("Saved to My Creations. Nothing was changed until you chose this.");
		window.setTimeout(() => setNote(null), 1800);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center gap-2 px-3 pt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Back",
					onClick: onBack,
					className: "grid size-11 place-items-center rounded-full bg-surface",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-xl leading-none",
					children: "Create"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Original stays until you pick a tool"
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative mx-3 mt-3 min-h-0 flex-1 overflow-hidden rounded-3xl border border-border bg-surface",
				children: src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
					ref: canvasRef,
					className: "h-full w-full",
					onPointerMove: (event) => {
						if (tool !== "depth") return;
						const rect = event.currentTarget.getBoundingClientRect();
						setLook({
							x: (event.clientX - rect.left) / rect.width * 2 - 1,
							y: (event.clientY - rect.top) / rect.height * 2 - 1
						});
					}
				}) : videoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					ref: videoEl,
					src: videoUrl,
					className: "h-full w-full object-contain",
					controls: true,
					playsInline: true,
					muted,
					loop: loopVideo,
					onLoadedMetadata: (event) => {
						const length = event.currentTarget.duration;
						if (Number.isFinite(length)) setTrim({
							start: 0,
							end: Math.min(12, length)
						});
					},
					onError: () => setError("This video could not be decoded. Try an MP4."),
					onTimeUpdate: (event) => {
						const node = event.currentTarget;
						if (node.currentTime >= trim.end) node.currentTime = trim.start;
						if (node.currentTime < trim.start) node.currentTime = trim.start;
					}
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex h-full flex-col items-center justify-center gap-3 px-6 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-2xl",
							children: "Add a photo or video"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-pretty text-muted",
							children: "Nothing is edited until you tap a tool."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => fileRef.current?.click(),
							className: "h-12 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-fg",
							children: "Choose photo"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => videoRef.current?.click(),
							className: "h-12 rounded-2xl border border-border px-5 text-sm",
							children: "Choose video"
						})
					]
				})
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-4 pt-2 text-center text-sm text-primary",
				children: error
			}) : null,
			note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-4 pt-2 text-center text-sm text-fg",
				children: note
			}) : null,
			src ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "dock max-h-[46%] overflow-y-auto px-3 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => void save("photo"),
						className: "mb-2 h-11 w-full rounded-2xl bg-primary text-sm font-semibold text-primary-fg",
						children: "Save photo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-3 gap-2",
						children: [
							["edit", "Edit"],
							["filter", "Filter"],
							["ai", "AI Transform"],
							["animate", "Animate"],
							["depth", "3D"],
							["live", "Live wallpaper"]
						].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setTool(id);
								setAiNote(null);
								stopMotion();
							},
							className: tool === id ? "h-11 rounded-2xl bg-fg text-xs font-medium text-bg" : "h-11 rounded-2xl bg-surface text-xs text-muted",
							children: label
						}, id))
					}),
					tool === "edit" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
										onClick: () => commit({
											...edit,
											rotate: (edit.rotate + 90) % 360
										}),
										children: "Rotate"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
										onClick: () => commit({
											...edit,
											flipH: !edit.flipH
										}),
										children: "Flip"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
										onClick: () => commit({
											...edit,
											flipV: !edit.flipV
										}),
										children: "Flip down"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex gap-2",
								children: [
									"free",
									"story",
									"square",
									"wide"
								].map((crop) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
									on: edit.crop === crop,
									onClick: () => commit({
										...edit,
										crop
									}),
									children: crop === "story" ? "9:16" : crop === "wide" ? "16:9" : crop === "square" ? "1:1" : "Full"
								}, crop))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								label: "Brightness",
								min: 60,
								max: 160,
								value: edit.brightness,
								onChange: (brightness) => commit({
									...edit,
									brightness
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								label: "Exposure",
								min: -40,
								max: 40,
								value: edit.exposure,
								onChange: (exposure) => commit({
									...edit,
									exposure
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								label: "Contrast",
								min: 60,
								max: 170,
								value: edit.contrast,
								onChange: (contrast) => commit({
									...edit,
									contrast
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								label: "Highlights",
								min: 0,
								max: 100,
								value: edit.highlights,
								onChange: (highlights) => commit({
									...edit,
									highlights
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								label: "Shadows",
								min: 0,
								max: 100,
								value: edit.shadows,
								onChange: (shadows) => commit({
									...edit,
									shadows
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								label: "Saturation",
								min: 0,
								max: 200,
								value: edit.saturate,
								onChange: (saturate) => commit({
									...edit,
									saturate
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								label: "Temperature",
								min: -40,
								max: 40,
								value: edit.temperature,
								onChange: (temperature) => commit({
									...edit,
									temperature
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								label: "Tint",
								min: -40,
								max: 40,
								value: edit.tint,
								onChange: (tint) => commit({
									...edit,
									tint
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								label: "Sharpness",
								min: 0,
								max: 80,
								value: edit.sharpness,
								onChange: (sharpness) => commit({
									...edit,
									sharpness
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								label: "Blur",
								min: 0,
								max: 8,
								value: edit.blur,
								onChange: (blur) => commit({
									...edit,
									blur
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								label: "Vignette",
								min: 0,
								max: 100,
								value: edit.vignette,
								onChange: (vignette) => commit({
									...edit,
									vignette
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								label: "Grain",
								min: 0,
								max: 100,
								value: edit.grain,
								onChange: (grain) => commit({
									...edit,
									grain
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								label: "Perspective",
								min: -40,
								max: 40,
								value: edit.perspective,
								onChange: (perspective) => commit({
									...edit,
									perspective
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								label: "Size",
								min: 70,
								max: 140,
								value: edit.size,
								onChange: (size) => commit({
									...edit,
									size
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
										onClick: undo,
										children: "Undo"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
										onClick: redo,
										children: "Redo"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
										onClick: () => commit(NEUTRAL),
										children: "Reset"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
										onClick: () => setCompare(true),
										onUp: () => setCompare(false),
										children: "Before"
									})
								]
							})
						]
					}) : null,
					tool === "filter" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "no-scrollbar flex gap-2 overflow-x-auto pb-2",
								children: Object.keys(FILTERS).map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => commit({
										...edit,
										filter: name
									}),
									className: edit.filter === name ? "h-11 shrink-0 rounded-full bg-fg px-3 text-xs font-medium text-bg" : "h-11 shrink-0 rounded-full bg-surface px-3 text-xs capitalize text-muted",
									children: name
								}, name))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								label: "Intensity",
								min: 0,
								max: 100,
								value: edit.intensity,
								onChange: (intensity) => commit({
									...edit,
									intensity
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
									onClick: () => setCompare(true),
									onUp: () => setCompare(false),
									children: "Before"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
									onClick: () => commit({
										...edit,
										filter: "original",
										intensity: 100
									}),
									children: "Reset"
								})]
							})
						]
					}) : null,
					tool === "ai" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 rounded-2xl border border-border bg-surface p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: "Online AI processing required"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-pretty text-muted",
								children: "No AI service is connected, so this photo was not transformed. These styles are not applied."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 flex flex-wrap gap-2",
								children: [
									"Cartoon",
									"Anime",
									"3D",
									"Comic",
									"Sketch",
									"Cyberpunk",
									"Fantasy",
									"Cute",
									"Pixel"
								].map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setAiNote(`${name}: online AI processing required. Nothing was changed.`),
									className: "h-11 rounded-full border border-border px-3 text-xs",
									children: name
								}, name))
							}),
							aiNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-primary",
								children: aiNote
							}) : null
						]
					}) : null,
					tool === "animate" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "no-scrollbar flex gap-2 overflow-x-auto",
								children: MOTIONS.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => {
										setMotion(name);
										stopMotion();
									},
									className: motion === name ? "h-11 shrink-0 rounded-full bg-fg px-3 text-xs font-medium text-bg" : "h-11 shrink-0 rounded-full bg-surface px-3 text-xs text-muted",
									children: name
								}, name))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								label: "Duration",
								min: 2,
								max: 12,
								value: duration,
								onChange: setDuration
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: playing ? stopMotion : previewMotion,
									className: "flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-surface text-sm",
									children: [playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), playing ? "Pause" : "Preview animation"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => void save("animation"),
									className: "h-11 flex-1 rounded-2xl bg-primary text-sm font-semibold text-primary-fg",
									children: "Save animation"
								})]
							})
						]
					}) : null,
					tool === "depth" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Drag the photo. Foreground shifts over a soft copy."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
							label: "Depth",
							min: 0,
							max: 100,
							value: Math.round(depth * 100),
							onChange: (value) => setDepth(value / 100)
						})]
					}) : null,
					tool === "live" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-pretty text-muted",
								children: [
									"Duration ",
									duration,
									"s, loop on, motion ",
									motion,
									". Preview it under Animate first. This saves a still for your phone wallpaper picker. It does not install an Android live wallpaper service."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								label: "Duration",
								min: 2,
								max: 12,
								value: duration,
								onChange: setDuration
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: playing ? stopMotion : previewMotion,
								className: "mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-surface text-sm",
								children: [playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), playing ? "Pause" : "Preview live motion"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => void save("live"),
								className: "mt-2 h-12 w-full rounded-2xl bg-primary text-sm font-semibold text-primary-fg",
								children: "Save live wallpaper"
							})
						]
					}) : null,
					tool === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "Pick Edit, Filter, Animate, 3D, or Live. AI stays offline until a service is connected."
					}) : null
				]
			}) : null,
			videoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2 px-3 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-pretty text-muted",
						children: "Playback starts only when you press play. Trim keeps the player inside the range. A system live wallpaper still has to be set from the phone wallpaper picker."
					}),
					videoNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-primary",
						children: videoNote
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
							on: muted,
							onClick: () => setMuted((value) => !value),
							children: muted ? "Muted" : "Sound on"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
							on: loopVideo,
							onClick: () => setLoopVideo((value) => !value),
							children: loopVideo ? "Loop on" : "Loop off"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						label: "Start",
						min: 0,
						max: Math.max(1, Math.floor(trim.end)),
						value: trim.start,
						onChange: (start) => setTrim((value) => ({
							...value,
							start: Math.min(start, value.end - .2)
						}))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						label: "End",
						min: 1,
						max: 60,
						value: Math.round(trim.end),
						onChange: (end) => setTrim((value) => ({
							...value,
							end: Math.max(end, value.start + .2)
						}))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							const node = videoEl.current;
							if (node) node.currentTime = trim.start;
							setVideoNote("Trim is ready in the player. This preview cannot install a live wallpaper service.");
						},
						className: "h-11 w-full rounded-2xl bg-surface text-sm",
						children: "Apply trim"
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: fileRef,
				type: "file",
				accept: "image/*",
				multiple: true,
				className: "hidden",
				onChange: (event) => {
					const files = event.target.files;
					onPhoto(files?.[0], Math.max(0, (files?.length ?? 1) - 1));
					event.target.value = "";
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: videoRef,
				type: "file",
				accept: "video/*",
				className: "hidden",
				onChange: (event) => {
					onVideo(event.target.files?.[0]);
					event.target.value = "";
				}
			})
		]
	});
}
function Mini({ children, onClick, onUp, on }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		onPointerUp: onUp,
		onPointerLeave: onUp,
		className: on ? "h-11 flex-1 rounded-xl bg-fg text-xs font-medium text-bg" : "h-11 flex-1 rounded-xl bg-surface text-xs",
		children
	});
}
function Slider({ label, min, max, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "text-xs text-muted",
			children: [
				label,
				" ",
				value
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			className: "pose-range",
			type: "range",
			min,
			max,
			value,
			"aria-label": label,
			onChange: (event) => onChange(Number(event.target.value))
		})]
	});
}
var FEATURED = CATEGORIES.map((category) => `${category.id}-01`);
function StudioApp() {
	const theme = useLws((s) => s.theme);
	const [stack, setStack] = (0, import_react.useState)([{ name: "splash" }]);
	const screen = stack[stack.length - 1] ?? { name: "home" };
	(0, import_react.useEffect)(() => {
		useLws.persist.rehydrate();
	}, []);
	(0, import_react.useEffect)(() => {
		const root = document.documentElement;
		const mode = theme === "auto" ? window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark" : theme;
		root.dataset.theme = mode;
	}, [theme]);
	(0, import_react.useEffect)(() => {
		if (screen.name !== "splash") return;
		const id = window.setTimeout(() => setStack([{ name: "home" }]), 2600);
		return () => window.clearTimeout(id);
	}, [screen.name]);
	const push = (next) => setStack((items) => [...items, next]);
	const pop = () => setStack((items) => items.length > 1 ? items.slice(0, -1) : [{ name: "home" }]);
	const go = (next) => setStack([next]);
	const showNav = screen.name === "home" || screen.name === "categories" || screen.name === "create" || screen.name === "creations";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-dvh bg-stage text-fg md:grid md:place-items-center md:py-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "safe-top relative mx-auto flex h-dvh w-full max-w-[440px] flex-col overflow-hidden bg-bg md:h-[min(880px,calc(100dvh-3rem))] md:rounded-3xl md:border md:border-border",
			children: [
				screen.name === "splash" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Splash, { onSkip: () => setStack([{ name: "home" }]) }) : null,
				screen.name === "home" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeScreen, { open: push }) : null,
				screen.name === "categories" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoriesScreen, { open: push }) : null,
				screen.name === "category" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryScreen, {
					id: screen.id,
					back: pop,
					open: push
				}) : null,
				screen.name === "preview" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewScreen, {
					id: screen.id,
					back: pop
				}) : null,
				screen.name === "search" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchScreen, {
					back: pop,
					open: push
				}) : null,
				screen.name === "settings" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsScreen, { back: pop }) : null,
				screen.name === "create" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateStudio, {
					onBack: pop,
					resumeId: screen.projectId
				}) : null,
				screen.name === "creations" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreationsScreen, { open: push }) : null,
				showNav ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "dock grid grid-cols-4 border-t border-border bg-bg/90 backdrop-blur-xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavButton, {
							label: "Home",
							on: screen.name === "home",
							onClick: () => go({ name: "home" }),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavButton, {
							label: "Create",
							on: screen.name === "create",
							emphasize: true,
							onClick: () => go({ name: "create" }),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavButton, {
							label: "Characters",
							on: screen.name === "categories",
							onClick: () => go({ name: "categories" }),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavButton, {
							label: "Creations",
							on: screen.name === "creations",
							onClick: () => go({ name: "creations" }),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderHeart, { className: "size-5" })
						})
					]
				}) : null
			]
		})
	});
}
function Splash({ onSkip }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onSkip,
		className: "relative flex flex-1 flex-col items-center justify-center overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "splash-orb" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "splash-bits",
				"aria-hidden": "true",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "splash-mark grid size-24 place-items-center rounded-3xl border border-fg/15 bg-surface/80",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-10 text-primary" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display mt-6 text-center text-3xl leading-none tracking-tight",
				children: "Live Wallpaper Studio"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "Original anime characters. Live when you play."
			})
		]
	});
}
function HomeScreen({ open }) {
	const [slide, setSlide] = (0, import_react.useState)(0);
	const favorites = useLws((s) => s.favorites);
	const toggleFavorite = useLws((s) => s.toggleFavorite);
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => setSlide((value) => (value + 1) % FEATURED.length), 4200);
		return () => window.clearInterval(id);
	}, []);
	const featured = wallpaperById(FEATURED[slide] ?? FEATURED[0]) ?? WALLPAPERS[0];
	const heroes = CATEGORIES.map((category) => byCategory(category.id)[0]).filter((item) => Boolean(item));
	const scenes = WALLPAPERS.filter((item) => !item.id.endsWith("-01"));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-0 flex-1 overflow-y-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center gap-3 px-4 pt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-11 place-items-center rounded-2xl bg-surface",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-5 text-primary" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-xl leading-none",
							children: "Live Wallpaper Studio"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [WALLPAPERS.length, " anime live walls"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
						label: "Search",
						onClick: () => open({ name: "search" }),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
						label: "Settings",
						onClick: () => open({ name: "settings" }),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-5" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-4 mt-4 overflow-hidden rounded-3xl border border-border",
				onPointerDown: (event) => {
					const start = event.clientX;
					const el = event.currentTarget;
					el.setPointerCapture(event.pointerId);
					const move = (ev) => {
						if (start - ev.clientX > 40) setSlide((value) => (value + 1) % FEATURED.length);
						else if (ev.clientX - start > 40) setSlide((value) => (value + FEATURED.length - 1) % FEATURED.length);
						el.removeEventListener("pointerup", move);
					};
					el.addEventListener("pointerup", move);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "banner-pan relative h-52",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WallpaperPoster, {
							item: featured,
							className: "absolute inset-0 h-full w-full"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute inset-x-0 bottom-0 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs tracking-wide text-fg/80 uppercase",
									children: featured.character
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-2xl leading-none",
									children: featured.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => open({ name: "create" }),
									className: "mt-3 h-11 rounded-full bg-primary px-4 text-sm font-semibold text-primary-fg",
									children: "Create now"
								})
							]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Characters",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rail, { children: heroes.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WallCard, {
					id: item.id,
					liked: favorites.includes(item.id),
					onLike: () => toggleFavorite(item.id),
					onOpen: () => open({
						name: "preview",
						id: item.id
					}),
					live: true
				}, item.id)) })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "More scenes",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rail, { children: scenes.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WallCard, {
					id: item.id,
					liked: favorites.includes(item.id),
					onLike: () => toggleFavorite(item.id),
					onOpen: () => open({
						name: "preview",
						id: item.id
					}),
					live: true
				}, item.id)) })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => open({ name: "categories" }),
				className: "mx-4 mb-4 flex h-24 w-[calc(100%-2rem)] flex-col items-start justify-center rounded-3xl border border-border bg-surface px-5 text-left",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-3xl leading-none",
					children: "Characters"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-1 text-sm text-muted",
					children: "Aoi, Ren, Hana, and the rest"
				})]
			})
		]
	});
}
function CategoriesScreen({ open }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-0 flex-1 overflow-y-auto px-4 pt-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-3xl leading-none",
			children: "Characters"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 grid grid-cols-2 gap-3 md:grid-cols-3",
			children: CATEGORIES.map((category) => {
				const cover = byCategory(category.id)[0];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => open({
						name: "category",
						id: category.id
					}),
					className: "relative h-40 overflow-hidden rounded-3xl border border-border text-left",
					children: [cover ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WallpaperPoster, {
						item: cover,
						className: "absolute inset-0 h-full w-full"
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg to-transparent p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-display text-lg leading-none",
							children: category.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block text-xs text-muted",
							children: category.blurb
						})]
					})]
				}, category.id);
			})
		})]
	});
}
function CategoryScreen({ id, back, open }) {
	const category = CATEGORIES.find((item) => item.id === id) ?? CATEGORIES[0];
	const items = byCategory(id);
	const [count, setCount] = (0, import_react.useState)(6);
	const favorites = useLws((s) => s.favorites);
	const toggleFavorite = useLws((s) => s.toggleFavorite);
	const visible = items.slice(0, count);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-center gap-2 px-3 pt-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
				label: "Back",
				onClick: back,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-5" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-2xl leading-none",
				children: category.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [items.length, " live walls"]
			})] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "min-h-0 flex-1 overflow-y-auto px-4 py-3",
			onScroll: (event) => {
				const el = event.currentTarget;
				if (el.scrollTop + el.clientHeight > el.scrollHeight - 80) setCount((value) => Math.min(items.length, value + 4));
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3",
				children: visible.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative h-56 overflow-hidden rounded-3xl border border-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => open({
							name: "preview",
							id: item.id
						}),
						className: "absolute inset-0 text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WallpaperPoster, {
							item,
							className: "absolute inset-0 h-full w-full"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg to-transparent p-3 font-display text-lg leading-none",
							children: item.title
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": favorites.includes(item.id) ? "Unfavorite" : "Favorite",
						onClick: () => toggleFavorite(item.id),
						className: "absolute top-2 right-2 grid size-11 place-items-center rounded-full bg-bg/70",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: favorites.includes(item.id) ? "size-5 fill-primary text-primary" : "size-5" })
					})]
				}, item.id))
			})
		})]
	});
}
function PreviewScreen({ id, back }) {
	const item = wallpaperById(id);
	const favorites = useLws((s) => s.favorites);
	const toggleFavorite = useLws((s) => s.toggleFavorite);
	const setWallpaperTarget = useLws((s) => s.setWallpaperTarget);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [sheet, setSheet] = (0, import_react.useState)(false);
	const [note, setNote] = (0, import_react.useState)(null);
	if (!item) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-1 flex-col items-center justify-center px-6 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-2xl",
			children: "That wallpaper is missing"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: back,
			className: "mt-4 h-11 rounded-full bg-surface px-4 text-sm",
			children: "Back"
		})]
	});
	async function saveStill() {
		const canvas = document.querySelector("[data-preview] canvas");
		if (!canvas) return;
		const link = document.createElement("a");
		link.href = canvas.toDataURL("image/jpeg", .9);
		link.download = `${item?.id ?? "wallpaper"}.jpg`;
		link.click();
		setNote("Image saved. Set it from your phone's wallpaper picker.");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-0 flex-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-preview": true,
				className: "absolute inset-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WallpaperPoster, {
					item,
					playing,
					className: "h-full w-full"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-0 flex flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-3 pt-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
							label: "Back",
							onClick: back,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-full bg-bg/60 px-3 py-2 text-sm backdrop-blur-md",
							children: item.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
							label: favorites.includes(item.id) ? "Unfavorite" : "Favorite",
							onClick: () => toggleFavorite(item.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: favorites.includes(item.id) ? "size-5 fill-primary text-primary" : "size-5" })
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-auto px-3 pb-4",
					children: [
						note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-2 rounded-2xl bg-fg px-3 py-2 text-sm text-bg",
							children: note
						}) : null,
						item.animated ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setPlaying((value) => !value),
							className: "mb-2 flex h-11 items-center gap-2 rounded-full bg-bg/70 px-4 text-sm backdrop-blur-md",
							children: [
								playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }),
								playing ? "Pause" : "Play",
								" · ",
								item.animated ? "loop" : "still"
							]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
									label: "Save image",
									onClick: () => void saveStill(),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
									label: "Share",
									onClick: () => {
										const text = `${item.title} — Live Wallpaper Studio`;
										if (navigator.share) navigator.share({
											title: item.title,
											text
										}).catch(() => setNote(text));
										else setNote(text);
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setSheet(true),
									className: "h-12 flex-1 rounded-2xl bg-primary text-sm font-semibold text-primary-fg",
									children: "Set wallpaper"
								})
							]
						})
					]
				})]
			}),
			sheet ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-x-0 bottom-0 rounded-t-3xl border border-border bg-bg/95 p-4 backdrop-blur-xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xl",
						children: "Set wallpaper"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-pretty text-muted",
						children: "This preview cannot change the Android system wallpaper. Your choice is saved, and the image downloads so the phone wallpaper picker can use it."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid gap-2",
						children: [[
							["home", "Home screen"],
							["lock", "Lock screen"],
							["both", "Home + lock screen"]
						].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setWallpaperTarget(id);
								saveStill();
								setSheet(false);
							},
							className: "h-12 rounded-2xl bg-surface text-sm",
							children: label
						}, id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setSheet(false),
							className: "h-11 text-sm text-muted",
							children: "Cancel"
						})]
					})
				]
			}) : null
		]
	});
}
function SearchScreen({ back, open }) {
	const [query, setQuery] = (0, import_react.useState)("");
	const results = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		if (!q) return WALLPAPERS.slice(0, 12);
		return WALLPAPERS.filter((item) => `${item.title} ${item.character} ${item.category}`.toLowerCase().includes(q));
	}, [query]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col px-4 pt-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
				label: "Back",
				onClick: back,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-5" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: query,
				onChange: (event) => setQuery(event.target.value),
				placeholder: "Aoi, rain, shrine...",
				className: "h-12 flex-1 rounded-2xl border border-border bg-surface px-3 text-sm text-fg"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 min-h-0 flex-1 overflow-y-auto",
			children: [results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "pt-10 text-center text-sm text-muted",
				children: "Nothing matches that."
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3",
				children: results.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => open({
						name: "preview",
						id: item.id
					}),
					className: "relative h-48 overflow-hidden rounded-3xl border border-border text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WallpaperPoster, {
						item,
						className: "absolute inset-0 h-full w-full"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg to-transparent p-3 text-sm",
						children: item.title
					})]
				}, item.id))
			})]
		})]
	});
}
function SettingsScreen({ back }) {
	const theme = useLws((s) => s.theme);
	const quality = useLws((s) => s.quality);
	const fps = useLws((s) => s.fps);
	const notifications = useLws((s) => s.notifications);
	const setTheme = useLws((s) => s.setTheme);
	const setQuality = useLws((s) => s.setQuality);
	const setFps = useLws((s) => s.setFps);
	const setNotifications = useLws((s) => s.setNotifications);
	const clearLocal = useLws((s) => s.clearLocal);
	const [note, setNote] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-0 flex-1 overflow-y-auto px-4 pt-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
				label: "Back",
				onClick: back,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-5" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-2xl",
				children: "Settings"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
					label: "Theme",
					value: theme,
					options: [
						"dark",
						"light",
						"auto"
					],
					onChange: setTheme
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
					label: "Wallpaper quality",
					value: quality,
					options: ["standard", "high"],
					onChange: setQuality
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
					label: "FPS",
					value: String(fps),
					options: [
						"24",
						"30",
						"60"
					],
					onChange: (value) => setFps(Number(value))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setNotifications(!notifications),
					className: "flex h-14 w-full items-center justify-between rounded-2xl bg-surface px-4 text-sm",
					children: ["Notifications", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted",
						children: notifications ? "On" : "Off"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						clearBlobs();
						clearLocal();
						setNote("Cache cleared.");
					},
					className: "h-14 w-full rounded-2xl bg-surface text-sm",
					children: "Clear cache"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-2xl bg-surface p-4 text-sm text-pretty text-muted",
					children: "Battery: animated previews run only after you press play. Downloads stay on this device. Privacy: photos you edit stay in this browser until you clear cache. About: Live Wallpaper Studio 1.0.0. System live wallpaper needs Android's own wallpaper picker."
				}),
				note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm",
					children: note
				}) : null
			]
		})]
	});
}
function CreationsScreen({ open }) {
	const projects = useLws((s) => s.projects);
	const renameProject = useLws((s) => s.renameProject);
	const removeProject = useLws((s) => s.removeProject);
	const toggleProjectFavorite = useLws((s) => s.toggleProjectFavorite);
	const [folder, setFolder] = (0, import_react.useState)("all");
	const [note, setNote] = (0, import_react.useState)(null);
	const shown = projects.filter((item) => {
		if (folder === "all") return true;
		if (folder === "favorites") return item.favorite;
		return item.kind === folder;
	});
	async function shareProject(name) {
		const text = `${name} — Live Wallpaper Studio`;
		if (navigator.share) try {
			await navigator.share({
				title: name,
				text
			});
			return;
		} catch {
			setNote(text);
			return;
		}
		setNote(text);
	}
	async function downloadProject(id, name) {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col px-4 pt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-3xl leading-none",
				children: "My creations"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "no-scrollbar mt-3 flex gap-2 overflow-x-auto",
				children: [
					"all",
					"photo",
					"animation",
					"live",
					"favorites"
				].map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setFolder(id),
					className: folder === id ? "h-11 shrink-0 rounded-full bg-fg px-3 text-xs font-medium text-bg capitalize" : "h-11 shrink-0 rounded-full bg-surface px-3 text-xs text-muted capitalize",
					children: id
				}, id))
			}),
			note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: note
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 min-h-0 flex-1 overflow-y-auto",
				children: shown.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-4 pt-16 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl",
						children: "Nothing saved yet"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Create a photo, animation, or live wallpaper first."
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2 pb-3",
					children: shown.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-surface p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: item.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted capitalize",
								children: item.kind
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": item.favorite ? "Unfavorite" : "Favorite",
								onClick: () => toggleProjectFavorite(item.id),
								className: "grid size-11 place-items-center rounded-full bg-bg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: item.favorite ? "size-5 fill-primary text-primary" : "size-5" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 grid grid-cols-2 gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => open({
										name: "create",
										projectId: item.id
									}),
									className: "h-10 rounded-xl bg-bg text-xs",
									children: "Edit again"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => {
										const name = window.prompt("Rename", item.name);
										if (name) renameProject(item.id, name);
									},
									className: "h-10 rounded-xl bg-bg text-xs",
									children: "Rename"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => void shareProject(item.name),
									className: "h-10 rounded-xl bg-bg text-xs",
									children: "Share"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => void downloadProject(item.id, item.name),
									className: "h-10 rounded-xl bg-bg text-xs",
									children: "Set wallpaper"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => removeProject(item.id),
									className: "col-span-2 h-10 rounded-xl bg-bg text-xs",
									children: "Delete"
								})
							]
						})]
					}, item.id))
				})
			})
		]
	});
}
function WallCard({ id, liked, onLike, onOpen, live }) {
	const item = wallpaperById(id);
	if (!item) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-64 w-40 shrink-0 overflow-hidden rounded-3xl border border-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onOpen,
				className: "absolute inset-0 text-left",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WallpaperPoster, {
						item,
						className: "absolute inset-0 h-full w-full"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg via-bg/70 to-transparent p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-xs text-muted uppercase",
							children: item.character
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-lg leading-none",
							children: item.title
						})]
					}),
					live ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "absolute top-3 left-3 size-5" }) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Save image",
				onClick: () => downloadWallpaper(item),
				className: live ? "absolute top-14 left-3 grid size-11 place-items-center rounded-full bg-bg/70" : "absolute top-3 left-3 grid size-11 place-items-center rounded-full bg-bg/70",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": liked ? "Unfavorite" : "Favorite",
				onClick: onLike,
				className: "absolute top-2 right-2 grid size-11 place-items-center rounded-full bg-bg/70",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: liked ? "size-5 fill-primary text-primary" : "size-5" })
			})
		]
	});
}
function Section({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "px-4 font-display text-xl leading-none",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3",
			children
		})]
	});
}
function Rail({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1",
		children
	});
}
function IconButton({ label, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		onClick,
		className: "grid size-11 place-items-center rounded-full bg-bg/70 text-fg backdrop-blur-md",
		children
	});
}
function NavButton({ label, on, emphasize, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: on ? "flex h-16 flex-col items-center justify-center gap-1 text-xs text-primary" : "flex h-16 flex-col items-center justify-center gap-1 text-xs text-muted",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: emphasize ? "grid size-9 place-items-center rounded-full bg-primary text-primary-fg" : "",
			children
		}), label]
	});
}
function Choice({ label, value, options, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl bg-surface p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 flex gap-2",
			children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => onChange(option),
				className: option === value ? "h-11 flex-1 rounded-xl bg-fg text-xs font-medium text-bg capitalize" : "h-11 flex-1 rounded-xl text-xs text-muted capitalize",
				children: option
			}, option))
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudioApp, {});
}
//#endregion
export { Home as component };
