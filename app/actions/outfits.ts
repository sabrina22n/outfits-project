"use server";

import { supabase } from "@/lib/supabase";
import type { Outfit } from "@/lib/db";

export async function saveOutfit(outfit: Outfit) {
  await supabase.from("outfits").upsert({
    id: outfit.id,
    name: outfit.name,
    created_at: outfit.createdAt,
  });

  await supabase.from("outfit_items").delete().eq("outfit_id", outfit.id);

  if (outfit.items.length > 0) {
    await supabase.from("outfit_items").insert(
      outfit.items.map((item) => ({
        outfit_id: outfit.id,
        clothing_id: item.clothingId,
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        z_index: item.zIndex,
      }))
    );
  }
}

export async function removeOutfit(id: string) {
  await supabase.from("outfits").delete().eq("id", id);
}
