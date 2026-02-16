"use client";

import { useState, useMemo, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
} from "react-simple-maps";
import {
  STATE_ORIGINS,
  STATE_COORDS,
  PLANT_COORDS,
  ACTIVE_STATE_NAMES,
} from "./mexicoStates";

const GEO_URL = "/mexico-states.json";

interface BatchOrigin {
  feedstockOrigin: string;
  feedstockWeight: number;
  feedstockType: string;
  code: string;
  status: string;
}

interface StateAgg {
  name: string;
  totalKg: number;
  batchCount: number;
  types: Set<string>;
  pctOfTotal: number;
}

function useMapData(batches: BatchOrigin[]) {
  return useMemo(() => {
    const agg = new Map<string, StateAgg>();
    let total = 0;

    batches.forEach((b) => {
      const stateName = STATE_ORIGINS[b.feedstockOrigin];
      if (!stateName) return;
      total += b.feedstockWeight;

      if (!agg.has(stateName)) {
        agg.set(stateName, {
          name: stateName,
          totalKg: 0,
          batchCount: 0,
          types: new Set(),
          pctOfTotal: 0,
        });
      }
      const entry = agg.get(stateName)!;
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
}

/* ═══ Reusable Map Card (embeddable in any page) ═══ */
export function MexicoMapCard({ batches }: { batches: BatchOrigin[] }) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: StateAgg } | null>(null);
  const { stateData, maxKg } = useMapData(batches);

  const getFill = useCallback(
    (name: string): string => {
      const data = stateData.get(name);
      if (!data || maxKg === 0) {
        if (ACTIVE_STATE_NAMES.has(name)) return "rgba(181,233,81,0.12)";
        return hoveredState === name ? "rgba(39,57,73,0.05)" : "rgba(39,57,73,0.02)";
      }
      const intensity = 0.18 + (data.totalKg / maxKg) * 0.5;
      return `rgba(181,233,81,${intensity})`;
    },
    [stateData, maxKg, hoveredState]
  );

  const getStroke = (name: string): string => {
    if (hoveredState === name) return "#3d7a0a";
    if (ACTIVE_STATE_NAMES.has(name)) return "rgba(61,122,10,0.35)";
    return "rgba(39,57,73,0.06)";
  };

  const getStrokeWidth = (name: string): number => {
    if (hoveredState === name) return 1.8;
    if (ACTIVE_STATE_NAMES.has(name)) return 0.7;
    return 0.2;
  };

  const handleMouseEnter = (name: string, event: React.MouseEvent) => {
    setHoveredState(name);
    const data = stateData.get(name);
    if (data) {
      setTooltip({ x: event.clientX, y: event.clientY, data });
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (tooltip) {
      setTooltip((prev) => prev ? { ...prev, x: event.clientX, y: event.clientY } : null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredState(null);
    setTooltip(null);
  };

  /* Build flow line paths for animated particles */
  const flowEntries = useMemo(() => {
    return Array.from(stateData.entries())
      .map(([name, data]) => {
        const coords = STATE_COORDS[name];
        if (!coords) return null;
        return { name, data, coords };
      })
      .filter(Boolean) as { name: string; data: StateAgg; coords: [number, number] }[];
  }, [stateData]);

  return (
    <div className="bg-eco-surface border border-eco-border rounded-xl p-6 relative">
      <h3 className="text-[10px] tracking-[2px] text-eco-muted uppercase mb-4">
        Red de Orígenes — México
      </h3>

      <div className="relative" onMouseMove={handleMouseMove}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ center: [-100.5, 20.0], scale: 3200 }}
          width={800}
          height={500}
          style={{ width: "100%", height: "auto", maxHeight: "500px" }}
        >
          {/* SVG Defs for glow effects */}
          <defs>
            <filter id="neuralGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="markerGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#b5e951" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#3d7a0a" stopOpacity={0.6} />
            </linearGradient>
          </defs>

          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name = geo.properties.name as string;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getFill(name)}
                    stroke={getStroke(name)}
                    strokeWidth={getStrokeWidth(name)}
                    style={{
                      default: { outline: "none", transition: "all 0.3s" },
                      hover: { outline: "none" },
                      pressed: { outline: "none" },
                    }}
                    onMouseEnter={(e) => handleMouseEnter(name, e)}
                    onMouseLeave={handleMouseLeave}
                  />
                );
              })
            }
          </Geographies>

          {/* Neural flow lines — glow layer underneath */}
          {flowEntries.map(({ name, coords }) => (
            <Line
              key={`glow-${name}`}
              from={coords}
              to={PLANT_COORDS}
              stroke="rgba(45,140,240,0.3)"
              strokeWidth={8}
              className="neural-glow"
            />
          ))}

          {/* Neural flow lines — main dashed lines */}
          {flowEntries.map(({ name, coords }) => (
            <Line
              key={`flow-${name}`}
              from={coords}
              to={PLANT_COORDS}
              stroke="rgba(181,233,81,0.5)"
              strokeWidth={1.8}
              strokeDasharray="6 4"
              className="flow-dash"
            />
          ))}

          {/* Animated particles traveling along each flow line */}
          {flowEntries.map(({ name, coords }) => {
            const [x1, y1] = coords;
            const [x2, y2] = PLANT_COORDS;
            return [0, 1, 2].map((i) => (
              <Marker key={`particle-${name}-${i}`} coordinates={coords}>
                <circle r={2.5} fill="#b5e951" opacity={0}>
                  <animate
                    attributeName="opacity"
                    values="0;0.9;0.9;0"
                    dur={`${2.5 + i * 0.4}s`}
                    begin={`${i * 0.8}s`}
                    repeatCount="indefinite"
                  />
                  <animateMotion
                    dur={`${2.5 + i * 0.4}s`}
                    begin={`${i * 0.8}s`}
                    repeatCount="indefinite"
                    path={`M0,0 L${(x2 - x1) * 18},${(y1 - y2) * 18}`}
                  />
                </circle>
              </Marker>
            ));
          })}

          {/* Origin markers */}
          {flowEntries.map(({ name, data, coords }) => {
            const isHovered = hoveredState === name;
            return (
              <Marker key={`marker-${name}`} coordinates={coords}>
                {/* Outer pulse ring */}
                <circle r={10} fill="none" stroke="#b5e951" strokeWidth={1} opacity={0.3}>
                  <animate attributeName="r" values="6;16;6" dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite" />
                </circle>
                {/* Second pulse ring (offset) */}
                <circle r={10} fill="none" stroke="#b5e951" strokeWidth={0.5} opacity={0.2}>
                  <animate attributeName="r" values="6;14;6" dur="2.5s" begin="1.25s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" begin="1.25s" repeatCount="indefinite" />
                </circle>
                {/* Glow behind dot */}
                <circle r={8} fill="rgba(181,233,81,0.15)" filter="url(#markerGlow)" />
                {/* Main dot */}
                <circle
                  r={isHovered ? 6 : 4.5}
                  fill="#b5e951" stroke="#3d7a0a" strokeWidth={1.5}
                  style={{ transition: "all 0.2s" }}
                />
                <text y={-14} textAnchor="middle" fontSize={8}
                  fontFamily="'JetBrains Mono', monospace" fontWeight={600}
                  fill="rgba(39,57,73,0.75)">
                  {name}
                </text>
                <text y={18} textAnchor="middle" fontSize={7}
                  fontFamily="'JetBrains Mono', monospace" fontWeight={700}
                  fill="#3d7a0a">
                  {data.totalKg} kg
                </text>
              </Marker>
            );
          })}

          {/* Plant marker — larger and more prominent */}
          <Marker coordinates={PLANT_COORDS}>
            {/* Plant glow */}
            <circle r={22} fill="rgba(181,233,81,0.08)" filter="url(#markerGlow)">
              <animate attributeName="r" values="20;26;20" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle r={18} fill="#273949" stroke="#b5e951" strokeWidth={2.5} />
            <g fill="none" stroke="#b5e951" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <rect x={-8} y={-3} width={16} height={11} rx={0.5} />
              <path d="M-8,-3 L-5,-7 L-5,-3 L0,-7 L0,-3 L5,-7 L5,-3" />
              <rect x={6} y={-10} width={3.5} height={7} rx={0.3} />
              <rect x={-2.5} y={2} width={5} height={6} rx={0.3} fill="rgba(181,233,81,0.3)" />
            </g>
            <text textAnchor="middle" y={32} fill="#273949" fontSize={7}
              fontWeight={700} fontFamily="'JetBrains Mono', monospace">
              PLANTA ECONOVA
            </text>
            <text textAnchor="middle" y={40} fill="rgba(39,57,73,0.5)"
              fontSize={5.5} fontFamily="'JetBrains Mono', monospace">
              Lerma, Edo. Méx.
            </text>
          </Marker>
        </ComposableMap>

        {/* HTML Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 pointer-events-none"
            style={{ left: tooltip.x + 12, top: tooltip.y - 60 }}
          >
            <div className="bg-eco-navy text-white px-3 py-2 rounded-lg shadow-lg border border-eco-green/20">
              <div className="font-mono text-xs font-bold text-eco-green">
                {tooltip.data.name}
              </div>
              <div className="font-mono text-[10px] mt-0.5 text-white/80">
                {tooltip.data.totalKg} kg · {tooltip.data.batchCount} lotes · {tooltip.data.pctOfTotal.toFixed(0)}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-4 text-[9px] text-eco-muted">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: "rgba(181,233,81,0.6)" }} />
          Origen de material
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="18" height="6" viewBox="0 0 18 6">
            <line x1="0" y1="3" x2="18" y2="3" stroke="rgba(181,233,81,0.5)" strokeWidth="1.5" strokeDasharray="4 3" />
            <circle cx="9" cy="3" r="2" fill="#b5e951" opacity="0.7" />
          </svg>
          Flujo neuronal
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-eco-navy" />
          Planta EcoNova
        </div>
      </div>
    </div>
  );
}

/* ═══ Full Page (used by /map route) ═══ */
export function MexicoTraceabilityMap({ batches }: { batches: BatchOrigin[] }) {
  const { stateData, maxKg } = useMapData(batches);
  const [hoveredState, setHoveredState] = useState<string | null>(null);

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

      <MexicoMapCard batches={batches} />

      {/* Detail Table */}
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
                .map(([name, data]) => {
                  const intensity = maxKg > 0 ? 0.25 + (data.totalKg / maxKg) * 0.55 : 0.15;
                  return (
                    <tr
                      key={name}
                      className="border-b border-eco-border/50 hover:bg-eco-surface-2/30 transition-colors"
                      onMouseEnter={() => setHoveredState(name)}
                      onMouseLeave={() => setHoveredState(null)}
                    >
                      <td className="py-2.5 px-2 font-semibold text-eco-ink">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              background: `rgba(181,233,81,${intensity})`,
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
                              style={{ width: `${data.pctOfTotal}%`, background: "#b5e951" }}
                            />
                          </div>
                          <span className="font-semibold" style={{ color: "#3d7a0a" }}>
                            {data.pctOfTotal.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
