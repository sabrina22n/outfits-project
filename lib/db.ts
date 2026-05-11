import { openDB, DBSchema, IDBPDatabase } from "idb";

export type ClothingCategory =
  | "top"
  | "bottom"
  | "short"
  | "skirt"
  | "jersey"
  | "dress"
  | "shoes"
  | "jacket"
  | "accessory";

export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  imageDataUrl: string;
  createdAt: number;
}

export interface OutfitItem {
  clothingId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export interface Outfit {
  id: string;
  name: string;
  items: OutfitItem[];
  previewDataUrl?: string;
  dayId?: string;
  createdAt: number;
}

export interface TravelDay {
  id: string;
  label: string;
  date?: string;
  outfitId?: string;
  order: number;
}

interface OutfitDB extends DBSchema {
  clothing: {
    key: string;
    value: ClothingItem;
    indexes: { category: ClothingCategory };
  };
  outfits: {
    key: string;
    value: Outfit;
  };
  days: {
    key: string;
    value: TravelDay;
    indexes: { order: number };
  };
}

let dbPromise: Promise<IDBPDatabase<OutfitDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<OutfitDB>("travel-outfits-db", 1, {
      upgrade(db) {
        const clothingStore = db.createObjectStore("clothing", {
          keyPath: "id",
        });
        clothingStore.createIndex("category", "category");

        db.createObjectStore("outfits", { keyPath: "id" });

        const daysStore = db.createObjectStore("days", { keyPath: "id" });
        daysStore.createIndex("order", "order");
      },
    });
  }
  return dbPromise;
}

export async function getAllClothing(): Promise<ClothingItem[]> {
  const db = await getDB();
  return db.getAll("clothing");
}

export async function addClothingItem(item: ClothingItem): Promise<void> {
  const db = await getDB();
  await db.put("clothing", item);
}

export async function deleteClothingItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("clothing", id);
}

export async function getAllOutfits(): Promise<Outfit[]> {
  const db = await getDB();
  return db.getAll("outfits");
}

export async function saveOutfit(outfit: Outfit): Promise<void> {
  const db = await getDB();
  await db.put("outfits", outfit);
}

export async function deleteOutfit(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("outfits", id);
}

export async function getAllDays(): Promise<TravelDay[]> {
  const db = await getDB();
  const days = await db.getAll("days");
  return days.sort((a, b) => a.order - b.order);
}

export async function saveDay(day: TravelDay): Promise<void> {
  const db = await getDB();
  await db.put("days", day);
}

export async function deleteDay(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("days", id);
}
