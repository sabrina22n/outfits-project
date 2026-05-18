"use client";

import { useState } from "react";
import { X, Sparkles, RotateCcw, AlertCircle } from "lucide-react";
import type { ClothingCategory } from "@/lib/db";

interface MannequinItem {
  clothingId: string;
  category: ClothingCategory;
  imageUrl: string;
  name: string;
}

interface Props {
  items: MannequinItem[];
  outfitName: string;
  onClose: () => void;
}

type State = "idle" | "generating" | "done" | "error";

const CATEGORY_LABEL: Partial<Record<ClothingCategory, string>> = {
  top:       "Top",
  jersey:    "Jersey",
  jacket:    "Chaqueta",
  dress:     "Vestido",
  bottom:    "Pantalón",
  skirt:     "Pollera",
  short:     "Short",
  shoes:     "Zapatos",
  accessory: "Accesorio",
};

// Categories the AI can process (shoes/accessories are skipped by the API)
const AI_SUPPORTED: ClothingCategory[] = ["top", "jersey", "jacket", "dress", "bottom", "skirt", "short"];

export default function MannequinView({ items, outfitName, onClose }: Props) {
  const [state, setState] = useState<State>("idle");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supportedItems = items.filter((i) => AI_SUPPORTED.includes(i.category));

  const generate = async () => {
    setState("generating");
    setError(null);
    try {
      const res = await fetch("/api/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ garments: supportedItems }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error del servidor");
      setResultUrl(data.imageUrl);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setState("error");
    }
  };

  const reset = () => {
    setState("idle");
    setResultUrl(null);
    setError(null);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white shadow-2xl flex flex-col"
        style={{ width: 480, maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDE8DF] flex-shrink-0">
          <h3 className="font-display text-xl text-[#111] tracking-wider">
            {outfitName.toUpperCase()}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9B9390] hover:text-[#111] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* IDLE: preview + generate button */}
          {state === "idle" && (
            <div className="p-6 flex flex-col gap-5">
              <div className="grid grid-cols-3 gap-2">
                {items.map((item) => (
                  <div key={item.clothingId} className="flex flex-col gap-1">
                    <div className="aspect-square bg-[#F5F0E8] overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-[10px] text-[#9B9390] uppercase tracking-wide truncate">
                      {CATEGORY_LABEL[item.category] ?? item.category}
                    </p>
                    <p className="text-xs text-[#111] truncate">{item.name}</p>
                  </div>
                ))}
              </div>

              {supportedItems.length === 0 ? (
                <p className="text-sm text-[#9B9390] text-center py-4">
                  No hay prendas compatibles con la IA (solo tops, chaquetas, vestidos, pantalones y polleras).
                </p>
              ) : (
                <button
                  onClick={generate}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[#111] text-white text-sm font-medium tracking-wide hover:bg-[#333] transition-colors"
                >
                  <Sparkles size={15} />
                  Generar con IA
                </button>
              )}

              <p className="text-[10px] text-[#C8C0B0] text-center">
                Usa fal.ai · ~30 seg por prenda · zapatos y accesorios no se procesan
              </p>
            </div>
          )}

          {/* GENERATING */}
          {state === "generating" && (
            <div className="flex flex-col items-center justify-center gap-5 py-20 px-6">
              <div className="w-10 h-10 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-[#111]">Generando tu outfit…</p>
                <p className="text-xs text-[#9B9390]">
                  Aplicando {supportedItems.length} prenda{supportedItems.length !== 1 ? "s" : ""} secuencialmente, puede tardar hasta{" "}
                  {supportedItems.length * 35} segundos
                </p>
              </div>
            </div>
          )}

          {/* DONE */}
          {state === "done" && resultUrl && (
            <div className="flex flex-col">
              <img
                src={resultUrl}
                alt="Outfit generado por IA"
                className="w-full object-contain max-h-[65vh]"
              />
              <div className="px-5 py-3 flex items-center justify-between border-t border-[#EDE8DF]">
                <div className="flex flex-wrap gap-1.5">
                  {items.map((item) => (
                    <span
                      key={item.clothingId}
                      className="text-[10px] text-[#6B6560] bg-[#F5F0E8] px-2 py-0.5 uppercase tracking-wide"
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
                <button
                  onClick={reset}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 border border-[#D4CEC6] text-xs text-[#6B6560] hover:border-[#111] hover:text-[#111] transition-colors ml-3"
                >
                  <RotateCcw size={11} />
                  Regenerar
                </button>
              </div>
            </div>
          )}

          {/* ERROR */}
          {state === "error" && (
            <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
              <AlertCircle size={32} className="text-red-400" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#111]">No se pudo generar el outfit</p>
                <p className="text-xs text-[#9B9390] max-w-xs">{error}</p>
              </div>
              <button
                onClick={reset}
                className="flex items-center gap-1.5 px-4 py-2 border border-[#D4CEC6] text-sm text-[#6B6560] hover:border-[#111] hover:text-[#111] transition-colors"
              >
                <RotateCcw size={13} />
                Intentar de nuevo
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
