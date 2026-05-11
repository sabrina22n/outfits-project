"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  CalendarDays,
  ChevronDown,
  GripVertical,
  X,
} from "lucide-react";
import {
  Outfit,
  TravelDay,
  getAllOutfits,
  getAllDays,
  saveDay,
  deleteDay,
  getAllClothing,
  ClothingItem,
} from "@/lib/db";

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
            className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0"
          >
            <img
              src={ci.imageDataUrl}
              alt={ci.name}
              className="w-full h-full object-cover"
            />
          </div>
        );
      })}
      {outfit.items.length > 4 && (
        <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0 text-xs text-stone-400 font-medium">
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
    Promise.all([getAllDays(), getAllOutfits(), getAllClothing()]).then(
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
    await saveDay(newDay);
    setDays(await getAllDays());
  };

  const removeDay = async (id: string) => {
    await deleteDay(id);
    setDays(await getAllDays());
  };

  const updateDayLabel = async (id: string, label: string) => {
    const day = days.find((d) => d.id === id);
    if (!day) return;
    await saveDay({ ...day, label });
    setDays((prev) =>
      prev.map((d) => (d.id === id ? { ...d, label } : d))
    );
  };

  const updateDayDate = async (id: string, date: string) => {
    const day = days.find((d) => d.id === id);
    if (!day) return;
    await saveDay({ ...day, date });
    setDays((prev) =>
      prev.map((d) => (d.id === id ? { ...d, date } : d))
    );
  };

  const assignOutfit = async (dayId: string, outfitId: string | undefined) => {
    const day = days.find((d) => d.id === dayId);
    if (!day) return;
    const updated = { ...day, outfitId };
    await saveDay(updated);
    setDays((prev) => prev.map((d) => (d.id === dayId ? updated : d)));
    setShowOutfitPicker(null);
  };

  const outfitMap = Object.fromEntries(outfits.map((o) => [o.id, o]));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <input
            type="text"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            className="text-xl font-semibold text-stone-800 bg-transparent focus:outline-none border-b-2 border-transparent focus:border-stone-300"
          />
          <p className="text-sm text-stone-500 mt-0.5">
            {days.length} día{days.length !== 1 ? "s" : ""} planificado
            {days.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={addDay}
          className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors"
        >
          <Plus size={15} />
          Agregar día
        </button>
      </div>

      {/* Empty state */}
      {days.length === 0 && (
        <div
          onClick={addDay}
          className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-stone-200 rounded-2xl cursor-pointer hover:border-stone-400 hover:bg-stone-50 transition-all"
        >
          <CalendarDays size={36} className="text-stone-300 mb-3" />
          <p className="text-stone-400 text-sm">
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
              className="bg-white rounded-2xl border border-stone-100 p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Day number */}
                <div className="flex-shrink-0 w-9 h-9 bg-stone-800 text-white rounded-xl flex items-center justify-center text-sm font-bold">
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
                        className="font-medium text-stone-800 bg-transparent border-b border-stone-300 focus:outline-none text-sm"
                      />
                    ) : (
                      <span
                        className="font-medium text-stone-800 cursor-text hover:text-stone-600 text-sm"
                        onClick={() => setEditingDayId(day.id)}
                      >
                        {day.label}
                      </span>
                    )}
                    <input
                      type="date"
                      value={day.date ?? ""}
                      onChange={(e) => updateDayDate(day.id, e.target.value)}
                      className="text-xs text-stone-400 bg-transparent border border-stone-200 rounded-lg px-2 py-1 focus:outline-none focus:border-stone-400"
                    />
                  </div>

                  {/* Assigned outfit */}
                  {assignedOutfit ? (
                    <div className="flex items-center gap-3">
                      <OutfitPreview outfit={assignedOutfit} clothing={clothing} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-700 truncate">
                          {assignedOutfit.name}
                        </p>
                        <p className="text-xs text-stone-400">
                          {assignedOutfit.items.length} prenda
                          {assignedOutfit.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowOutfitPicker(day.id)}
                        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
                        title="Cambiar outfit"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        onClick={() => assignOutfit(day.id, undefined)}
                        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-red-500 transition-colors"
                        title="Quitar outfit"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowOutfitPicker(day.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-dashed border-stone-200 text-xs text-stone-400 hover:border-stone-400 hover:text-stone-600 transition-colors w-fit"
                    >
                      <Plus size={13} />
                      Asignar outfit
                    </button>
                  )}
                </div>

                {/* Delete day */}
                <button
                  onClick={() => removeDay(day.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-400 transition-colors flex-shrink-0"
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-stone-100">
              <h3 className="font-semibold text-stone-800">Elegí un outfit</h3>
              <button
                onClick={() => setShowOutfitPicker(null)}
                className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400"
              >
                <X size={16} />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-2 scrollbar-hide">
              {outfits.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-sm">
                  No tenés outfits guardados todavía
                </div>
              ) : (
                outfits.map((outfit) => (
                  <button
                    key={outfit.id}
                    onClick={() => assignOutfit(showOutfitPicker, outfit.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 border border-stone-100 hover:border-stone-300 transition-all text-left"
                  >
                    <OutfitPreview outfit={outfit} clothing={clothing} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-700 truncate">
                        {outfit.name}
                      </p>
                      <p className="text-xs text-stone-400">
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
