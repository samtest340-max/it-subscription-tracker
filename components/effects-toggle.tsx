"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"

export type EffectsMode = "Full" | "Reduced" | "Off"

export function EffectsToggle({ value, onChange }: { value: EffectsMode; onChange: (value: EffectsMode) => void }) {
  return <label className="hidden items-center gap-2 rounded-xl border border-[#dcebea] bg-white/70 px-3 py-2 text-xs font-semibold text-[#557078] shadow-sm lg:flex"><Sparkles size={14} className="text-[#176b71]" /><span>3D Effects</span><select value={value} onChange={(event) => onChange(event.target.value as EffectsMode)} className="bg-transparent font-bold text-[#176b71] outline-none"><option>Full</option><option>Reduced</option><option>Off</option></select></label>
}

export function useEffectsMode() {
  const [mode, setMode] = useState<EffectsMode>("Full")
  useEffect(() => { const saved = document.cookie.split(";").find((item) => item.trim().startsWith("dashboard-effects="))?.split("=")[1] as EffectsMode | undefined; const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches; const lowPower = navigator.hardwareConcurrency <= 4; const initial = saved ?? (prefersReduced || lowPower || window.innerWidth < 768 ? "Reduced" : "Full"); setMode(initial) }, [])
  const update = (next: EffectsMode) => { setMode(next); document.cookie = `dashboard-effects=${next};path=/;max-age=31536000;samesite=lax` }
  return [mode, update] as const
}
