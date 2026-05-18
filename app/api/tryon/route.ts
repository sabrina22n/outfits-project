import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import fs from "fs/promises";
import path from "path";

export const maxDuration = 180; // 3 min for sequential garment application

type AppCategory = "top" | "bottom" | "short" | "skirt" | "jersey" | "dress" | "jacket" | "shoes" | "accessory";
type FalCategory = "upper_body" | "lower_body" | "dresses";

interface Garment {
  imageUrl: string;
  category: AppCategory;
  name: string;
}

const FAL_CATEGORY: Partial<Record<AppCategory, FalCategory>> = {
  top:    "upper_body",
  jersey: "upper_body",
  jacket: "upper_body",
  bottom: "lower_body",
  short:  "lower_body",
  skirt:  "lower_body",
  dress:  "dresses",
};

// Innermost layers first; jacket goes over top
const APPLY_ORDER: AppCategory[] = ["dress", "top", "jersey", "jacket", "bottom", "skirt", "short"];

// Cache the uploaded model URL for the duration of the process
let cachedModelUrl: string | null = null;

async function getModelUrl(): Promise<string> {
  // Prefer explicit env var (e.g. in production)
  if (process.env.FAL_MODEL_IMAGE_URL) return process.env.FAL_MODEL_IMAGE_URL;

  // Use cached URL from a previous upload this session
  if (cachedModelUrl) return cachedModelUrl;

  // Read from /public/model-base.jpg and upload to fal CDN
  const filePath = path.join(process.cwd(), "public", "model-base.jpg");
  let buffer: Buffer;
  try {
    buffer = await fs.readFile(filePath);
  } catch {
    throw new Error(
      "No se encontró la imagen del modelo. Guardá tu foto en public/model-base.jpg o configurá FAL_MODEL_IMAGE_URL en .env.local"
    );
  }

  const blob = new Blob([new Uint8Array(buffer)], { type: "image/jpeg" });
  cachedModelUrl = await fal.storage.upload(blob);
  return cachedModelUrl;
}

async function applyGarment(humanUrl: string, garment: Garment): Promise<string> {
  const category = FAL_CATEGORY[garment.category];
  if (!category) return humanUrl;

  const result = await fal.subscribe("fal-ai/idm-vton", {
    input: {
      human_image_url: humanUrl,
      garment_image_url: garment.imageUrl,
      garment_description: garment.name,
      category,
    },
    pollInterval: 3000,
  });

  const url = (result.data as { image?: { url: string } }).image?.url;
  return url ?? humanUrl;
}

export async function POST(req: NextRequest) {
  const falKey = process.env.FAL_KEY;
  if (!falKey) {
    return NextResponse.json(
      { error: "Configurá FAL_KEY en .env.local (conseguila en fal.ai → Dashboard → API Keys)" },
      { status: 500 }
    );
  }

  fal.config({ credentials: falKey });

  const { garments } = (await req.json()) as { garments: Garment[] };

  // If there's a dress, skip tops and bottoms (dress covers both)
  const hasDress = garments.some((g) => g.category === "dress");
  const toApply = APPLY_ORDER
    .map((cat) => garments.find((g) => g.category === cat))
    .filter((g): g is Garment => g !== undefined)
    .filter((g) => !hasDress || g.category === "dress");

  try {
    const modelUrl = await getModelUrl();
    let currentUrl = modelUrl;
    for (const garment of toApply) {
      currentUrl = await applyGarment(currentUrl, garment);
    }
    return NextResponse.json({ imageUrl: currentUrl });
  } catch (err) {
    console.error("[tryon]", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
