"use client";

import { useState, useMemo } from "react";
import {
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
  Scatter,
} from "recharts";
import { EVENT_TYPE_CONFIG, CHART_VISIBLE_TYPES } from "./eventConfig";
import { detectPhases, type Phase, type ProcessEvent, type Reading } from "./phaseDetection";

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

function formatDurationMin(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  // Filter out scatter/event data points
  const tempPayload = payload.filter(
    (e: any) => e.value !== null && e.value !== undefined && e.dataKey !== "eventY"
  );

  return (
    <div className="bg-white border border-eco-border rounded-xl p-3.5 shadow-xl min-w-[180px]">
      <p className="text-[10px] text-eco-muted font-mono mb-2 pb-2 border-b border-eco-border">
        {formatTime(label)}
      </p>
      <div className="space-y-1.5">
        {tempPayload.map((entry: any) => (
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

// Custom dot renderer for event scatter points
/* eslint-disable @typescript-eslint/no-explicit-any */
function EventDot(props: any) {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload?.eventType) return null;
  const config = EVENT_TYPE_CONFIG[payload.eventType] || EVENT_TYPE_CONFIG.OBSERVATION;
  const isIncident = payload.eventType === "INCIDENT";
  const r = isIncident ? 6 : 4;

  return (
    <g>
      {isIncident && (
        <circle cx={cx} cy={cy} r={r + 4} fill="#DC2626" opacity={0.15} />
      )}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={config.color}
        stroke="#fff"
        strokeWidth={2}
      />
    </g>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function ThermalChart({ readings, events }: ThermalChartProps) {
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set());

  // Detect phases
  const phases: Phase[] = useMemo(
    () => (events ? detectPhases(events, readings) : []),
    [events, readings]
  );

  // Only operational phases (not analysis) for chart bands
  const chartPhases = useMemo(
    () => phases.filter((p) => p.name !== "Análisis & Aprendizajes"),
    [phases]
  );

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

  // Event scatter data — positioned at their interpolated CONTROL temp on the Y axis
  const eventScatterData = useMemo(() => {
    if (!events) return [];
    const visible = events.filter((e) => CHART_VISIBLE_TYPES.has(e.type));

    return visible.map((event) => {
      const eventTs = new Date(event.timestamp).getTime();

      // Find closest reading for Y position
      let closestTemp: number | null = null;
      let closestDist = Infinity;
      for (const r of readings) {
        const rTs = new Date(r.timestamp).getTime();
        const dist = Math.abs(rTs - eventTs);
        if (dist < closestDist) {
          closestDist = dist;
          closestTemp = r.controlTemp ?? r.reactorTemp ?? null;
        }
      }

      return {
        timestamp: eventTs,
        eventY: closestTemp ?? 0,
        eventType: event.type,
        eventDetail: event.detail,
      };
    });
  }, [events, readings]);

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
      <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] p-4 pt-6">
        {/* Phase timeline bar above chart */}
        {chartPhases.length > 0 && (() => {
          const timeMin = chartData.length > 0 ? chartData[0].timestamp : 0;
          const timeMax = chartData.length > 0 ? chartData[chartData.length - 1].timestamp : 1;
          const timeRange = timeMax - timeMin || 1;

          return (
            <div className="mb-3 mx-[48px] mr-[20px]">
              {/* Phase bar */}
              <div className="relative h-8 rounded-lg overflow-hidden flex">
                {chartPhases.map((phase) => {
                  const startPct = Math.max(0, ((phase.startTime - timeMin) / timeRange) * 100);
                  const endPct = Math.min(100, ((phase.endTime - timeMin) / timeRange) * 100);
                  const widthPct = Math.max(endPct - startPct, 1);

                  return (
                    <div
                      key={phase.id}
                      className="relative h-full flex items-center justify-center overflow-hidden border-r border-white/50 last:border-r-0"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: phase.bg,
                        borderLeft: `2px solid ${phase.color}`,
                      }}
                    >
                      {widthPct > 12 && (
                        <span
                          className="text-[9px] font-semibold font-mono truncate px-1"
                          style={{ color: phase.color }}
                        >
                          {phase.icon} {phase.name}
                        </span>
                      )}
                      {widthPct > 8 && widthPct <= 12 && (
                        <span className="text-[10px]">{phase.icon}</span>
                      )}
                      {/* Incident indicator */}
                      {phase.hasIncidents && (
                        <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500" />
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Phase time labels */}
              <div className="relative h-3 mt-0.5">
                {chartPhases.map((phase, i) => {
                  const startPct = ((phase.startTime - timeMin) / timeRange) * 100;
                  const endPct = ((phase.endTime - timeMin) / timeRange) * 100;
                  const midPct = (startPct + endPct) / 2;

                  return (
                    <span
                      key={phase.id}
                      className="absolute text-[7px] font-mono text-eco-muted-2 -translate-x-1/2"
                      style={{ left: `${Math.min(Math.max(midPct, 3), 97)}%` }}
                    >
                      {formatDurationMin(phase.durationMinutes)}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })()}

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

            {/* ── PHASE BANDS (colored vertical areas) ── */}
            {chartPhases.map((phase) => (
              <ReferenceArea
                key={`phase-band-${phase.id}`}
                x1={phase.startTime}
                x2={phase.endTime}
                y1={0}
                y2={yDomainMax}
                fill={phase.color}
                fillOpacity={0.06}
                ifOverflow="hidden"
              />
            ))}

            {/* Phase boundary lines */}
            {chartPhases.map((phase, i) => (
              <ReferenceLine
                key={`phase-start-${phase.id}`}
                x={phase.startTime}
                stroke={phase.color}
                strokeDasharray="4 4"
                strokeWidth={1}
                strokeOpacity={0.3}
              />
            ))}

            {/* Reference threshold lines */}
            <ReferenceLine
              y={150}
              stroke="#3d7a0a"
              strokeDasharray="6 4"
              strokeWidth={1}
              strokeOpacity={0.5}
              label={{
                value: "150° — producción",
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
                value: "180° — riesgo",
                position: "insideTopRight",
                fill: "#DC2626",
                fontSize: 9,
                fontFamily: "ui-monospace, monospace",
              }}
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
              allowDuplicatedCategory={false}
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

            {/* ── EVENT DOTS (Scatter overlay) ── */}
            {eventScatterData.length > 0 && (
              <Scatter
                data={eventScatterData}
                dataKey="eventY"
                shape={<EventDot />}
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>

        {/* ── Legend: Temperature lines + Phases + Events ── */}
        <div className="mt-2 pt-3 border-t border-eco-border space-y-2">
          {/* Temperature lines */}
          <div className="flex items-center justify-between flex-wrap gap-2">
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

          {/* Phase legend */}
          {chartPhases.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[9px] text-eco-muted-2 uppercase tracking-wider font-medium">
                Fases:
              </span>
              {chartPhases.map((phase) => (
                <div key={phase.id} className="flex items-center gap-1.5 text-[10px]">
                  <span
                    className="w-3 h-2.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: phase.color, opacity: 0.3 }}
                  />
                  <span className="text-eco-muted font-medium">
                    {phase.icon} {phase.name}
                  </span>
                  <span className="text-eco-muted-2 font-mono text-[8px]">
                    {formatDurationMin(phase.durationMinutes)}
                  </span>
                  {phase.hasIncidents && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Event type legend */}
          {eventScatterData.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[9px] text-eco-muted-2 uppercase tracking-wider font-medium">
                Eventos:
              </span>
              {Array.from(new Set(eventScatterData.map((e) => e.eventType))).map((type) => {
                const config = EVENT_TYPE_CONFIG[type] || EVENT_TYPE_CONFIG.OBSERVATION;
                const count = eventScatterData.filter((e) => e.eventType === type).length;
                return (
                  <div key={type} className="flex items-center gap-1 text-[10px]">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: config.color }}
                    />
                    <span className="text-eco-muted">{config.label}</span>
                    <span className="text-eco-muted-2 font-mono text-[8px]">×{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
