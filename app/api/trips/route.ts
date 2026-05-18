import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Trip } from "@/lib/db";

export async function GET() {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json([], { status: 500 });

  const trips: Trip[] = (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
  }));

  return NextResponse.json(trips);
}
