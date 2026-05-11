import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { ClothingItem } from "@/lib/db";

export async function GET() {
  const { data, error } = await supabase
    .from("clothing")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json([], { status: 500 });

  const items: ClothingItem[] = (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    imageUrl: row.image_url,
    createdAt: row.created_at,
  }));

  return NextResponse.json(items);
}
