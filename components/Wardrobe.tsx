"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, Trash2, ChevronDown, Loader2 } from "lucide-react";
import type { ClothingItem, ClothingCategory } from "@/lib/db";
import { addClothing, removeClothing } from "@/app/actions/clothing";
import ClothingItemModal from "@/components/ClothingItemModal";

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

async function fetchClothing(): Promise<ClothingItem[]> {
  const res = await fetch("/api/clothing");
  return res.json();
}

export default function Wardrobe() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [filter, setFilter] = useState<ClothingCategory | "all">("all");
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedClothing, setSelectedClothing] = useState<ClothingItem | null>(null);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<ClothingCategory>("top");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchClothing().then(setItems);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setShowForm(true);
    setProcessing(true);
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(file);
      const processed = new File(
        [blob],
        file.name.replace(/\.[^.]+$/, "") + ".png",
        { type: "image/png" }
      );
      setPendingFile(processed);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch {
      setPendingFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!pendingFile || !newName.trim()) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", pendingFile);
    fd.append("name", newName.trim());
    fd.append("category", newCategory);
    fd.append("id", crypto.randomUUID());
    await addClothing(fd);
    setItems(await fetchClothing());
    setShowForm(false);
    setPendingFile(null);
    setPreviewUrl(null);
    setNewName("");
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    await removeClothing(id);
    setItems(await fetchClothing());
  };

  const filtered =
    filter === "all" ? items : items.filter((i) => i.category === filter);

  const categoryLabel = (cat: ClothingCategory) =>
    CATEGORIES.find((c) => c.value === cat)?.label ?? cat;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 justify-between">
        <div>
          <h2 className="font-display text-3xl sm:text-5xl text-[#111]">GUARDARROPA</h2>
          <p className="text-sm text-[#9B9390] mt-1">
            {items.length} prenda{items.length !== 1 ? "s" : ""} guardada
            {items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#111] text-white text-xs font-medium tracking-widest uppercase hover:bg-[#333] transition-colors self-start sm:self-auto"
        >
          <Upload size={13} />
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
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <h3 className="font-display text-2xl text-[#111]">NUEVA PRENDA</h3>
            {processing ? (
              <div className="w-full h-48 bg-[#FAF8F5] flex flex-col items-center justify-center gap-2">
                <Loader2 size={20} className="text-[#B8A898] animate-spin" />
                <p className="text-xs text-[#9B9390] tracking-wide">Eliminando fondo...</p>
              </div>
            ) : previewUrl ? (
              <div className="relative w-full h-48 bg-[#FAF8F5] p-[10px]">
                <div className="absolute inset-[5px] border border-dashed border-[#C4B5A5] pointer-events-none" />
                <img
                  src={previewUrl}
                  alt="preview"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : null}
            <input
              type="text"
              placeholder="Nombre (ej: Blusa blanca)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full border border-[#D4CEC6] px-3 py-2 text-sm focus:outline-none focus:border-[#111] bg-white"
            />
            <div className="relative">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ClothingCategory)}
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
                onClick={() => {
                  setShowForm(false);
                  setPendingFile(null);
                  setPreviewUrl(null);
                  setNewName("");
                  setProcessing(false);
                }}
                className="flex-1 py-2.5 border border-[#D4CEC6] text-sm text-[#6B6560] hover:border-[#111] hover:text-[#111] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!newName.trim() || uploading || processing}
                className="flex-1 py-2.5 bg-[#111] text-white text-sm font-medium hover:bg-[#333] disabled:opacity-40 transition-colors"
              >
                {uploading ? "Subiendo..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <button
          onClick={() => setFilter("all")}
          className={`flex-shrink-0 px-4 py-1.5 text-xs font-medium tracking-wide uppercase border transition-colors ${
            filter === "all"
              ? "bg-[#111] text-white border-[#111]"
              : "bg-transparent text-[#6B6560] border-[#C8C0B0] hover:border-[#111] hover:text-[#111]"
          }`}
        >
          Todas
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setFilter(c.value)}
            className={`flex-shrink-0 px-4 py-1.5 text-xs font-medium tracking-wide uppercase border transition-colors ${
              filter === c.value
                ? "bg-[#111] text-white border-[#111]"
                : "bg-transparent text-[#6B6560] border-[#C8C0B0] hover:border-[#111] hover:text-[#111]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-[#C8C0B0] cursor-pointer hover:border-[#111] hover:bg-white/30 transition-all"
        >
          <Upload size={28} className="text-[#C8C0B0] mb-3" />
          <p className="text-[#9B9390] text-sm tracking-wide">
            {filter === "all"
              ? "Subí tu primera prenda"
              : "No hay prendas en esta categoría"}
          </p>
        </div>
      ) : (
        <div className="border-2 border-dashed border-[#C8C0B0] p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedClothing(item)}
                className="group relative bg-white overflow-hidden hover:shadow-md transition-all cursor-pointer"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                  className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity text-[#9B9390] hover:text-red-500"
                >
                  <Trash2 size={12} />
                </button>
                <div className="relative aspect-square bg-[#FAF8F5] p-[10px]">
                  <div className="absolute inset-[5px] border border-dashed border-[#C4B5A5] pointer-events-none" />
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-3 border-t border-[#EDE8DF]">
                  <p className="text-[10px] text-[#9B9390] uppercase tracking-wider">
                    {categoryLabel(item.category)}
                  </p>
                  <p className="text-sm font-medium text-[#111] mt-0.5 truncate">
                    {item.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedClothing && (
        <ClothingItemModal
          item={selectedClothing}
          onClose={() => setSelectedClothing(null)}
          onSave={(updated) => {
            setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
            setSelectedClothing(null);
          }}
        />
      )}
    </div>
  );
}
