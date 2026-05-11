"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  CalendarDays,
  ChevronDown,
  X,
} from "lucide-react";
import type { Outfit, TravelDay, ClothingItem } from "@/lib/db";
import { upsertDay, removeDay } from "@/app/actions/planner";

async function fetchOutfits(): Promise<Outfit[]> {
  return fetch("/api/outfits").then((r) => r.json());
}
async function fetchDays(): Promise<TravelDay[]> {
  return fetch("/api/days").then((r) => r.json());
}
async function fetchClothing(): Promise<ClothingItem[]> {
  return fetch("/api/clothing").then((r) => r.json());
}

function OutfitPreview({
  outfit,
  clothing,
}: {
  outfit: Outfit;
  clothing: ClothingItem[];
}) {
  const clothingMap = Object.fromEntries(clothing.map((c) => [c.id, c]));
  const previewItems = outfit.items.slice(0, 4);

  return (
    <div className="flex gap-1.5">
      {previewItems.map((item, i) => {
        const ci = clothingMap[item.clothingId];
        if (!ci) return null;
        return (
          <div
            key={i}
            className="w-12 h-12 overflow-hidden bg-[#F5F0E8] flex-shrink-0"
          >
            <img
              src={ci.imageUrl}
              alt={ci.name}
              className="w-full h-full object-contain"
            />
          </div>
        );
      })}
      {outfit.items.length > 4 && (
        <div className="w-12 h-12 bg-[#F5F0E8] flex items-center justify-center flex-shrink-0 text-xs text-[#9B9390] font-medium">
          +{outfit.items.length - 4}
        </div>
      )}
    </div>
  );
}

