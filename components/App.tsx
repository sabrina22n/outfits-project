"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import Wardrobe from "./Wardrobe";
import OutfitBuilder from "./OutfitBuilder";
import TravelPlanner from "./TravelPlanner";

type Tab = "wardrobe" | "builder" | "planner";

const TABS: { id: Tab; label: string }[] = [
  { id: "wardrobe", label: "Guardarropa" },
  { id: "builder", label: "Outfits" },
  { id: "planner", label: "Planificador" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("wardrobe");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-[#D4CEC6] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Brand row */}
          <div className="flex items-center justify-between h-12 sm:h-16">
            <span className="font-display text-xl sm:text-2xl text-[#111]">
              TRAVEL OUTFITS
            </span>

            {/* Desktop nav */}
            <nav className="hidden sm:flex items-center gap-8">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-sm font-medium tracking-wide transition-colors pb-0.5 ${
                    activeTab === tab.id
                      ? "text-[#111] border-b-2 border-[#111]"
                      : "text-[#9B9390] hover:text-[#111]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-xs text-[#9B9390] hover:text-[#111] transition-colors tracking-wide uppercase"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </form>
          </div>

          {/* Mobile nav */}
          <nav className="flex sm:hidden border-t border-[#EDE8DF]">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 text-xs font-medium tracking-wide py-2.5 transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "text-[#111] border-[#111]"
                    : "text-[#9B9390] border-transparent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {activeTab === "wardrobe" && <Wardrobe />}
        {activeTab === "builder" && <OutfitBuilder />}
        {activeTab === "planner" && <TravelPlanner />}
      </main>
    </div>
  );
}
