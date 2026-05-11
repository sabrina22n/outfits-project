export type ClothingCategory =
  | "top"
  | "bottom"
  | "short"
  | "skirt"
  | "jersey"
  | "dress"
  | "jacket"
  | "shoes"
  | "accessory";

export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  imageUrl: string;
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
  createdAt: number;
}

export interface TravelDay {
  id: string;
  label: string;
  date?: string;
  outfitId?: string;
  order: number;
}
