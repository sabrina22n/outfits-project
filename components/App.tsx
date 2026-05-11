"use client";

import { useState } from "react";
import { ShirtIcon, Palette, CalendarDays } from "lucide-react";
import Wardrobe from "./Wardrobe";
import OutfitBuilder from "./OutfitBuilder";
import TravelPlanner from "./TravelPlanner";

type Tab = "wardrobe" | "builder" | "planner";

const TABS: { id: Tab; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: "wardrobe",
    label: "Guardarropa",
    icon: <ShirtIcon size={17} />,
    description: "Subí y organizá tus prendas",
  },
  {
    id: "builder",
    label: "Armar outfit",
    icon: <Palette size={17} />,
    description: "Combiná prendas en un collage",
  },
  {
    id: "planner",
    label: "Planificador",
    icon: <CalendarDays size={17} />,
    description: "Asigná outfits a cada día",
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("wardrobe");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-stone-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <span className="text-xl">✈️</span>
              <span className="font-semibold text-stone-800 text-sm sm:text-base">
                Travel Outfits
              </span>
            </div>

            {/* Tab navigation */}
            <nav className="flex items-center gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-stone-800 text-white"
                      : "text-stone-500 hover:text-stone-800 hover:bg-stone-100"
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Section description */}
        <div className="mb-6">
          <p className="text-sm text-stone-400">
            {TABS.find((t) => t.id === activeTab)?.description}
          </p>
        </div>

        {activeTab === "wardrobe" && <Wardrobe />}
        {activeTab === "builder" && <OutfitBuilder />}
        {activeTab === "planner" && <TravelPlanner />}
      </main>
    </div>
  );
}
