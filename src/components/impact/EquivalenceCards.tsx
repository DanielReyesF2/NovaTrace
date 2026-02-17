"use client";

import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

interface EquivalenceCardsProps {
  co2Avoided: number; // kg
}

export function EquivalenceCards({ co2Avoided }: EquivalenceCardsProps) {
  const equivalences = [
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
          <path d="M24 44V20" stroke="#3d7a0a" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M24 20c-8-2-14-10-10-18 6 4 10 10 10 18z" fill="#b5e951" fillOpacity="0.3" stroke="#3d7a0a" strokeWidth="1.5" />
          <path d="M24 20c8-2 14-10 10-18-6 4-10 10-10 18z" fill="#b5e951" fillOpacity="0.3" stroke="#3d7a0a" strokeWidth="1.5" />
          <path d="M24 28c-6-1-10-6-8-12 4 2 8 6 8 12z" fill="#b5e951" fillOpacity="0.5" stroke="#3d7a0a" strokeWidth="1.5" />
          <path d="M24 28c6-1 10-6 8-12-4 2-8 6-8 12z" fill="#b5e951" fillOpacity="0.5" stroke="#3d7a0a" strokeWidth="1.5" />
        </svg>
      ),
      value: Math.round(co2Avoided / 22),
      label: "Árboles absorbiendo\nCO₂ por 1 año",
      note: "1 árbol ≈ 22 kg CO₂/año",
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
          <rect x="8" y="22" width="32" height="12" rx="4" stroke="#273949" strokeWidth="1.5" />
          <circle cx="14" cy="38" r="4" stroke="#273949" strokeWidth="1.5" />
          <circle cx="34" cy="38" r="4" stroke="#273949" strokeWidth="1.5" />
          <path d="M8 22l4-8h14l6 8" stroke="#273949" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="26" y1="14" x2="26" y2="22" stroke="#273949" strokeWidth="1.5" />
        </svg>
      ),
      value: Math.round(co2Avoided / 0.247),
      label: "Km sin recorrer\nen automóvil",
      note: "Auto promedio: 0.247 kg CO₂/km",
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
          <path d="M14 42V24l10-12 10 12v18H14z" stroke="#E8700A" strokeWidth="1.5" fill="rgba(232,112,10,0.08)" />
          <rect x="20" y="30" width="8" height="12" rx="1" stroke="#E8700A" strokeWidth="1.5" />
          <rect x="18" y="18" width="4" height="4" rx="0.5" stroke="#E8700A" strokeWidth="1" />
          <rect x="26" y="18" width="4" height="4" rx="0.5" stroke="#E8700A" strokeWidth="1" />
        </svg>
      ),
      value: Math.round(co2Avoided / 2.8),
      label: "Días de electricidad\nde un hogar mexicano",
      note: "Hogar MX: ~2.8 kg CO₂/día",
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
          <path d="M10 30c0-8 6-14 14-14s14 6 14 14" stroke="#2D8CF0" strokeWidth="1.5" />
          <path d="M6 30h36" stroke="#2D8CF0" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M20 16l4-8 4 8" stroke="#2D8CF0" strokeWidth="1.5" fill="rgba(45,140,240,0.1)" />
          <path d="M16 30v6" stroke="#2D8CF0" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M32 30v6" stroke="#2D8CF0" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      value: Math.round(co2Avoided / 255),
      label: "Vuelos CDMX-Mérida\nevitados",
      note: "~255 kg CO₂ por vuelo",
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
          <path d="M20 6a4 4 0 018 0v4h-8V6z" stroke="#7C5CFC" strokeWidth="1.5" />
          <rect x="16" y="10" width="16" height="28" rx="4" stroke="#7C5CFC" strokeWidth="1.5" fill="rgba(124,92,252,0.08)" />
          <path d="M20 38h8" stroke="#7C5CFC" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M24 10v4" stroke="#7C5CFC" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      value: Math.round((co2Avoided / 0.04)),
      label: "Botellas PET\ndesviadas de quema",
      note: "1 botella PET ≈ 0.04 kg CO₂",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] p-5">
      <h3 className="text-[11px] tracking-[2px] text-eco-muted uppercase font-medium mb-4">
        Equivalencias de Impacto
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {equivalences.map((eq, i) => (
          <div
            key={i}
            className="text-center p-4 bg-eco-surface-2/40 rounded-xl card-hover"
          >
            <div className="flex justify-center mb-2">{eq.icon}</div>
            <AnimatedCounter
              value={eq.value}
              className="font-mono text-xl font-semibold text-eco-ink block"
              duration={1500}
            />
            <div className="text-[10px] text-eco-muted leading-tight mt-1 whitespace-pre-line">
              {eq.label}
            </div>
            <div className="text-[8px] text-eco-muted-2 mt-1">{eq.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
