"use client";

import { X } from "lucide-react";
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

// Zones positioned on a 320×520 canvas to align with the mannequin SVG paths below
const ZONE: Record<ClothingCategory, { top: number; left: number; width: number; height: number; zIndex: number }> = {
  jacket:    { top: 75,  left: 40,  width: 240, height: 200, zIndex: 4 },
  top:       { top: 88,  left: 58,  width: 204, height: 178, zIndex: 3 },
  jersey:    { top: 88,  left: 58,  width: 204, height: 178, zIndex: 3 },
  dress:     { top: 88,  left: 52,  width: 216, height: 335, zIndex: 2 },
  bottom:    { top: 258, left: 62,  width: 196, height: 158, zIndex: 2 },
  skirt:     { top: 258, left: 56,  width: 208, height: 158, zIndex: 2 },
  short:     { top: 258, left: 68,  width: 184, height: 108, zIndex: 2 },
  shoes:     { top: 412, left: 72,  width: 176, height: 88,  zIndex: 1 },
  accessory: { top: 60,  left: 112, width: 96,  height: 46,  zIndex: 5 },
};

function MannequinSvg() {
  return (
    <svg
      viewBox="0 0 320 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full pointer-events-none"
    >
      <g stroke="#C8C0B0" strokeWidth="1.5" fill="#EDE8DF" strokeLinejoin="round">
        {/* Head */}
        <ellipse cx="160" cy="40" rx="26" ry="32" />
        {/* Neck */}
        <path d="M152 70 L151 88 Q160 93 169 88 L168 70 Z" />
        {/* Torso + hips */}
        <path d="
          M 75 84 C 108 76 132 73 160 73 C 188 73 212 76 245 84
          L 256 91 C 267 97 271 120 269 167
          C 267 200 259 230 248 262
          C 214 278 188 284 160 284
          C 132 284 106 278 72 262
          C 61 230 53 200 51 167
          C 49 120 53 97 64 91 Z
        " />
        {/* Left arm */}
        <path d="
          M 64 91 C 53 102 40 128 36 164
          C 32 195 36 226 46 250
          C 53 254 64 252 70 248
          C 59 224 53 194 56 163
          C 59 135 72 113 83 101 Z
        " />
        {/* Right arm */}
        <path d="
          M 256 91 C 267 102 280 128 284 164
          C 288 195 284 226 274 250
          C 267 254 256 252 250 248
          C 261 224 267 194 264 163
          C 261 135 248 113 237 101 Z
        " />
        {/* Left hand */}
        <ellipse cx="50" cy="255" rx="9" ry="13" />
        {/* Right hand */}
        <ellipse cx="270" cy="255" rx="9" ry="13" />
        {/* Left leg */}
        <path d="
          M 72 262 C 73 298 76 342 80 392
          C 84 432 87 468 88 506
          C 102 511 122 509 130 504
          C 128 467 125 432 121 392
          C 117 350 115 310 116 276
          L 115 262 Z
        " />
        {/* Right leg */}
        <path d="
          M 248 262 C 247 298 244 342 240 392
          C 236 432 233 468 232 506
          C 218 511 198 509 190 504
          C 192 467 195 432 199 392
          C 203 350 205 310 204 276
          L 205 262 Z
        " />
        {/* Left foot */}
        <ellipse cx="103" cy="508" rx="28" ry="9" />
        {/* Right foot */}
        <ellipse cx="217" cy="508" rx="28" ry="9" />
      </g>
    </svg>
  );
}

export default function MannequinView({ items, outfitName, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white shadow-2xl flex flex-col"
        style={{ width: 440, maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDE8DF]">
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

        {/* Mannequin canvas */}
        <div className="flex-1 overflow-y-auto flex justify-center items-center p-8 bg-[#FAFAF8]">
          <div className="relative bg-white shadow-sm" style={{ width: 320, height: 520 }}>
            <MannequinSvg />
            {items.map((item) => {
              const zone = ZONE[item.category];
              return (
                <div
                  key={item.clothingId}
                  className="absolute"
                  style={{
                    top: zone.top,
                    left: zone.left,
                    width: zone.width,
                    height: zone.height,
                    zIndex: zone.zIndex,
                  }}
                  title={item.name}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-contain"
                    style={{ mixBlendMode: "multiply" }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Prendas legend */}
        {items.length > 0 && (
          <div className="px-5 py-3 border-t border-[#EDE8DF] bg-white">
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
          </div>
        )}
      </div>
    </div>
  );
}
