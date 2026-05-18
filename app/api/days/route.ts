import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { TravelDay } from "@/lib/db";

export async function GET() {
  const { data, error } = await supabase
    .from("travel_days")
    .select("*")
    .order("order_index", { ascending: true });

  if (error) return NextResponse.json([], { status: 500 });

  const days: TravelDay[] = (data ?? []).map((row) => ({
    id: row.id,
    tripId: row.trip_id,
    label: row.label,
    date: row.date ?? undefined,
    outfitDayId: row.outfit_id ?? undefined,
    outfitNightId: row.outfit_night_id ?? undefined,
    order: row.order_index,
  }));

  return NextResponse.json(days);
}
