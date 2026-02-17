"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
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
  { key: "reactor", name: "Superficie Reactor", color: "#E8700A", width: 2.5 },
  { key: "control", name: "Termopar", color: "#2D8CF0", width: 1.5 },
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

interface HoverInfo {
  type: "phase" | "event" | "crosshair";
  x: number;
  y: number;
  phase?: Phase;
  event?: { type: string; detail: string; timestamp: number };
  temps?: { reactor?: number | null; control?: number | null; steel?: number | null; chain?: number | null; timestamp: number };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function EventDot(props: any) {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload?.eventType) return null;
  const config = EVENT_TYPE_CONFIG[payload.eventType] || EVENT_TYPE_CONFIG.OBSERVATION;
  const isIncident = payload.eventType === "INCIDENT";
  const r = isIncident ? 6 : 4;

  return (
    <g style={{ cursor: "pointer" }}>
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
  const [hover, setHover] = useState<HoverInfo | null>(null);
  const chartWrapRef = useRef<HTMLDivElement>(null);

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

  // Event data with positions
  const eventItems = useMemo(() => {
    if (!events) return [];
    return events
      .filter((e) => CHART_VISIBLE_TYPES.has(e.type))
      .map((event) => {
        const eventTs = new Date(event.timestamp).getTime();
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

  // Key events for vertical markers (Paros + Incidents)
  const keyEvents = useMemo(() => {
    if (!events) return [];
    return events.filter(
      (e) => e.type === "PHASE_CHANGE" || e.type === "INCIDENT"
    );
  }, [events]);

  // Detect where reactor line cuts off (last non-null reactor reading followed by nulls)
  const reactorCutoff = useMemo(() => {
    let lastReactorIdx = -1;
    for (let i = 0; i < readings.length; i++) {
      if (readings[i].reactorTemp !== null) lastReactorIdx = i;
    }
    // Only mark cutoff if reactor ends before the last reading
    if (lastReactorIdx >= 0 && lastReactorIdx < readings.length - 3) {
      const remaining = readings.length - lastReactorIdx - 1;
      const nullsAfter = readings.slice(lastReactorIdx + 1).filter(r => r.reactorTemp === null).length;
      if (nullsAfter >= remaining * 0.8) {
        return {
          timestamp: new Date(readings[lastReactorIdx].timestamp).getTime(),
          temp: readings[lastReactorIdx].reactorTemp!,
        };
      }
    }
    return null;
  }, [readings]);

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

    let productionMinutes = 0;
    for (let i = 1; i < readings.length; i++) {
      if ((readings[i].reactorTemp ?? 0) >= 150) {
        const dt =
          new Date(readings[i].timestamp).getTime() -
          new Date(readings[i - 1].timestamp).getTime();
        productionMinutes += dt / 60000;
      }
    }

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

  // Y domain
  const allTemps = chartData.flatMap((d) =>
    [d.reactor, d.control, d.steel, d.chain].filter((t): t is number => t !== null)
  );
  const yMax = Math.max(...allTemps, 200);
  const yDomainMax = Math.ceil(yMax / 50) * 50 + 20;

  // Time domain
  const timeMin = chartData.length > 0 ? chartData[0].timestamp : 0;
  const timeMax = chartData.length > 0 ? chartData[chartData.length - 1].timestamp : 1;

  // Find which phase a timestamp belongs to
  const getPhaseAt = useCallback(
    (ts: number): Phase | undefined => {
      return chartPhases.find((p) => ts >= p.startTime && ts <= p.endTime);
    },
    [chartPhases]
  );

  // Find closest event to a position
  const getEventNear = useCallback(
    (ts: number, yVal: number): typeof eventItems[0] | undefined => {
      const timeRange = timeMax - timeMin || 1;
      const threshold = timeRange * 0.02; // 2% of time range
      const yThreshold = yDomainMax * 0.06; // 6% of Y range

      let closest: typeof eventItems[0] | undefined;
      let closestDist = Infinity;

      for (const ev of eventItems) {
        const tDist = Math.abs(ev.timestamp - ts) / timeRange;
        const yDist = Math.abs(ev.eventY - yVal) / yDomainMax;
        const dist = Math.sqrt(tDist * tDist + yDist * yDist);
        if (
          Math.abs(ev.timestamp - ts) < threshold &&
          Math.abs(ev.eventY - yVal) < yThreshold &&
          dist < closestDist
        ) {
          closestDist = dist;
          closest = ev;
        }
      }
      return closest;
    },
    [eventItems, timeMin, timeMax, yDomainMax]
  );

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const handleChartMouseMove = useCallback(
    (state: any) => {
      if (!state?.activePayload?.length || !chartWrapRef.current) {
        return;
      }

      const payload = state.activePayload[0]?.payload;
      if (!payload) return;

      const ts = payload.timestamp;
      const chartRect = chartWrapRef.current.getBoundingClientRect();
      const mouseX = (state.chartX ?? 0) as number;
      const mouseY = (state.chartY ?? 0) as number;

      // Calculate approximate Y value from mouse position
      // Chart area: margin top 20, height 420, margin bottom 8 → usable ~392px
      const chartAreaTop = 20;
      const chartAreaHeight = 392;
      const yFraction = Math.max(0, Math.min(1, (mouseY - chartAreaTop) / chartAreaHeight));
      const yVal = yDomainMax * (1 - yFraction);

      // Check for nearby event first (highest priority)
      const nearEvent = getEventNear(ts, yVal);
      if (nearEvent) {
        setHover({
          type: "event",
          x: mouseX,
          y: mouseY,
          event: {
            type: nearEvent.eventType,
            detail: nearEvent.eventDetail,
            timestamp: nearEvent.timestamp,
          },
        });
        return;
      }

      // Otherwise show phase label + crosshair temps
      const phase = getPhaseAt(ts);
      setHover({
        type: phase ? "phase" : "crosshair",
        x: mouseX,
        y: mouseY,
        phase,
        temps: {
          reactor: payload.reactor,
          control: payload.control,
          steel: payload.steel,
          chain: payload.chain,
          timestamp: ts,
        },
      });
    },
    [getEventNear, getPhaseAt, yDomainMax]
  );
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const handleChartMouseLeave = useCallback(() => {
    setHover(null);
  }, []);

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
      <div
        ref={chartWrapRef}
        className="bg-white rounded-2xl shadow-soft border border-black/[0.03] p-4 pt-6 relative"
      >
        <ResponsiveContainer width="100%" height={420}>
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 20, left: 0, bottom: 8 }}
            onMouseMove={handleChartMouseMove}
            onMouseLeave={handleChartMouseLeave}
          >
            <defs>
              <linearGradient id="reactorGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E8700A" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#E8700A" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="controlGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2D8CF0" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#2D8CF0" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* ── PHASE BANDS ── */}
            {chartPhases.map((phase) => (
              <ReferenceArea
                key={`phase-band-${phase.id}`}
                x1={phase.startTime}
                x2={phase.endTime}
                y1={0}
                y2={yDomainMax}
                fill={phase.color}
                fillOpacity={
                  hover?.phase?.id === phase.id ? 0.14 : 0.05
                }
                ifOverflow="hidden"
              />
            ))}

            {/* Phase boundary lines */}
            {chartPhases.map((phase) => (
              <ReferenceLine
                key={`phase-start-${phase.id}`}
                x={phase.startTime}
                stroke={phase.color}
                strokeDasharray="4 4"
                strokeWidth={1}
                strokeOpacity={0.25}
              />
            ))}

            {/* Reactor cutoff annotation */}
            {reactorCutoff && !hiddenLines.has("reactor") && (
              <ReferenceLine
                x={reactorCutoff.timestamp}
                stroke="#E8700A"
                strokeDasharray="2 3"
                strokeWidth={1}
                strokeOpacity={0.5}
                label={{
                  value: "✕ Se dejó de medir superficie",
                  position: "insideTopLeft",
                  fill: "#E8700A",
                  fontSize: 8,
                  fontFamily: "ui-monospace, monospace",
                  offset: 5,
                }}
              />
            )}

            {/* Paro / Incident vertical markers */}
            {keyEvents.map((event, i) => {
              const config = EVENT_TYPE_CONFIG[event.type];
              const eventTs = new Date(event.timestamp).getTime();
              const label = event.detail.length > 20
                ? event.detail.slice(0, 18) + "…"
                : event.detail;
              return (
                <ReferenceLine
                  key={`ev-${i}`}
                  x={eventTs}
                  stroke={config?.color || "rgba(39,57,73,0.15)"}
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  strokeOpacity={0.4}
                  label={{
                    value: label,
                    position: "insideTop",
                    fill: config?.color || "#273949",
                    fontSize: 7,
                    fontFamily: "ui-monospace, monospace",
                    offset: 4 + (i % 3) * 12,
                  }}
                />
              );
            })}

            {/* Reference threshold lines */}
            <ReferenceLine
              y={150}
              stroke="#3d7a0a"
              strokeDasharray="6 4"
              strokeWidth={1}
              strokeOpacity={0.5}
              label={{
                value: "150° producción",
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
                value: "180° riesgo",
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
                activeDot={false}
                connectNulls
              />
            ))}

            {/* ── EVENT DOTS ── */}
            {eventItems.length > 0 && (
              <Scatter
                data={eventItems}
                dataKey="eventY"
                shape={<EventDot />}
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>

        {/* ── Custom hover tooltip (positioned near cursor) ── */}
        {hover && (
          <div
            className="absolute pointer-events-none z-20 transition-opacity duration-100"
            style={{
              left: hover.x + 48 + 16,
              top: hover.y + 24 - 8,
              opacity: 1,
            }}
          >
            {/* EVENT tooltip — small pill showing what the event is */}
            {hover.type === "event" && hover.event && (() => {
              const config = EVENT_TYPE_CONFIG[hover.event.type] || EVENT_TYPE_CONFIG.OBSERVATION;
              return (
                <div
                  className="rounded-lg shadow-lg border px-3 py-2 max-w-[220px]"
                  style={{
                    backgroundColor: "white",
                    borderColor: `${config.color}30`,
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: config.color }}
                    />
                    <span
                      className="text-[9px] font-bold uppercase tracking-wide"
                      style={{ color: config.color }}
                    >
                      {config.label}
                    </span>
                    <span className="text-[9px] font-mono text-eco-muted ml-auto">
                      {formatTime(hover.event.timestamp)}
                    </span>
                  </div>
                  <p className="text-[11px] text-eco-ink leading-snug">
                    {hover.event.detail.length > 100
                      ? hover.event.detail.slice(0, 97) + "…"
                      : hover.event.detail}
                  </p>
                </div>
              );
            })()}

            {/* PHASE tooltip — subtle tag showing phase name */}
            {hover.type === "phase" && hover.phase && hover.temps && (
              <div className="space-y-1">
                {/* Phase label */}
                <div
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 shadow-sm"
                  style={{
                    backgroundColor: hover.phase.bg,
                    border: `1px solid ${hover.phase.color}25`,
                  }}
                >
                  <span className="text-[10px]">{hover.phase.icon}</span>
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: hover.phase.color }}
                  >
                    {hover.phase.name}
                  </span>
                  <span
                    className="text-[8px] font-mono opacity-60"
                    style={{ color: hover.phase.color }}
                  >
                    {formatDurationMin(hover.phase.durationMinutes)}
                  </span>
                </div>
                {/* Temps */}
                <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-sm border border-black/[0.06] px-2.5 py-1.5">
                  <div className="text-[9px] font-mono text-eco-muted mb-1">
                    {formatTime(hover.temps.timestamp)}
                  </div>
                  <div className="flex items-center gap-3">
                    {LINES.map((line) => {
                      const val = hover.temps?.[line.key as keyof typeof hover.temps];
                      if (val == null || hiddenLines.has(line.key)) return null;
                      return (
                        <span key={line.key} className="text-[10px] font-mono font-bold" style={{ color: line.color }}>
                          {val}°
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* CROSSHAIR tooltip — just temps, no phase */}
            {hover.type === "crosshair" && hover.temps && (
              <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-sm border border-black/[0.06] px-2.5 py-1.5">
                <div className="text-[9px] font-mono text-eco-muted mb-1">
                  {formatTime(hover.temps.timestamp)}
                </div>
                <div className="flex items-center gap-3">
                  {LINES.map((line) => {
                    const val = hover.temps?.[line.key as keyof typeof hover.temps];
                    if (val == null || hiddenLines.has(line.key)) return null;
                    return (
                      <span key={line.key} className="text-[10px] font-mono font-bold" style={{ color: line.color }}>
                        {val}°
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Legend ── */}
        <div className="mt-2 pt-3 border-t border-eco-border space-y-2">
          {/* Temperature lines + thresholds */}
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

          {/* Phase + Event legend (compact single row) */}
          {(chartPhases.length > 0 || eventItems.length > 0) && (
            <div className="flex items-center gap-2.5 flex-wrap text-[9px]">
              {chartPhases.map((phase) => (
                <div key={phase.id} className="flex items-center gap-1">
                  <span
                    className="w-2.5 h-2 rounded-sm"
                    style={{ backgroundColor: phase.color, opacity: 0.35 }}
                  />
                  <span className="text-eco-muted">
                    {phase.icon} {phase.name}
                  </span>
                </div>
              ))}
              {chartPhases.length > 0 && eventItems.length > 0 && (
                <span className="text-eco-muted-2">·</span>
              )}
              {Array.from(new Set(eventItems.map((e) => e.eventType))).map((type) => {
                const config = EVENT_TYPE_CONFIG[type] || EVENT_TYPE_CONFIG.OBSERVATION;
                const count = eventItems.filter((e) => e.eventType === type).length;
                return (
                  <div key={type} className="flex items-center gap-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                    <span className="text-eco-muted">{config.label}</span>
                    <span className="text-eco-muted-2 font-mono">×{count}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Reactor cutoff explanation */}
          {reactorCutoff && !hiddenLines.has("reactor") && (
            <p className="text-[9px] text-eco-muted-2 italic mt-2 leading-relaxed">
              ✕ La medición de superficie reactor se suspendió a las {formatTime(reactorCutoff.timestamp)} ({reactorCutoff.temp}°C)
              — abrir la compuerta del sensor apagaba el quemador, se decidió dejar de medir para no interrumpir el proceso.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
