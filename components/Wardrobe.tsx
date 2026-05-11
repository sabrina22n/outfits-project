"use client";

import { useState, useEffect, useRef } from "react";
import {
  Upload,
  Trash2,
  ShirtIcon,
  Footprints,
  Layers,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import {
  ClothingItem,
  ClothingCategory,
  getAllClothing,
  addClothingItem,
  deleteClothingItem,
} from "@/lib/db";

const CATEGORIES: { value: ClothingCategory; label: string; icon: React.ReactNode }[] = [
  { value: "top", label: "Tops", icon: <ShirtIcon size={14} /> },
  { value: "bottom", label: "Pantalones", icon: <Layers size={14} /> },
  { value: "short", label: "Shorts", icon: <Layers size={14} /> },
  { value: "skirt", label: "Polleras", icon: <Sparkles size={14} /> },
  { value: "jersey", label: "Jerseys", icon: <ShirtIcon size={14} /> },
  { value: "dress", label: "Vestidos", icon: <Sparkles size={14} /> },
  { value: "jacket", label: "Chaquetas", icon: <ShirtIcon size={14} /> },
  { value: "shoes", label: "Zapatos", icon: <Footprints size={14} /> },
  { value: "accessory", label: "Accesorios", icon: <Sparkles size={14} /> },
];

function CategoryBadge({ category }: { category: ClothingCategory }) {
  const cat = CATEGORIES.find((c) => c.value === category);
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-stone-100 text-stone-600">
      {cat?.icon}
      {cat?.label}
    </span>
  );
}

export default function Wardrobe() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [filter, setFilter] = useState<ClothingCategory | "all">("all");
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<ClothingCategory>("top");
  const [pendingFile, setPendingFile] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAllClothing().then(setItems);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPendingFile(ev.target?.result as string);
      setShowForm(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!pendingFile || !newName.trim()) return;
    setUploading(true);
    const item: ClothingItem = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      category: newCategory,
      imageDataUrl: pendingFile,
      createdAt: Date.now(),
    };
    await addClothingItem(item);
    setItems(await getAllClothing());
    setShowForm(false);
    setPendingFile(null);
    setNewName("");
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    await deleteClothingItem(id);
    setItems(await getAllClothing());
  };

  const filtered =
    filter === "all" ? items : items.filter((i) => i.category === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-stone-800">Guardarropa</h2>
          <p className="text-sm text-stone-500 mt-0.5">
            {items.length} prenda{items.length !== 1 ? "s" : ""} guardada
            {items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors"
        >
          <Upload size={15} />
          Subir prenda
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Upload modal */}
      {showForm && pendingFile && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-semibold text-stone-800 text-lg">Nueva prenda</h3>
            <img
              src={pendingFile}
              alt="preview"
              className="w-full h-48 object-contain rounded-xl bg-stone-50 border border-stone-100"
            />
            <input
              type="text"
              placeholder="Nombre (ej: Blusa blanca)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
            />
            <div className="relative">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ClothingCategory)}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-stone-300"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowForm(false);
                  setPendingFile(null);
                  setNewName("");
                }}
                className="flex-1 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!newName.trim() || uploading}
                className="flex-1 py-2 rounded-xl bg-stone-800 text-white text-sm font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <button
          onClick={() => setFilter("all")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            filter === "all"
              ? "bg-stone-800 text-white"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          Todas
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setFilter(c.value)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === c.value
                ? "bg-stone-800 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {c.icon}
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-stone-200 rounded-2xl cursor-pointer hover:border-stone-400 hover:bg-stone-50 transition-all"
        >
          <Upload size={32} className="text-stone-300 mb-3" />
          <p className="text-stone-400 text-sm">
            {filter === "all"
              ? "Subí tu primera prenda"
              : "No hay prendas en esta categoría"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-md transition-all"
            >
              <div className="aspect-square bg-stone-50 overflow-hidden">
                <img
                  src={item.imageDataUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-2 space-y-1">
                <p className="text-xs font-medium text-stone-700 truncate">
                  {item.name}
                </p>
                <CategoryBadge category={item.category} />
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 text-stone-400 hover:text-red-500"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
