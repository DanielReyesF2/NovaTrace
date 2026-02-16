"use client";

import { useState, useMemo } from "react";
import {
  MEXICO_OUTLINE,
  ACTIVE_STATES,
  PLANT_LOCATION,
  STATE_ORIGINS,
} from "./mexicoStates";

interface BatchOrigin {
  feedstockOrigin: string;
  feedstockWeight: number;
  feedstockType: string;
  code: string;
  status: string;
}

interface MexicoTraceabilityMapProps {
  batches: BatchOrigin[];
}

interface StateAgg {
  name: string;
  totalKg: number;
  batchCount: number;
  types: Set<string>;
  pctOfTotal: number;
}

export function MexicoTraceabilityMap({ batches }: MexicoTraceabilityMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const { stateData, totalKg, maxKg } = useMemo(() => {
    const agg = new Map<string, StateAgg>();
    let total = 0;

    batches.forEach((b) => {
      const stateId = STATE_ORIGINS[b.feedstockOrigin];
      if (!stateId) return;
      total += b.feedstockWeight;

      if (!agg.has(stateId)) {
        const stateInfo = ACTIVE_STATES.find((s) => s.id === stateId);
        agg.set(stateId, {
          name: stateInfo?.name ?? stateId,
          totalKg: 0,
          batchCount: 0,
          types: new Set(),
          pctOfTotal: 0,
        });
      }
      const entry = agg.get(stateId)!;
      entry.totalKg += b.feedstockWeight;
      entry.batchCount += 1;
      entry.types.add(b.feedstockType);
    });

    let mx = 0;
    agg.forEach((v) => {
      v.pctOfTotal = total > 0 ? (v.totalKg / total) * 100 : 0;
      if (v.totalKg > mx) mx = v.totalKg;
    });

    return { stateData: agg, totalKg: total, maxKg: mx };
  }, [batches]);

  const getStateOpacity = (stateId: string): number => {
    const data = stateData.get(stateId);
    if (!data || maxKg === 0) return 0.15;
    return 0.25 + (data.totalKg / maxKg) * 0.6;
  };

  const handleMouseEnter = (stateId: string, cx: number, cy: number) => {
    setHoveredState(stateId);
    setTooltipPos({ x: cx, y: cy - 50 });
  };

  const tooltipData = hoveredState ? stateData.get(hoveredState) : null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-eco-ink">
          Trazabilidad
        </h1>
        <p className="text-xs text-eco-muted mt-1">
          Origen de materiales · Red de recolección
        </p>
      </div>

      <div className="bg-eco-surface border border-eco-border rounded-xl p-6">
        <h3 className="text-[10px] tracking-[2px] text-eco-muted uppercase mb-4">
          Mapa de Orígenes — México
        </h3>

        <div className="relative">
          <svg viewBox="30 80 560 300" className="w-full" style={{ maxHeight: "450px" }}>
            {/* Mexico outline */}
            <path
              d={MEXICO_OUTLINE}
              fill="rgba(39,57,73,0.03)"
              stroke="rgba(39,57,73,0.12)"
              strokeWidth="1.5"
            />

            {/* Active states */}
            {ACTIVE_STATES.map((state) => {
              const isHovered = hoveredState === state.id;
              const opacity = getStateOpacity(state.id);

              return (
                <g key={state.id}>
                  {/* State shape */}
                  <path
                    d={state.path}
                    fill={`rgba(181,233,81,${opacity})`}
                    stroke={isHovered ? "#3d7a0a" : "rgba(61,122,10,0.4)"}
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() =>
                      handleMouseEnter(state.id, state.centroid[0], state.centroid[1])
                    }
                    onMouseLeave={() => setHoveredState(null)}
                  />

                  {/* Flow line to plant */}
                  <line
                    x1={state.centroid[0]}
                    y1={state.centroid[1]}
                    x2={PLANT_LOCATION[0]}
                    y2={PLANT_LOCATION[1]}
                    stroke="rgba(181,233,81,0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                    className="flow-dash"
                  />

                  {/* Pulsing dot at state origin */}
                  <circle
                    cx={state.centroid[0]}
                    cy={state.centroid[1]}
                    r={isHovered ? 6 : 4}
                    fill="#b5e951"
                    stroke="#3d7a0a"
                    strokeWidth="1.5"
                    className="transition-all duration-200"
                  />
                  <circle
                    cx={state.centroid[0]}
                    cy={state.centroid[1]}
                    r="8"
                    fill="none"
                    stroke="#b5e951"
                    strokeWidth="1"
                    opacity="0.4"
                  >
                    <animate
                      attributeName="r"
                      values="6;14;6"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.6;0;0.6"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>

                  {/* State label */}
                  <text
                    x={state.centroid[0]}
                    y={state.centroid[1] - 12}
                    textAnchor="middle"
                    fill="rgba(39,57,73,0.6)"
                    fontSize="8"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="600"
                  >
                    {state.name}
                  </text>
                </g>
              );
            })}

            {/* Plant marker */}
            <g>
              <rect
                x={PLANT_LOCATION[0] - 10}
                y={PLANT_LOCATION[1] - 10}
                width="20"
                height="20"
                rx="4"
                fill="#273949"
                stroke="#b5e951"
                strokeWidth="2"
              />
              <text
                x={PLANT_LOCATION[0]}
                y={PLANT_LOCATION[1] + 4}
                textAnchor="middle"
                fill="#b5e951"
                fontSize="12"
                fontWeight="bold"
              >
                E
              </text>
              <text
                x={PLANT_LOCATION[0]}
                y={PLANT_LOCATION[1] + 22}
                textAnchor="middle"
                fill="#273949"
                fontSize="7"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="700"
              >
                PLANTA ECONOVA
              </text>
            </g>

            {/* Tooltip */}
            {tooltipData && (
              <g>
                <rect
                  x={tooltipPos.x - 70}
                  y={tooltipPos.y - 35}
                  width="140"
                  height="40"
                  rx="6"
                  fill="#273949"
                  stroke="rgba(181,233,81,0.3)"
                  strokeWidth="1"
                />
                <text
                  x={tooltipPos.x}
                  y={tooltipPos.y - 18}
                  textAnchor="middle"
                  fill="#b5e951"
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="700"
                >
                  {tooltipData.name}
                </text>
                <text
                  x={tooltipPos.x}
                  y={tooltipPos.y - 5}
                  textAnchor="middle"
                  fill="white"
                  fontSize="8"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {tooltipData.totalKg} kg · {tooltipData.batchCount} lotes · {tooltipData.pctOfTotal.toFixed(0)}%
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 text-[9px] text-eco-muted">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: "rgba(181,233,81,0.5)" }} />
            Origen de material
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-eco-navy" />
            Planta EcoNova
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-px" style={{ borderTop: "1.5px dashed rgba(181,233,81,0.5)" }} />
            Flujo de material
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-eco-surface border border-eco-border rounded-xl p-5">
        <h3 className="text-[10px] tracking-[2px] text-eco-muted uppercase mb-4">
          Detalle por Estado
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-[10px] text-eco-muted border-b border-eco-border uppercase tracking-wider">
                <th className="py-2.5 px-2 text-left">Estado</th>
                <th className="py-2.5 px-2 text-right">Lotes</th>
                <th className="py-2.5 px-2 text-right">Peso Total</th>
                <th className="py-2.5 px-2 text-left">Tipos</th>
                <th className="py-2.5 px-2 text-right">% del Total</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(stateData.entries())
                .sort(([, a], [, b]) => b.totalKg - a.totalKg)
                .map(([id, data]) => (
                  <tr
                    key={id}
                    className="border-b border-eco-border/50 hover:bg-eco-surface-2/30 transition-colors"
                    onMouseEnter={() => setHoveredState(id)}
                    onMouseLeave={() => setHoveredState(null)}
                  >
                    <td className="py-2.5 px-2 font-semibold text-eco-ink">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            background: `rgba(181,233,81,${getStateOpacity(id)})`,
                            border: "1px solid rgba(61,122,10,0.4)",
                          }}
                        />
                        {data.name}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right">{data.batchCount}</td>
                    <td className="py-2.5 px-2 text-right font-semibold">
                      {data.totalKg} kg
                    </td>
                    <td className="py-2.5 px-2 text-eco-muted text-[10px]">
                      {Array.from(data.types).join(", ")}
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-12 h-1.5 bg-eco-surface-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${data.pctOfTotal}%`,
                              background: "#b5e951",
                            }}
                          />
                        </div>
                        <span className="font-semibold" style={{ color: "#3d7a0a" }}>
                          {data.pctOfTotal.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
