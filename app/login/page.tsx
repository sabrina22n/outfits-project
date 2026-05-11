"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#EDE8DF] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl text-[#111]">TRAVEL OUTFITS</h1>
          <p className="text-sm text-[#9B9390] mt-2 tracking-wide">
            Ingresá para acceder a tu guardarropa
          </p>
        </div>

        {/* Form */}
        <form action={action} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-[10px] font-medium text-[#6B6560] uppercase tracking-widest mb-1.5"
            >
              Usuario
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="w-full border border-[#D4CEC6] bg-white px-4 py-3 text-sm text-[#111] focus:outline-none focus:border-[#111] transition-colors placeholder:text-[#C8C0B0]"
              placeholder="Tu usuario"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[10px] font-medium text-[#6B6560] uppercase tracking-widest mb-1.5"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="w-full border border-[#D4CEC6] bg-white px-4 py-3 text-sm text-[#111] focus:outline-none focus:border-[#111] transition-colors placeholder:text-[#C8C0B0] pr-11"
                placeholder="Tu contraseña"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9390] hover:text-[#111] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {state?.error && (
            <p className="text-red-500 text-xs tracking-wide">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-[#111] text-white py-3 text-xs font-medium tracking-widest uppercase hover:bg-[#333] disabled:opacity-50 transition-colors mt-2"
          >
            {pending ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
