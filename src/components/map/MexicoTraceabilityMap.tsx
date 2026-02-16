"use client";

import { useState, useMemo, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
  ZoomableGroup,
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
  const [position, setPosition] = useState({ coordinates: [-100.5, 20] as [number, number], zoom: 2 });
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

  const handleZoomIn = () => {
    setPosition((p) => ({ ...p, zoom: Math.min(p.zoom * 1.4, 8) }));
  };

  const handleZoomOut = () => {
    setPosition((p) => ({ ...p, zoom: Math.max(p.zoom / 1.4, 0.8) }));
  };

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
    <div className="bg-eco-surface border border-eco-border rounded-xl p-5 h-full flex flex-col relative">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] tracking-[2px] text-eco-muted uppercase">
          Red de Orígenes
        </h3>
        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomIn}
            className="w-6 h-6 rounded-md border border-eco-border flex items-center justify-center text-eco-muted hover:text-eco-ink hover:border-eco-border-strong transition-colors text-xs font-mono"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="w-6 h-6 rounded-md border border-eco-border flex items-center justify-center text-eco-muted hover:text-eco-ink hover:border-eco-border-strong transition-colors text-xs font-mono"
          >
            −
          </button>
        </div>
      </div>

      <div className="flex-1 relative" onMouseMove={handleMouseMove} style={{ cursor: "grab" }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ center: [-102, 23.5], scale: 1600 }}
          width={800}
          height={520}
          style={{ width: "100%", height: "auto" }}
        >
          <ZoomableGroup
            center={position.coordinates}
            zoom={position.zoom}
            minZoom={0.8}
            maxZoom={8}
            onMoveEnd={({ coordinates, zoom }) => setPosition({ coordinates, zoom })}
          >
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

            {/* Neural flow lines — thin blue glow */}
            {flowEntries.map(({ name, coords }) => (
              <Line
                key={`glow-${name}`}
                from={coords}
                to={PLANT_COORDS}
                stroke="rgba(45,140,240,0.5)"
                strokeWidth={1.5}
                className="neural-glow-line"
              />
            ))}

            {/* Flow lines — dashed green on top */}
            {flowEntries.map(({ name, coords }) => (
              <Line
                key={`flow-${name}`}
                from={coords}
                to={PLANT_COORDS}
                stroke="rgba(181,233,81,0.5)"
                strokeWidth={1.2}
                strokeDasharray="5 3"
                className="flow-dash"
              />
            ))}

            {/* Origin markers */}
            {flowEntries.map(({ name, data, coords }) => {
              const isHovered = hoveredState === name;
              return (
                <Marker key={`marker-${name}`} coordinates={coords}>
                  <circle r={10} fill="none" stroke="#b5e951" strokeWidth={0.8} opacity={0.3}>
                    <animate attributeName="r" values="5;14;5" dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                  <circle r={6} fill="rgba(181,233,81,0.12)" />
                  <circle
                    r={isHovered ? 5 : 3.5}
                    fill="#b5e951" stroke="#3d7a0a" strokeWidth={1.5}
                    style={{ transition: "all 0.2s" }}
                  />
                  <text y={-12} textAnchor="middle" fontSize={7}
                    fontFamily="'JetBrains Mono', monospace" fontWeight={600}
                    fill="rgba(39,57,73,0.7)">
                    {name}
                  </text>
                  <text y={16} textAnchor="middle" fontSize={6}
                    fontFamily="'JetBrains Mono', monospace" fontWeight={700}
                    fill="#3d7a0a">
                    {data.totalKg} kg
                  </text>
                </Marker>
              );
            })}

            {/* Plant marker */}
            <Marker coordinates={PLANT_COORDS}>
              <circle r={18} fill="rgba(181,233,81,0.06)">
                <animate attributeName="r" values="16;22;16" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle r={14} fill="#273949" stroke="#b5e951" strokeWidth={2} />
              <g fill="none" stroke="#b5e951" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round">
                <rect x={-7} y={-2} width={14} height={9} rx={0.5} />
                <path d="M-7,-2 L-4,-6 L-4,-2 L0,-6 L0,-2 L4,-6 L4,-2" />
                <rect x={5} y={-8} width={3} height={6} rx={0.3} />
                <rect x={-2} y={2} width={4} height={5} rx={0.3} fill="rgba(181,233,81,0.3)" />
              </g>
              <text textAnchor="middle" y={26} fill="#273949" fontSize={5.5}
                fontWeight={700} fontFamily="'JetBrains Mono', monospace">
                PLANTA ECONOVA
              </text>
              <text textAnchor="middle" y={33} fill="rgba(39,57,73,0.5)"
                fontSize={4.5} fontFamily="'JetBrains Mono', monospace">
                Lerma, Edo. Méx.
              </text>
            </Marker>
          </ZoomableGroup>
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
      <div className="flex items-center gap-4 mt-3 text-[8px] text-eco-muted">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "rgba(181,233,81,0.5)" }} />
          Origen
        </div>
        <div className="flex items-center gap-1">
          <svg width="14" height="4" viewBox="0 0 14 4">
            <line x1="0" y1="2" x2="14" y2="2" stroke="rgba(45,140,240,0.6)" strokeWidth="1.5" />
          </svg>
          Flujo
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-eco-navy" />
          Planta
        </div>
        <div className="text-[7px] text-eco-muted/50 ml-auto">scroll para zoom · drag para mover</div>
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