export default function TravelPlanner() {
  const [days, setDays] = useState<TravelDay[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [clothing, setClothing] = useState<ClothingItem[]>([]);
  const [tripName, setTripName] = useState("Mi viaje");
  const [showOutfitPicker, setShowOutfitPicker] = useState<string | null>(null);
  const [editingDayId, setEditingDayId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchDays(), fetchOutfits(), fetchClothing()]).then(
      ([d, o, c]) => {
        setDays(d);
        setOutfits(o);
        setClothing(c);
      }
    );
  }, []);

  const addDay = async () => {
    const newDay: TravelDay = {
      id: crypto.randomUUID(),
      label: `Día ${days.length + 1}`,
      order: days.length,
    };
    await upsertDay(newDay);
    setDays(await fetchDays());
  };

  const handleDeleteDay = async (id: string) => {
    await removeDay(id);
    setDays(await fetchDays());
  };

  const updateDayLabel = async (id: string, label: string) => {
    const day = days.find((d) => d.id === id);
    if (!day) return;
    await upsertDay({ ...day, label });
    setDays((prev) => prev.map((d) => (d.id === id ? { ...d, label } : d)));
  };

  const updateDayDate = async (id: string, date: string) => {
    const day = days.find((d) => d.id === id);
    if (!day) return;
    await upsertDay({ ...day, date });
    setDays((prev) => prev.map((d) => (d.id === id ? { ...d, date } : d)));
  };

  const assignOutfit = async (dayId: string, outfitId: string | undefined) => {
    const day = days.find((d) => d.id === dayId);
    if (!day) return;
    const updated = { ...day, outfitId };
    await upsertDay(updated);
    setDays((prev) => prev.map((d) => (d.id === dayId ? updated : d)));
    setShowOutfitPicker(null);
  };

  const outfitMap = Object.fromEntries(outfits.map((o) => [o.id, o]));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-display text-5xl text-[#111]">PLANIFICADOR</h2>
          <p className="text-sm text-[#9B9390] mt-1">
            {days.length} día{days.length !== 1 ? "s" : ""} planificado
            {days.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            className="border border-[#D4CEC6] px-3 py-2 text-sm focus:outline-none focus:border-[#111] bg-white"
            placeholder="Nombre del viaje"
          />
          <button
            onClick={addDay}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#111] text-white text-xs font-medium tracking-widest uppercase hover:bg-[#333] transition-colors"
          >
            <Plus size={13} />
            Agregar día
          </button>
        </div>
      </div>

      {/* Empty state */}
      {days.length === 0 && (
        <div
          onClick={addDay}
          className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-[#C8C0B0] cursor-pointer hover:border-[#111] hover:bg-white/30 transition-all"
        >
          <CalendarDays size={28} className="text-[#C8C0B0] mb-3" />
          <p className="text-[#9B9390] text-sm tracking-wide">
            Agregá días para planificar tu viaje
          </p>
        </div>
      )}

      {/* Days list */}
      <div className="space-y-3">
        {days.map((day, index) => {
          const assignedOutfit = day.outfitId ? outfitMap[day.outfitId] : null;

          return (
            <div
              key={day.id}
              className="bg-white border border-[#D4CEC6] p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Day number */}
                <div className="flex-shrink-0 w-9 h-9 bg-[#111] text-white flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>

                {/* Day info */}
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    {editingDayId === day.id ? (
                      <input
                        type="text"
                        value={day.label}
                        autoFocus
                        onChange={(e) => updateDayLabel(day.id, e.target.value)}
                        onBlur={() => setEditingDayId(null)}
                        className="font-medium text-[#111] bg-transparent border-b border-[#C8C0B0] focus:outline-none text-sm"
                      />
                    ) : (
                      <span
                        className="font-medium text-[#111] cursor-text hover:text-[#6B6560] text-sm"
                        onClick={() => setEditingDayId(day.id)}
                      >
                        {day.label}
                      </span>
                    )}
                    <input
                      type="date"
                      value={day.date ?? ""}
                      onChange={(e) => updateDayDate(day.id, e.target.value)}
                      className="text-xs text-[#9B9390] bg-transparent border border-[#D4CEC6] px-2 py-1 focus:outline-none focus:border-[#111]"
                    />
                  </div>

                  {/* Assigned outfit */}
                  {assignedOutfit ? (
                    <div className="flex items-center gap-3">
                      <OutfitPreview outfit={assignedOutfit} clothing={clothing} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#111] truncate">
                          {assignedOutfit.name}
                        </p>
                        <p className="text-xs text-[#9B9390]">
                          {assignedOutfit.items.length} prenda
                          {assignedOutfit.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowOutfitPicker(day.id)}
                        className="p-1.5 text-[#9B9390] hover:text-[#111] transition-colors"
                        title="Cambiar outfit"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        onClick={() => assignOutfit(day.id, undefined)}
                        className="p-1.5 text-[#9B9390] hover:text-red-500 transition-colors"
                        title="Quitar outfit"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowOutfitPicker(day.id)}
                      className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-[#C8C0B0] text-xs text-[#9B9390] hover:border-[#111] hover:text-[#111] transition-colors w-fit"
                    >
                      <Plus size={13} />
                      Asignar outfit
                    </button>
                  )}
                </div>

                {/* Delete day */}
                <button
                  onClick={() => handleDeleteDay(day.id)}
                  className="p-1.5 text-[#C8C0B0] hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Outfit picker modal */}
      {showOutfitPicker && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white shadow-2xl w-full max-w-md max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#EDE8DF]">
              <h3 className="font-display text-xl text-[#111]">ELEGÍ UN OUTFIT</h3>
              <button
                onClick={() => setShowOutfitPicker(null)}
                className="p-1.5 text-[#9B9390] hover:text-[#111] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-2 scrollbar-hide">
              {outfits.length === 0 ? (
                <div className="text-center py-8 text-[#9B9390] text-sm">
                  No tenés outfits guardados todavía
                </div>
              ) : (
                outfits.map((outfit) => (
                  <button
                    key={outfit.id}
                    onClick={() => assignOutfit(showOutfitPicker, outfit.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-[#F5F0E8] border border-[#EDE8DF] hover:border-[#C8C0B0] transition-all text-left"
                  >
                    <OutfitPreview outfit={outfit} clothing={clothing} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#111] truncate">
                        {outfit.name}
                      </p>
                      <p className="text-xs text-[#9B9390]">
                        {outfit.items.length} prenda
                        {outfit.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
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
