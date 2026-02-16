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
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: StateAgg } | null>(null);

  const { stateData, maxKg } = useMemo(() => {
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

  const getFill = useCallback(
    (name: string): string => {
      const data = stateData.get(name);
      if (!data || maxKg === 0) {
        return ACTIVE_STATE_NAMES.has(name)
          ? "rgba(181,233,81,0.18)"
          : "rgba(39,57,73,0.04)";
      }
      const intensity = 0.25 + (data.totalKg / maxKg) * 0.55;
      return `rgba(181,233,81,${intensity})`;
    },
    [stateData, maxKg]
  );

  const getStroke = (name: string): string => {
    if (hoveredState === name) return "#3d7a0a";
    if (ACTIVE_STATE_NAMES.has(name)) return "rgba(61,122,10,0.5)";
    return "rgba(39,57,73,0.12)";
  };

  const getStrokeWidth = (name: string): number => {
    if (hoveredState === name) return 1.8;
    if (ACTIVE_STATE_NAMES.has(name)) return 0.8;
    return 0.3;
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

      <div className="bg-eco-surface border border-eco-border rounded-xl p-6 relative">
        <h3 className="text-[10px] tracking-[2px] text-eco-muted uppercase mb-4">
          Mapa de Orígenes — México
        </h3>

        <div className="relative" onMouseMove={handleMouseMove}>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              center: [-102, 23.5],
              scale: 1600,
            }}
            width={800}
            height={520}
            style={{ width: "100%", height: "auto", maxHeight: "520px" }}
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

            {/* Flow lines from active states to plant */}
            {Array.from(stateData.keys()).map((name) => {
              const coords = STATE_COORDS[name];
              if (!coords) return null;
              return (
                <Line
                  key={`flow-${name}`}
                  from={coords}
                  to={PLANT_COORDS}
                  stroke="rgba(181,233,81,0.5)"
                  strokeWidth={1.5}
                  strokeDasharray="5 3"
                  className="flow-dash"
                />
              );
            })}

            {/* Origin markers */}
            {Array.from(stateData.entries()).map(([name, data]) => {
              const coords = STATE_COORDS[name];
              if (!coords) return null;
              const isHovered = hoveredState === name;
              return (
                <Marker key={`marker-${name}`} coordinates={coords}>
                  {/* Pulse ring */}
                  <circle
                    r={8}
                    fill="none"
                    stroke="#b5e951"
                    strokeWidth={1}
                    opacity={0.4}
                  >
                    <animate
                      attributeName="r"
                      values="5;12;5"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.5;0;0.5"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  {/* Dot */}
                  <circle
                    r={isHovered ? 5 : 3.5}
                    fill="#b5e951"
                    stroke="#3d7a0a"
                    strokeWidth={1.5}
                    style={{ transition: "r 0.2s" }}
                  />
                  {/* Label */}
                  <text
                    y={-10}
                    textAnchor="middle"
                    fontSize={7}
                    fontFamily="'JetBrains Mono', monospace"
                    fontWeight={600}
                    fill="rgba(39,57,73,0.7)"
                  >
                    {name}
                  </text>
                  {/* Weight label */}
                  <text
                    y={14}
                    textAnchor="middle"
                    fontSize={6}
                    fontFamily="'JetBrains Mono', monospace"
                    fontWeight={700}
                    fill="#3d7a0a"
                  >
                    {data.totalKg} kg
                  </text>
                </Marker>
              );
            })}

            {/* Plant marker */}
            <Marker coordinates={PLANT_COORDS}>
              <rect
                x={-11}
                y={-11}
                width={22}
                height={22}
                rx={5}
                fill="#273949"
                stroke="#b5e951"
                strokeWidth={2}
              />
              <text
                textAnchor="middle"
                y={5}
                fill="#b5e951"
                fontSize={13}
                fontWeight="bold"
                fontFamily="'JetBrains Mono', monospace"
              >
                E
              </text>
              <text
                textAnchor="middle"
                y={24}
                fill="#273949"
                fontSize={6}
                fontWeight={700}
                fontFamily="'JetBrains Mono', monospace"
              >
                PLANTA ECONOVA
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
            <div className="w-3 h-3 rounded-sm" style={{ background: "rgba(181,233,81,0.18)" }} />
            Estado sin datos
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
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
