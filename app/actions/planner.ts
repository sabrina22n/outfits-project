"use server";

import { supabase } from "@/lib/supabase";
import type { TravelDay } from "@/lib/db";

export async function upsertDay(day: TravelDay) {
  await supabase.from("travel_days").upsert({
    id: day.id,
    label: day.label,
    date: day.date ?? null,
    order_index: day.order,
    outfit_id: day.outfitId ?? null,
  });
}

export async function removeDay(id: string) {
  await supabase.from("travel_days").delete().eq("id", id);
}
