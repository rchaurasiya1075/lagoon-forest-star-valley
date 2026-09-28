import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useStudio } from "@/lib/studio-store";

export const MOTIONS = ["sway", "look", "float", "spin"] as const;
export type Motion = (typeof MOTIONS)[number];
export const MOTION_LABELS: Record<Motion, string> = {
  sway: "Sway",
  look: "Look",
  float: "Float",
  spin: "Spin",
};

export type CustomMeta = {
  id: string;
  name: string;
  scene: string;
  motion: Motion;
  turn: number;
  lean: number;
  move: number;
  lookX: number;
  lookY: number;
};

const DB_NAME = "lumen-photos";
const STORE = "photos";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePhoto(id: string, dataUrl: string) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(dataUrl, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function deletePhoto(id: string) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadPhotos(): Promise<Record<string, string>> {
  const db = await openDb();
  const rows = await new Promise<Record<string, string>>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const request = store.getAllKeys();
    const values = store.getAll();
    tx.oncomplete = () => {
      const out: Record<string, string> = {};
      const keys = request.result;
      const blobs = values.result as string[];
      keys.forEach((key, index) => {
        out[String(key)] = blobs[index] ?? "";
      });
      resolve(out);
    };
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return rows;
}

export function fileToWallpaper(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const max = 720;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read that photo"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Use a JPG or PNG"));
    };
    img.src = url;
  });
}

type PhotoApi = {
  photos: Record<string, string>;
  remember: (id: string, dataUrl: string) => void;
};

const PhotoContext = createContext<PhotoApi>({ photos: {}, remember: () => {} });

export function PhotoProvider({ children }: { children: ReactNode }) {
  const customs = useStudio((s) => s.customs);
  const [photos, setPhotos] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancel = false;
    void loadPhotos()
      .then((all) => {
        if (!cancel) setPhotos(all);
      })
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, [customs]);

  const remember = (id: string, dataUrl: string) => {
    setPhotos((prev) => ({ ...prev, [id]: dataUrl }));
  };

  return <PhotoContext.Provider value={{ photos, remember }}>{children}</PhotoContext.Provider>;
}

export function usePhotos() {
  return useContext(PhotoContext);
}
