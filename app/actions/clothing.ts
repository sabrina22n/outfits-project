"use server";

import { supabase } from "@/lib/supabase";

export async function addClothing(formData: FormData) {
  const file = formData.get("file") as File;
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const id = formData.get("id") as string;

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${id}.${ext}`;

  const bytes = await file.arrayBuffer();
  await supabase.storage
    .from("clothing-images")
    .upload(path, bytes, { contentType: file.type, upsert: true });

  const { data: urlData } = supabase.storage
    .from("clothing-images")
    .getPublicUrl(path);

  await supabase.from("clothing").insert({
    id,
    name,
    category,
    image_url: urlData.publicUrl,
    created_at: Date.now(),
  });
}

export async function removeClothing(id: string) {
  const { data } = await supabase
    .from("clothing")
    .select("image_url")
    .eq("id", id)
    .single();

  if (data?.image_url) {
    const filename = data.image_url.split("/").pop();
    if (filename) {
      await supabase.storage.from("clothing-images").remove([filename]);
    }
  }

  await supabase.from("clothing").delete().eq("id", id);
}
