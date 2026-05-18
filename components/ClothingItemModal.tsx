"use client";

import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import type { ClothingItem, ClothingCategory } from "@/lib/db";
import { updateClothing } from "@/app/actions/clothing";

const CATEGORIES: { value: ClothingCategory; label: string }[] = [
  { value: "top", label: "Tops" },
  { value: "bottom", label: "Pantalones" },
  { value: "short", label: "Shorts" },
  { value: "skirt", label: "Polleras" },
  { value: "jersey", label: "Jerseys" },
  { value: "dress", label: "Vestidos" },
  { value: "jacket", label: "Chaquetas" },
  { value: "shoes", label: "Zapatos" },
  { value: "accessory", label: "Accesorios" },
];

export default function ClothingItemModal({
  item,
  onClose,
  onSave,
}: {
  item: ClothingItem;
  onClose: () => void;
  onSave: (updated: ClothingItem) => void;
}) {
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState<ClothingCategory>(item.category);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    await updateClothing(item.id, trimmed, category);
    onSave({ ...item, name: trimmed, category });
    setSaving(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-sm p-6 space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl text-[#111]">EDITAR PRENDA</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9B9390] hover:text-[#111] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative w-full aspect-square bg-[#FAF8F5] p-[10px]">
          <div className="absolute inset-[5px] border border-dashed border-[#C4B5A5] pointer-events-none" />
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-contain"
          />
        </div>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          className="w-full border border-[#D4CEC6] px-3 py-2 text-sm focus:outline-none focus:border-[#111] bg-white"
          placeholder="Nombre de la prenda"
        />

        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ClothingCategory)}
            className="w-full border border-[#D4CEC6] px-3 py-2 text-sm appearance-none focus:outline-none focus:border-[#111] bg-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9390] pointer-events-none"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-[#D4CEC6] text-sm text-[#6B6560] hover:border-[#111] hover:text-[#111] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="flex-1 py-2.5 bg-[#111] text-white text-sm font-medium hover:bg-[#333] disabled:opacity-40 transition-colors"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
