"use client";

import { useMemo } from "react";

interface MaterialFlowDiagramProps {
  feedstockKg: number;
  contaminationPct: number;
  oilLiters: number;
}

export function MaterialFlowDiagram({
  feedstockKg,
  contaminationPct,
  oilLiters,
}: MaterialFlowDiagramProps) {
  const flows = useMemo(() => {
    const contaminationKg = feedstockKg * (contaminationPct / 100);
    const cleanPlasticKg = feedstockKg - contaminationKg;
    const oilKg = oilLiters * 0.85;
    const residueKg = cleanPlasticKg * 0.15; // ~15% residue
    const charKg = cleanPlasticKg * 0.1; // ~10% char
    const gasLossKg = cleanPlasticKg - oilKg - residueKg - charKg;

    return {
      feedstock: feedstockKg,
      contamination: contaminationKg,
      cleanPlastic: cleanPlasticKg,
      oil: oilKg,
      oilLiters,
      residue: residueKg,
      char: charKg,
      gasLoss: Math.max(0, gasLossKg),
    };
  }, [feedstockKg, contaminationPct, oilLiters]);

  // Width proportional to mass (max = feedstock width)
  const maxWidth = 60;
  const scale = (kg: number) => Math.max(4, (kg / flows.feedstock) * maxWidth);

  return (
    <div className="bg-eco-surface border border-eco-border rounded-xl p-5">
      <h3 className="text-[10px] tracking-[2px] text-eco-muted uppercase mb-1">
        Flujo de Materiales
      </h3>
      <p className="text-[10px] text-eco-muted-2 mb-4">
        Balance de masa — Feedstock a productos
      </p>

      <div className="overflow-x-auto">
        <svg viewBox="0 0 800 320" className="w-full" style={{ minWidth: "600px" }}>
          {/* Column labels */}
          <text x="60" y="20" textAnchor="middle" fill="rgba(39,57,73,0.35)" fontSize="9" fontFamily="JetBrains Mono" fontWeight="600">
            ENTRADA
          </text>
          <text x="250" y="20" textAnchor="middle" fill="rgba(39,57,73,0.35)" fontSize="9" fontFamily="JetBrains Mono" fontWeight="600">
            SEPARACIÓN
          </text>
          <text x="460" y="20" textAnchor="middle" fill="rgba(39,57,73,0.35)" fontSize="9" fontFamily="JetBrains Mono" fontWeight="600">
            PIRÓLISIS
          </text>
          <text x="680" y="20" textAnchor="middle" fill="rgba(39,57,73,0.35)" fontSize="9" fontFamily="JetBrains Mono" fontWeight="600">
            PRODUCTOS
          </text>

          {/* ── Feedstock node ── */}
          <rect x="20" y="110" width="80" height="80" rx="8" fill="rgba(39,57,73,0.08)" stroke="#273949" strokeWidth="1.5" />
          <text x="60" y="142" textAnchor="middle" fill="#273949" fontSize="10" fontFamily="JetBrains Mono" fontWeight="700">
            Feedstock
          </text>
          <text x="60" y="158" textAnchor="middle" fill="#273949" fontSize="13" fontFamily="JetBrains Mono" fontWeight="800">
            {flows.feedstock.toLocaleString()} kg
          </text>
          <text x="60" y="175" textAnchor="middle" fill="rgba(39,57,73,0.4)" fontSize="8" fontFamily="JetBrains Mono">
            100%
          </text>

          {/* ── Flow: Feedstock → Contamination (branch up) ── */}
          <path
            d={`M100,130 C160,130 180,65 210,65`}
            fill="none"
            stroke="#DC2626"
            strokeWidth={scale(flows.contamination)}
            strokeOpacity="0.25"
            className="flow-dash"
          />
          {/* Contamination node */}
          <rect x="210" y="40" width="80" height="50" rx="6" fill="rgba(220,38,38,0.06)" stroke="#DC2626" strokeWidth="1" />
          <text x="250" y="60" textAnchor="middle" fill="#DC2626" fontSize="9" fontFamily="JetBrains Mono" fontWeight="600">
            Contaminación
          </text>
          <text x="250" y="78" textAnchor="middle" fill="#DC2626" fontSize="11" fontFamily="JetBrains Mono" fontWeight="700">
            {flows.contamination.toFixed(0)} kg ({contaminationPct.toFixed(0)}%)
          </text>

          {/* ── Flow: Feedstock → Clean Plastic ── */}
          <path
            d={`M100,150 C160,150 180,150 210,150`}
            fill="none"
            stroke="#2D8CF0"
            strokeWidth={scale(flows.cleanPlastic)}
            strokeOpacity="0.3"
            className="flow-dash"
          />
          {/* Clean Plastic node */}
          <rect x="210" y="120" width="80" height="60" rx="6" fill="rgba(45,140,240,0.06)" stroke="#2D8CF0" strokeWidth="1.5" />
          <text x="250" y="142" textAnchor="middle" fill="#2D8CF0" fontSize="9" fontFamily="JetBrains Mono" fontWeight="600">
            Plástico Limpio
          </text>
          <text x="250" y="160" textAnchor="middle" fill="#2D8CF0" fontSize="12" fontFamily="JetBrains Mono" fontWeight="700">
            {flows.cleanPlastic.toFixed(0)} kg
          </text>
          <text x="250" y="174" textAnchor="middle" fill="rgba(45,140,240,0.5)" fontSize="8" fontFamily="JetBrains Mono">
            {((flows.cleanPlastic / flows.feedstock) * 100).toFixed(0)}%
          </text>

          {/* ── Pyrolysis reactor ── */}
          <path
            d={`M290,150 C350,150 380,150 410,150`}
            fill="none"
            stroke="#2D8CF0"
            strokeWidth={scale(flows.cleanPlastic)}
            strokeOpacity="0.2"
            className="flow-dash"
          />
          <rect x="410" y="105" width="100" height="90" rx="10" fill="rgba(232,112,10,0.06)" stroke="#E8700A" strokeWidth="2" />
          <text x="460" y="138" textAnchor="middle" fill="#E8700A" fontSize="10" fontFamily="JetBrains Mono" fontWeight="700">
            REACTOR
          </text>
          <text x="460" y="155" textAnchor="middle" fill="#E8700A" fontSize="8" fontFamily="JetBrains Mono">
            DY-500
          </text>
          <text x="460" y="172" textAnchor="middle" fill="rgba(232,112,10,0.5)" fontSize="8" fontFamily="JetBrains Mono">
            Pirólisis
          </text>
          <text x="460" y="185" textAnchor="middle" fill="rgba(232,112,10,0.5)" fontSize="7" fontFamily="JetBrains Mono">
            300-500°C
          </text>

          {/* ── Output: Oil (main) ── */}
          <path
            d={`M510,130 C560,130 590,80 630,80`}
            fill="none"
            stroke="#7C5CFC"
            strokeWidth={scale(flows.oil)}
            strokeOpacity="0.3"
            className="flow-dash"
          />
          <rect x="630" y="50" width="110" height="60" rx="8" fill="rgba(124,92,252,0.08)" stroke="#7C5CFC" strokeWidth="1.5" />
          <text x="685" y="70" textAnchor="middle" fill="#7C5CFC" fontSize="9" fontFamily="JetBrains Mono" fontWeight="600">
            Aceite Pirolítico
          </text>
          <text x="685" y="88" textAnchor="middle" fill="#7C5CFC" fontSize="13" fontFamily="JetBrains Mono" fontWeight="800">
            {flows.oilLiters.toFixed(0)} L
          </text>
          <text x="685" y="103" textAnchor="middle" fill="rgba(124,92,252,0.5)" fontSize="8" fontFamily="JetBrains Mono">
            ({flows.oil.toFixed(0)} kg)
          </text>

          {/* ── Output: Char ── */}
          <path
            d={`M510,160 C560,160 590,160 630,160`}
            fill="none"
            stroke="#3d7a0a"
            strokeWidth={scale(flows.char)}
            strokeOpacity="0.3"
            className="flow-dash"
          />
          <rect x="630" y="135" width="110" height="50" rx="6" fill="rgba(61,122,10,0.06)" stroke="#3d7a0a" strokeWidth="1" />
          <text x="685" y="155" textAnchor="middle" fill="#3d7a0a" fontSize="9" fontFamily="JetBrains Mono" fontWeight="600">
            Char (carbón)
          </text>
          <text x="685" y="173" textAnchor="middle" fill="#3d7a0a" fontSize="11" fontFamily="JetBrains Mono" fontWeight="700">
            {flows.char.toFixed(0)} kg
          </text>

          {/* ── Output: Residue ── */}
          <path
            d={`M510,180 C560,180 590,220 630,220`}
            fill="none"
            stroke="#E8700A"
            strokeWidth={scale(flows.residue)}
            strokeOpacity="0.2"
            className="flow-dash"
          />
          <rect x="630" y="200" width="110" height="50" rx="6" fill="rgba(232,112,10,0.04)" stroke="#E8700A" strokeWidth="1" strokeOpacity="0.5" />
          <text x="685" y="220" textAnchor="middle" fill="#E8700A" fontSize="9" fontFamily="JetBrains Mono" fontWeight="600">
            Residuo sólido
          </text>
          <text x="685" y="238" textAnchor="middle" fill="#E8700A" fontSize="11" fontFamily="JetBrains Mono" fontWeight="700">
            {flows.residue.toFixed(0)} kg
          </text>

          {/* ── Gas losses ── */}
          {flows.gasLoss > 0 && (
            <>
              <path
                d={`M510,185 C545,210 580,270 630,275`}
                fill="none"
                stroke="rgba(39,57,73,0.2)"
                strokeWidth={Math.max(2, scale(flows.gasLoss))}
                strokeDasharray="4 4"
              />
              <rect x="630" y="260" width="110" height="40" rx="6" fill="rgba(39,57,73,0.02)" stroke="rgba(39,57,73,0.1)" strokeWidth="1" />
              <text x="685" y="277" textAnchor="middle" fill="rgba(39,57,73,0.4)" fontSize="9" fontFamily="JetBrains Mono" fontWeight="600">
                Gases no condensables
              </text>
              <text x="685" y="293" textAnchor="middle" fill="rgba(39,57,73,0.4)" fontSize="10" fontFamily="JetBrains Mono" fontWeight="700">
                ~{flows.gasLoss.toFixed(0)} kg
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Balance summary */}
      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-eco-border flex-wrap">
        {[
          { label: "Entrada", value: `${flows.feedstock.toLocaleString()} kg`, color: "#273949" },
          { label: "Aceite", value: `${flows.oilLiters.toFixed(0)} L`, color: "#7C5CFC" },
          { label: "Char", value: `${flows.char.toFixed(0)} kg`, color: "#3d7a0a" },
          { label: "Residuo", value: `${flows.residue.toFixed(0)} kg`, color: "#E8700A" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-[10px]">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
            <span className="text-eco-muted">{item.label}:</span>
            <span className="font-mono font-semibold" style={{ color: item.color }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
