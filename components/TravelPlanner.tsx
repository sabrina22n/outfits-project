"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  X,
  Pencil,
  Check,
} from "lucide-react";
import type { Outfit, Trip, TravelDay, ClothingItem } from "@/lib/db";
import { upsertTrip, removeTrip, upsertDay, removeDay } from "@/app/actions/planner";

async function fetchTrips(): Promise<Trip[]> {
  return fetch("/api/trips").then((r) => r.json());
}
async function fetchDays(): Promise<TravelDay[]> {
  return fetch("/api/days").then((r) => r.json());
}
async function fetchOutfits(): Promise<Outfit[]> {
  return fetch("/api/outfits").then((r) => r.json());
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
  const [trips, setTrips] = useState<Trip[]>([]);
  const [days, setDays] = useState<TravelDay[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [clothing, setClothing] = useState<ClothingItem[]>([]);
  const [expandedTrips, setExpandedTrips] = useState<Set<string>>(new Set());
  const [showOutfitPicker, setShowOutfitPicker] = useState<{ dayId: string; slot: "day" | "night" } | null>(null);
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [newTripName, setNewTripName] = useState("");
  const [showNewTripInput, setShowNewTripInput] = useState(false);

  useEffect(() => {
    Promise.all([fetchTrips(), fetchDays(), fetchOutfits(), fetchClothing()]).then(
      ([t, d, o, c]) => {
        setTrips(t);
        setDays(d);
        setOutfits(o);
        setClothing(c);
        // Expand all trips by default
        setExpandedTrips(new Set(t.map((trip) => trip.id)));
      }
    );
  }, []);

  const addTrip = async () => {
    const name = newTripName.trim() || "Nuevo viaje";
    const newTrip: Trip = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
    };
    await upsertTrip(newTrip);
    const updated = await fetchTrips();
    setTrips(updated);
    setExpandedTrips((prev) => new Set([...prev, newTrip.id]));
    setNewTripName("");
    setShowNewTripInput(false);
  };

  const handleDeleteTrip = async (id: string) => {
    await removeTrip(id);
    const [updatedTrips, updatedDays] = await Promise.all([fetchTrips(), fetchDays()]);
    setTrips(updatedTrips);
    setDays(updatedDays);
  };

  const updateTripName = async (id: string, name: string) => {
    const trip = trips.find((t) => t.id === id);
    if (!trip) return;
    await upsertTrip({ ...trip, name });
    setTrips((prev) => prev.map((t) => (t.id === id ? { ...t, name } : t)));
  };

  const addDay = async (tripId: string) => {
    const tripDays = days.filter((d) => d.tripId === tripId);
    const newDay: TravelDay = {
      id: crypto.randomUUID(),
      tripId,
      label: `Día ${tripDays.length + 1}`,
      order: tripDays.length,
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

  const assignOutfit = async (dayId: string, slot: "day" | "night", outfitId: string | undefined) => {
    const day = days.find((d) => d.id === dayId);
    if (!day) return;
    const updated = slot === "day"
      ? { ...day, outfitDayId: outfitId }
      : { ...day, outfitNightId: outfitId };
    await upsertDay(updated);
    setDays((prev) => prev.map((d) => (d.id === dayId ? updated : d)));
    setShowOutfitPicker(null);
  };

  const toggleTrip = (id: string) => {
    setExpandedTrips((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const outfitMap = Object.fromEntries(outfits.map((o) => [o.id, o]));
  const totalDays = days.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-display text-5xl text-[#111]">PLANIFICADOR</h2>
          <p className="text-sm text-[#9B9390] mt-1">
            {trips.length} viaje{trips.length !== 1 ? "s" : ""} · {totalDays} día
            {totalDays !== 1 ? "s" : ""} planificado{totalDays !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {showNewTripInput ? (
            <>
              <input
                type="text"
                value={newTripName}
                autoFocus
                onChange={(e) => setNewTripName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTrip();
                  if (e.key === "Escape") {
                    setShowNewTripInput(false);
                    setNewTripName("");
                  }
                }}
                className="border border-[#D4CEC6] px-3 py-2 text-sm focus:outline-none focus:border-[#111] bg-white"
                placeholder="Nombre del viaje"
              />
              <button
                onClick={addTrip}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#111] text-white text-xs font-medium tracking-widest uppercase hover:bg-[#333] transition-colors"
              >
                <Check size={13} />
                Crear
              </button>
              <button
                onClick={() => {
                  setShowNewTripInput(false);
                  setNewTripName("");
                }}
                className="p-2.5 text-[#9B9390] hover:text-[#111] transition-colors border border-[#D4CEC6]"
              >
                <X size={13} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowNewTripInput(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#111] text-white text-xs font-medium tracking-widest uppercase hover:bg-[#333] transition-colors"
            >
              <Plus size={13} />
              Nuevo viaje
            </button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {trips.length === 0 && (
        <div
          onClick={() => setShowNewTripInput(true)}
          className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-[#C8C0B0] cursor-pointer hover:border-[#111] hover:bg-white/30 transition-all"
        >
          <CalendarDays size={28} className="text-[#C8C0B0] mb-3" />
          <p className="text-[#9B9390] text-sm tracking-wide">
            Creá un viaje para empezar a planificar
          </p>
        </div>
      )}

      {/* Trips list */}
      <div className="space-y-4">
        {trips.map((trip) => {
          const tripDays = days.filter((d) => d.tripId === trip.id);
          const isExpanded = expandedTrips.has(trip.id);

          return (
            <div key={trip.id} className="border border-[#D4CEC6] bg-white">
              {/* Trip header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#EDE8DF]">
                <button
                  onClick={() => toggleTrip(trip.id)}
                  className="text-[#9B9390] hover:text-[#111] transition-colors flex-shrink-0"
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {editingTripId === trip.id ? (
                  <input
                    type="text"
                    value={trip.name}
                    autoFocus
                    onChange={(e) => updateTripName(trip.id, e.target.value)}
                    onBlur={() => setEditingTripId(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingTripId(null)}
                    className="flex-1 font-display text-lg text-[#111] bg-transparent border-b border-[#C8C0B0] focus:outline-none"
                  />
                ) : (
                  <button
                    className="flex-1 text-left font-display text-lg text-[#111] hover:text-[#6B6560] transition-colors"
                    onClick={() => setEditingTripId(trip.id)}
                  >
                    {trip.name}
                  </button>
                )}

                <span className="text-xs text-[#9B9390] flex-shrink-0">
                  {tripDays.length} día{tripDays.length !== 1 ? "s" : ""}
                </span>

                <button
                  onClick={() => setEditingTripId(trip.id)}
                  className="p-1.5 text-[#C8C0B0] hover:text-[#111] transition-colors flex-shrink-0"
                  title="Renombrar viaje"
                >
                  <Pencil size={13} />
                </button>

                <button
                  onClick={() => handleDeleteTrip(trip.id)}
                  className="p-1.5 text-[#C8C0B0] hover:text-red-400 transition-colors flex-shrink-0"
                  title="Eliminar viaje"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Trip days */}
              {isExpanded && (
                <div className="p-4 space-y-3">
                  {tripDays.length === 0 && (
                    <p className="text-sm text-[#C8C0B0] py-2">
                      No hay días planificados aún.
                    </p>
                  )}

                  {tripDays.map((day, index) => {
                    const outfitDay = day.outfitDayId ? outfitMap[day.outfitDayId] : null;
                    const outfitNight = day.outfitNightId ? outfitMap[day.outfitNightId] : null;

                    return (
                      <div
                        key={day.id}
                        className="border border-[#EDE8DF] p-4 hover:shadow-sm transition-shadow"
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

                            {/* Outfit slots */}
                            {(["day", "night"] as const).map((slot) => {
                              const assigned = slot === "day" ? outfitDay : outfitNight;
                              const label = slot === "day" ? "☀️ Día" : "🌙 Noche";
                              return (
                                <div key={slot} className="flex items-center gap-3">
                                  <span className="text-xs text-[#9B9390] w-14 flex-shrink-0">{label}</span>
                                  {assigned ? (
                                    <>
                                      <OutfitPreview outfit={assigned} clothing={clothing} />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[#111] truncate">{assigned.name}</p>
                                        <p className="text-xs text-[#9B9390]">
                                          {assigned.items.length} prenda{assigned.items.length !== 1 ? "s" : ""}
                                        </p>
                                      </div>
                                      <button
                                        onClick={() => setShowOutfitPicker({ dayId: day.id, slot })}
                                        className="p-1.5 text-[#9B9390] hover:text-[#111] transition-colors"
                                        title="Cambiar outfit"
                                      >
                                        <ChevronDown size={14} />
                                      </button>
                                      <button
                                        onClick={() => assignOutfit(day.id, slot, undefined)}
                                        className="p-1.5 text-[#9B9390] hover:text-red-500 transition-colors"
                                        title="Quitar outfit"
                                      >
                                        <X size={14} />
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => setShowOutfitPicker({ dayId: day.id, slot })}
                                      className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-[#C8C0B0] text-xs text-[#9B9390] hover:border-[#111] hover:text-[#111] transition-colors"
                                    >
                                      <Plus size={13} />
                                      Asignar outfit
                                    </button>
                                  )}
                                </div>
                              );
                            })}
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

                  {/* Add day button inside trip */}
                  <button
                    onClick={() => addDay(trip.id)}
                    className="flex items-center gap-2 px-4 py-2 border border-dashed border-[#C8C0B0] text-xs text-[#9B9390] hover:border-[#111] hover:text-[#111] transition-colors w-fit"
                  >
                    <Plus size={13} />
                    Agregar día
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Outfit picker modal */}
      {showOutfitPicker && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white shadow-2xl w-full max-w-md max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#EDE8DF]">
              <h3 className="font-display text-xl text-[#111]">
                {showOutfitPicker?.slot === "night" ? "OUTFIT DE NOCHE" : "OUTFIT DE DÍA"}
              </h3>
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
                    onClick={() => assignOutfit(showOutfitPicker.dayId, showOutfitPicker.slot, outfit.id)}
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
