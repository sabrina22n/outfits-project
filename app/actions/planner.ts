"use server";

import { supabase } from "@/lib/supabase";
import type { TravelDay, Trip } from "@/lib/db";

export async function upsertTrip(trip: Trip) {
  await supabase.from("trips").upsert({
    id: trip.id,
    name: trip.name,
    created_at: trip.createdAt,
  });
}

export async function removeTrip(id: string) {
  await supabase.from("trips").delete().eq("id", id);
}

export async function upsertDay(day: TravelDay) {
  await supabase.from("travel_days").upsert({
    id: day.id,
    trip_id: day.tripId,
    label: day.label,
    date: day.date ?? null,
    order_index: day.order,
    outfit_id: day.outfitDayId ?? null,
    outfit_night_id: day.outfitNightId ?? null,
  });
}

export async function removeDay(id: string) {
  await supabase.from("travel_days").delete().eq("id", id);
}
