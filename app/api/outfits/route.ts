import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Outfit } from "@/lib/db";

export async function GET() {
  const { data, error } = await supabase
    .from("outfits")
    .select("*, outfit_items(*)")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json([], { status: 500 });

  const outfits: Outfit[] = (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    items: (row.outfit_items ?? []).map((item: Record<string, unknown>) => ({
      clothingId: item.clothing_id,
      x: item.x,
      y: item.y,
      width: item.width,
      height: item.height,
      zIndex: item.z_index,
    })),
  }));

  return NextResponse.json(outfits);
}
