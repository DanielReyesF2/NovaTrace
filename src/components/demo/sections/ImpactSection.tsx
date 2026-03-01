import type { PassportImpact } from "@/lib/demo/types";

export function ImpactSection({ data, accentColor }: { data: PassportImpact; accentColor: string }) {
  const reductionPct = data.comparisonBaseline > 0
    ? (data.co2Avoided / data.comparisonBaseline * 100)
    : 0;

  return (
    <div>
      <div className="text-center py-3 mb-3 rounded-xl" style={{ background: `linear-gradient(135deg, ${accentColor}10, ${accentColor}05)` }}>
        <div className="font-mono text-3xl font-bold" style={{ color: accentColor }}>
          {data.co2Avoided.toFixed(1)}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">kg CO₂eq evitados</div>
        {reductionPct > 0 && (
          <div className="text-[10px] font-semibold mt-1" style={{ color: accentColor }}>
            ↓ {reductionPct.toFixed(0)}% {data.comparisonLabel}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center py-2 bg-gray-50 rounded-lg">
          <div className="font-mono text-lg font-bold text-gray-800">{data.materialDiverted}</div>
          <div className="text-[10px] text-gray-500">kg material desviado</div>
        </div>
        <div className="text-center py-2 bg-gray-50 rounded-lg">
          <div className="font-mono text-lg font-bold" style={{ color: accentColor }}>{data.circularityIndex}%</div>
          <div className="text-[10px] text-gray-500">índice de circularidad</div>
        </div>
      </div>
      <p className="text-[8px] text-gray-400 italic mt-2">
        Metodología: ISO 14040/14044 · Comparación con producto convencional equivalente
      </p>
    </div>
  );
}
