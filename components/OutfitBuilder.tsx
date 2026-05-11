"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Save, RotateCcw, Trash2, Plus, X, GripVertical, Eye } from "lucide-react";
import type { ClothingItem, Outfit, OutfitItem } from "@/lib/db";
import { saveOutfit, removeOutfit } from "@/app/actions/outfits";
import MannequinView from "./MannequinView";

async function fetchClothing(): Promise<ClothingItem[]> {
  return fetch("/api/clothing").then((r) => r.json());
}
async function fetchOutfits(): Promise<Outfit[]> {
  return fetch("/api/outfits").then((r) => r.json());
}

interface CanvasItem extends OutfitItem {
  clothingItem: ClothingItem;
}

interface DragState {
  id: string;
  startX: number;
  startY: number;
  itemStartX: number;
  itemStartY: number;
  type: "move" | "resize";
  resizeHandle?: string;
}

export default function OutfitBuilder() {
  const [clothing, setClothing] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [outfitName, setOutfitName] = useState("Mi outfit");
  const [showClothingPanel, setShowClothingPanel] = useState(false);
  const [editingOutfitId, setEditingOutfitId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showMannequin, setShowMannequin] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);

  useEffect(() => {
    Promise.all([fetchClothing(), fetchOutfits()]).then(([c, o]) => {
      setClothing(c);
      setOutfits(o);
    });
  }, []);

  const addToCanvas = (item: ClothingItem) => {
    const newItem: CanvasItem = {
      clothingId: item.id,
      clothingItem: item,
      x: 40 + Math.random() * 100,
      y: 40 + Math.random() * 80,
      width: 160,
      height: 160,
      zIndex: canvasItems.length + 1,
    };
    setCanvasItems((prev) => [...prev, newItem]);
    setShowClothingPanel(false);
  };

  const removeFromCanvas = (clothingId: string) => {
    setCanvasItems((prev) => prev.filter((i) => i.clothingId !== clothingId));
    if (selectedId === clothingId) setSelectedId(null);
  };

  const clearCanvas = () => {
    setCanvasItems([]);
    setSelectedId(null);
    setEditingOutfitId(null);
    setOutfitName("Mi outfit");
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, id: string, type: "move" | "resize", handle?: string) => {
      e.preventDefault();
      e.stopPropagation();
      const item = canvasItems.find((i) => i.clothingId === id);
      if (!item) return;
      setSelectedId(id);
      setCanvasItems((prev) =>
        prev.map((ci) =>
          ci.clothingId === id
            ? { ...ci, zIndex: Math.max(...prev.map((p) => p.zIndex)) + 1 }
            : ci
        )
      );
      dragRef.current = {
        id,
        startX: e.clientX,
        startY: e.clientY,
        itemStartX: item.x,
        itemStartY: item.y,
        type,
        resizeHandle: handle,
      };
    },
    [canvasItems]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const { id, startX, startY, itemStartX, itemStartY, type } = dragRef.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      setCanvasItems((prev) =>
        prev.map((item) => {
          if (item.clothingId !== id) return item;
          if (type === "move") {
            return { ...item, x: itemStartX + dx, y: itemStartY + dy };
          }
          return {
            ...item,
            width: Math.max(60, item.width + dx),
            height: Math.max(60, item.height + dy),
          };
        })
      );
    };
    const handleMouseUp = () => {
      dragRef.current = null;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleSaveOutfit = async () => {
    if (canvasItems.length === 0) return;
    setSaving(true);
    const outfit: Outfit = {
      id: editingOutfitId ?? crypto.randomUUID(),
      name: outfitName,
      items: canvasItems.map(({ clothingItem: _ci, ...rest }) => rest),
      createdAt: Date.now(),
    };
    await saveOutfit(outfit);
    setOutfits(await fetchOutfits());
    setEditingOutfitId(outfit.id);
    setSaving(false);
  };

  const loadOutfit = async (outfit: Outfit) => {
    const all = await fetchClothing();
    const clothingMap = Object.fromEntries(all.map((c) => [c.id, c]));
    const items: CanvasItem[] = outfit.items
      .map((item) => {
        const ci = clothingMap[item.clothingId];
        if (!ci) return null;
        return { ...item, clothingItem: ci };
      })
      .filter(Boolean) as CanvasItem[];
    setCanvasItems(items);
    setOutfitName(outfit.name);
    setEditingOutfitId(outfit.id);
    setSelectedId(null);
  };

  const handleDeleteOutfit = async (id: string) => {
    await removeOutfit(id);
    setOutfits(await fetchOutfits());
    if (editingOutfitId === id) clearCanvas();
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-140px)] min-h-[500px]">
      {/* Saved outfits sidebar */}
      <div className="w-44 flex-shrink-0 flex flex-col gap-2">
        <p className="text-[10px] font-medium text-[#9B9390] uppercase tracking-widest px-1">
          Mis outfits
        </p>
        <button
          onClick={clearCanvas}
          className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-[#C8C0B0] text-xs text-[#9B9390] hover:border-[#111] hover:text-[#111] transition-colors"
        >
          <Plus size={13} />
          Nuevo outfit
        </button>
        <div className="overflow-y-auto space-y-1.5 flex-1 scrollbar-hide">
          {outfits.map((o) => (
            <div
              key={o.id}
              className={`group relative overflow-hidden cursor-pointer border-2 transition-all ${
                editingOutfitId === o.id
                  ? "border-[#111]"
                  : "border-transparent hover:border-[#C8C0B0]"
              }`}
              onClick={() => loadOutfit(o)}
            >
              <div className="bg-white p-2">
                <p className="text-xs font-medium text-[#111] truncate pr-5">
                  {o.name}
                </p>
                <p className="text-xs text-[#9B9390]">
                  {o.items.length} prenda{o.items.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteOutfit(o.id);
                }}
                className="absolute top-1.5 right-1.5 p-1 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity text-[#9B9390] hover:text-red-500"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={outfitName}
            onChange={(e) => setOutfitName(e.target.value)}
            className="flex-1 border border-[#D4CEC6] px-3 py-2 text-sm font-medium focus:outline-none focus:border-[#111] bg-white"
          />
          <button
            onClick={() => setShowClothingPanel(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#D4CEC6] text-[#6B6560] text-sm hover:border-[#111] hover:text-[#111] transition-colors"
          >
            <Plus size={14} />
            Prenda
          </button>
          <button
            onClick={() => setShowMannequin(true)}
            disabled={canvasItems.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#D4CEC6] text-[#6B6560] text-sm hover:border-[#111] hover:text-[#111] disabled:opacity-40 transition-colors"
            title="Ver en maniquí"
          >
            <Eye size={14} />
            Ver
          </button>
          <button
            onClick={clearCanvas}
            className="p-2 text-[#9B9390] hover:text-[#111] transition-colors"
            title="Limpiar canvas"
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={handleSaveOutfit}
            disabled={canvasItems.length === 0 || saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#111] text-white text-sm font-medium hover:bg-[#333] disabled:opacity-40 transition-colors"
          >
            <Save size={14} />
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 relative bg-white border-2 border-dashed border-[#C8C0B0] overflow-hidden"
          onClick={() => setSelectedId(null)}
        >
          {canvasItems.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#C8C0B0] pointer-events-none">
              <div className="text-5xl mb-3">👗</div>
              <p className="text-sm tracking-wide">Añadí prendas para armar tu outfit</p>
            </div>
          )}

          {canvasItems.map((item) => {
            const isSelected = selectedId === item.clothingId;
            return (
              <div
                key={item.clothingId}
                className={`absolute select-none group ${
                  isSelected ? "ring-2 ring-stone-800 ring-offset-1" : "hover:ring-1 hover:ring-stone-300"
                }`}
                style={{
                  left: item.x,
                  top: item.y,
                  width: item.width,
                  height: item.height,
                  zIndex: item.zIndex,
                  borderRadius: 8,
                  overflow: "hidden",
                }}
                onMouseDown={(e) => handleMouseDown(e, item.clothingId, "move")}
              >
                <img
                  src={item.clothingItem.imageUrl}
                  alt={item.clothingItem.name}
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
                {/* Delete button */}
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => removeFromCanvas(item.clothingId)}
                  className="absolute top-1 right-1 p-1 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-stone-500 hover:text-red-500"
                >
                  <X size={11} />
                </button>
                {/* Resize handle */}
                <div
                  onMouseDown={(e) => handleMouseDown(e, item.clothingId, "resize", "br")}
                  className="absolute bottom-1 right-1 cursor-se-resize text-white/80 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <GripVertical size={12} />
                </div>
                {/* Name label */}
                {isSelected && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1.5 py-0.5 truncate">
                    {item.clothingItem.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showMannequin && (
        <MannequinView
          items={canvasItems.map((ci) => ({
            clothingId: ci.clothingId,
            category: ci.clothingItem.category,
            imageUrl: ci.clothingItem.imageUrl,
            name: ci.clothingItem.name,
          }))}
          outfitName={outfitName}
          onClose={() => setShowMannequin(false)}
        />
      )}

      {/* Clothing picker panel */}
      {showClothingPanel && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white shadow-2xl w-full max-w-md max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#EDE8DF]">
              <h3 className="font-display text-xl text-[#111]">ELEGÍ UNA PRENDA</h3>
              <button
                onClick={() => setShowClothingPanel(false)}
                className="p-1.5 text-[#9B9390] hover:text-[#111] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="overflow-y-auto p-4 grid grid-cols-3 gap-3 scrollbar-hide">
              {clothing.length === 0 ? (
                <div className="col-span-3 text-center py-8 text-[#9B9390] text-sm">
                  No tenés prendas en el guardarropa todavía
                </div>
              ) : (
                clothing
                  .filter((c) => !canvasItems.find((ci) => ci.clothingId === c.id))
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => addToCanvas(item)}
                      className="flex flex-col items-center gap-1.5 p-2 hover:bg-[#F5F0E8] border border-[#EDE8DF] hover:border-[#C8C0B0] transition-all text-left"
                    >
                      <div className="w-full aspect-square bg-[#F5F0E8] overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-xs text-[#6B6560] truncate w-full text-center">
                        {item.name}
                      </span>
                    </button>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
