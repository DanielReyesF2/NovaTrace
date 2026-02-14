"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Area,
  ComposedChart,
} from "recharts";
import { EVENT_TYPE_CONFIG } from "./eventConfig";

interface Reading {
  timestamp: string;
  reactorTemp: number | null;
  controlTemp: number | null;
  steelTemp: number | null;
  chainTemp: number | null;
}

interface ProcessEvent {
  timestamp: string;
  type: string;
  detail: string;
}

interface ThermalChartProps {
  readings: Reading[];
  events?: ProcessEvent[];
}

const LINES = [
  { key: "reactor", name: "Reactor", color: "#E8700A", width: 2.5 },
  { key: "control", name: "Control", color: "#2D8CF0", width: 1.5 },
  { key: "steel", name: "Acero", color: "#7C5CFC", width: 1.5 },
  { key: "chain", name: "Cadena", color: "#3d7a0a", width: 1.5 },
] as const;

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(ms: number) {
  const mins = Math.round(ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-eco-border rounded-xl p-3.5 shadow-xl min-w-[180px]">
      <p className="text-[10px] text-eco-muted font-mono mb-2 pb-2 border-b border-eco-border">
        {formatTime(label)}
      </p>
      <div className="space-y-1.5">
        {payload
          .filter((e: any) => e.value !== null && e.value !== undefined)
          .map((entry: any) => (
            <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-eco-muted">{entry.name}</span>
              </div>
              <span
                className="font-mono font-bold tabular-nums"
                style={{ color: entry.color }}
              >
                {entry.value}°C
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function ThermalChart({ readings, events }: ThermalChartProps) {
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set());

  const chartData = useMemo(
    () =>
      readings.map((r) => ({
        timestamp: new Date(r.timestamp).getTime(),
        reactor: r.reactorTemp,
        control: r.controlTemp,
        steel: r.steelTemp,
        chain: r.chainTemp,
      })),
    [readings]
  );

  // Compute thermal stats
  const stats = useMemo(() => {
    const reactorTemps = readings
      .map((r) => r.reactorTemp)
      .filter((t): t is number => t !== null);
    if (reactorTemps.length === 0) return null;

    const maxTemp = Math.max(...reactorTemps);
    const avgTemp = reactorTemps.reduce((a, b) => a + b, 0) / reactorTemps.length;
    const timeRange =
      new Date(readings[readings.length - 1].timestamp).getTime() -
      new Date(readings[0].timestamp).getTime();

    // Time above 150°C (production zone)
    let productionMinutes = 0;
    for (let i = 1; i < readings.length; i++) {
      if ((readings[i].reactorTemp ?? 0) >= 150) {
        const dt =
          new Date(readings[i].timestamp).getTime() -
          new Date(readings[i - 1].timestamp).getTime();
        productionMinutes += dt / 60000;
      }
    }

    // Ramp rate to 150°C
    let rampMinutes = 0;
    for (let i = 0; i < readings.length; i++) {
      if ((readings[i].reactorTemp ?? 0) >= 150) {
        rampMinutes =
          (new Date(readings[i].timestamp).getTime() -
            new Date(readings[0].timestamp).getTime()) /
          60000;
        break;
      }
    }

    return {
      maxTemp,
      avgTemp: Math.round(avgTemp),
      duration: timeRange,
      productionMinutes: Math.round(productionMinutes),
      rampMinutes: Math.round(rampMinutes),
      readingCount: readings.length,
    };
  }, [readings]);

  const toggleLine = (key: string) => {
    setHiddenLines((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // Determine Y domain
  const allTemps = chartData.flatMap((d) =>
    [d.reactor, d.control, d.steel, d.chain].filter((t): t is number => t !== null)
  );
  const yMax = Math.max(...allTemps, 200);
  const yDomainMax = Math.ceil(yMax / 50) * 50 + 20;

  // Key events for annotations (phase changes + incidents only)
  const keyEvents = events?.filter(
    (e) => e.type === "PHASE_CHANGE" || e.type === "INCIDENT"
  );

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-px bg-eco-border rounded-lg overflow-hidden">
          {[
            { label: "Temp máx", value: `${stats.maxTemp}°C`, color: "#E8700A" },
            { label: "Temp prom", value: `${stats.avgTemp}°C`, color: "#2D8CF0" },
            { label: "Duración", value: formatDuration(stats.duration), color: "#273949" },
            { label: "Rampa a 150°C", value: `${stats.rampMinutes}m`, color: "#7C5CFC" },
            { label: "En producción", value: `${stats.productionMinutes}m`, color: "#3d7a0a" },
            { label: "Lecturas", value: `${stats.readingCount}`, color: "#273949" },
          ].map((s, i) => (
            <div key={i} className="bg-eco-surface p-3 text-center">
              <div className="font-mono text-sm font-bold" style={{ color: s.color }}>
                {s.value}
              </div>
              <div className="text-[8px] text-eco-muted uppercase tracking-wider mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main chart */}
      <div className="bg-eco-surface border border-eco-border rounded-xl p-4 pt-6">
        <ResponsiveContainer width="100%" height={420}>
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 20, left: 0, bottom: 8 }}
          >
            <defs>
              {/* Gradient for reactor line area fill */}
              <linearGradient id="reactorGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E8700A" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#E8700A" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="controlGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2D8CF0" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#2D8CF0" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Reference zones */}
            <ReferenceArea
              y1={150}
              y2={yDomainMax}
              fill="#3d7a0a"
              fillOpacity={0.03}
              ifOverflow="hidden"
            />
            <ReferenceArea
              y1={180}
              y2={yDomainMax}
              fill="#DC2626"
              fillOpacity={0.03}
              ifOverflow="hidden"
            />

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(39,57,73,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={formatTime}
              stroke="none"
              tick={{
                fill: "rgba(39,57,73,0.35)",
                fontSize: 10,
                fontFamily: "ui-monospace, monospace",
              }}
              tickLine={false}
            />
            <YAxis
              domain={[0, yDomainMax]}
              stroke="none"
              tick={{
                fill: "rgba(39,57,73,0.35)",
                fontSize: 10,
                fontFamily: "ui-monospace, monospace",
              }}
              tickLine={false}
              width={48}
              tickFormatter={(v) => `${v}°`}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Reference lines for key thresholds */}
            <ReferenceLine
              y={150}
              stroke="#3d7a0a"
              strokeDasharray="6 4"
              strokeWidth={1}
              strokeOpacity={0.5}
              label={{
                value: "150° — zona de producción",
                position: "insideTopRight",
                fill: "#3d7a0a",
                fontSize: 9,
                fontFamily: "ui-monospace, monospace",
              }}
            />
            <ReferenceLine
              y={180}
              stroke="#DC2626"
              strokeDasharray="6 4"
              strokeWidth={1}
              strokeOpacity={0.4}
              label={{
                value: "180° — zona de riesgo",
                position: "insideTopRight",
                fill: "#DC2626",
                fontSize: 9,
                fontFamily: "ui-monospace, monospace",
              }}
            />

            {/* Area fills under main lines */}
            {!hiddenLines.has("reactor") && (
              <Area
                type="monotone"
                dataKey="reactor"
                fill="url(#reactorGrad)"
                stroke="none"
                connectNulls
              />
            )}
            {!hiddenLines.has("control") && (
              <Area
                type="monotone"
                dataKey="control"
                fill="url(#controlGrad)"
                stroke="none"
                connectNulls
              />
            )}

            {/* Temperature lines */}
            {LINES.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={hiddenLines.has(line.key) ? "transparent" : line.color}
                strokeWidth={line.width}
                dot={false}
                activeDot={{
                  r: 5,
                  strokeWidth: 2,
                  stroke: "#fff",
                  fill: line.color,
                }}
                connectNulls
              />
            ))}

            {/* Event markers */}
            {keyEvents?.map((event, i) => {
              const config = EVENT_TYPE_CONFIG[event.type];
              const eventTs = new Date(event.timestamp).getTime();
              return (
                <ReferenceLine
                  key={`ev-${i}`}
                  x={eventTs}
                  stroke={config?.color || "rgba(39,57,73,0.15)"}
                  strokeDasharray="3 3"
                  strokeWidth={1.5}
                  label={{
                    value: event.detail.length > 30 ? event.detail.slice(0, 28) + "…" : event.detail,
                    position: "insideTop",
                    fill: config?.color || "#273949",
                    fontSize: 8,
                    fontFamily: "ui-monospace, monospace",
                    offset: 10 + (i % 3) * 14,
                  }}
                />
              );
            })}
          </ComposedChart>
        </ResponsiveContainer>

        {/* Interactive legend */}
        <div className="flex items-center justify-between mt-2 pt-3 border-t border-eco-border">
          <div className="flex items-center gap-4">
            {LINES.map((line) => {
              const hidden = hiddenLines.has(line.key);
              return (
                <button
                  key={line.key}
                  onClick={() => toggleLine(line.key)}
                  className="flex items-center gap-1.5 text-[11px] font-mono transition-opacity hover:opacity-80"
                  style={{ opacity: hidden ? 0.3 : 1 }}
                >
                  <span
                    className="w-3 h-[3px] rounded-full"
                    style={{
                      backgroundColor: hidden ? "rgba(39,57,73,0.2)" : line.color,
                    }}
                  />
                  <span style={{ color: hidden ? "rgba(39,57,73,0.3)" : line.color }}>
                    {line.name}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[9px] text-eco-muted">
              <span className="w-3 h-px border-t border-dashed" style={{ borderColor: "#3d7a0a" }} />
              Producción
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-eco-muted">
              <span className="w-3 h-px border-t border-dashed" style={{ borderColor: "#DC2626" }} />
              Riesgo
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
