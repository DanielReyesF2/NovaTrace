"use client";

import { useMemo, useRef, useState } from "react";
import { EVENT_TYPE_CONFIG, CHART_VISIBLE_TYPES } from "./eventConfig";
import type { Phase, Reading, ProcessEvent } from "./phaseDetection";

interface TimelineMiniChartProps {
  readings: Reading[];
  events: ProcessEvent[];
  phases: Phase[];
  onPhaseClick?: (phaseId: string) => void;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(minutes: number) {
  if (minutes < 1) return "<1m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

interface TooltipData {
  x: number;
  y: number;
  content: React.ReactNode;
}

export function TimelineMiniChart({
  readings,
  events,
  phases,
  onPhaseClick,
}: TimelineMiniChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [hoveredPhase, setHoveredPhase] = useState<string | null>(null);

  // Layout constants
  const PADDING_LEFT = 50;
  const PADDING_RIGHT = 16;
  const PADDING_TOP = 8;
  const PHASE_BAR_Y = PADDING_TOP;
  const PHASE_BAR_HEIGHT = 36;
  const EVENT_DOT_Y = PHASE_BAR_Y + PHASE_BAR_HEIGHT + 20;
  const TEMP_AREA_Y = EVENT_DOT_Y + 16;
  const TEMP_AREA_HEIGHT = 60;
  const TOTAL_HEIGHT = TEMP_AREA_Y + TEMP_AREA_HEIGHT + 24;

  // Time domain
  const timeDomain = useMemo(() => {
    const allTimes: number[] = [];
    for (const r of readings) allTimes.push(new Date(r.timestamp).getTime());
    for (const e of events) allTimes.push(new Date(e.timestamp).getTime());
    if (allTimes.length === 0) return { min: 0, max: 1 };
    return { min: Math.min(...allTimes), max: Math.max(...allTimes) };
  }, [readings, events]);

  // Temperature data
  const tempData = useMemo(
    () =>
      readings
        .map((r) => ({
          ts: new Date(r.timestamp).getTime(),
          control: r.controlTemp,
        }))
        .filter((d) => d.control != null) as Array<{ ts: number; control: number }>,
    [readings]
  );

  const tempMax = useMemo(
    () => (tempData.length > 0 ? Math.max(...tempData.map((d) => d.control)) : 100),
    [tempData]
  );

  // Visible events for dots
  const visibleEvents = useMemo(
    () => events.filter((e) => CHART_VISIBLE_TYPES.has(e.type)),
    [events]
  );

  // Scale function: time → x pixel
  const chartWidth = 700; // will be scaled by viewBox
  const xScale = (ts: number) => {
    const range = timeDomain.max - timeDomain.min || 1;
    return PADDING_LEFT + ((ts - timeDomain.min) / range) * (chartWidth - PADDING_LEFT - PADDING_RIGHT);
  };

  // Scale function: temp → y pixel (inverted)
  const yTempScale = (temp: number) => {
    const maxT = Math.ceil(tempMax / 50) * 50 + 10;
    return TEMP_AREA_Y + TEMP_AREA_HEIGHT - (temp / maxT) * TEMP_AREA_HEIGHT;
  };

  // Build temperature line path
  const tempLinePath = useMemo(() => {
    if (tempData.length < 2) return "";
    return tempData
      .map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(d.ts)} ${yTempScale(d.control)}`)
      .join(" ");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempData, timeDomain, tempMax]);

  // Build temperature area path (fill under line)
  const tempAreaPath = useMemo(() => {
    if (tempData.length < 2) return "";
    const baseline = TEMP_AREA_Y + TEMP_AREA_HEIGHT;
    const line = tempData
      .map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(d.ts)} ${yTempScale(d.control)}`)
      .join(" ");
    const lastX = xScale(tempData[tempData.length - 1].ts);
    const firstX = xScale(tempData[0].ts);
    return `${line} L ${lastX} ${baseline} L ${firstX} ${baseline} Z`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempData, timeDomain, tempMax]);

  // Time axis ticks
  const timeTicks = useMemo(() => {
    const range = timeDomain.max - timeDomain.min;
    const tickCount = 6;
    const ticks: number[] = [];
    for (let i = 0; i <= tickCount; i++) {
      ticks.push(timeDomain.min + (range * i) / tickCount);
    }
    return ticks;
  }, [timeDomain]);

  // Y axis ticks for temperature
  const tempTicks = useMemo(() => {
    const maxT = Math.ceil(tempMax / 50) * 50 + 10;
    const ticks: number[] = [];
    for (let t = 0; t <= maxT; t += 50) ticks.push(t);
    return ticks;
  }, [tempMax]);

  if (phases.length === 0 && tempData.length === 0) return null;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setTooltip((prev) => (prev ? { ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top } : prev));
  };

  return (
    <div className="bg-white rounded-xl border border-black/[0.03] p-3 relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${chartWidth} ${TOTAL_HEIGHT}`}
        className="w-full"
        style={{ height: "auto", minHeight: 180 }}
        onMouseLeave={() => setTooltip(null)}
        onMouseMove={handleMouseMove}
      >
        <defs>
          <linearGradient id="tempFillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2D8CF0" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#2D8CF0" stopOpacity={0.02} />
          </linearGradient>
          {/* Rounded rect clip for phase bars */}
          {phases.map((phase) => {
            const x = xScale(phase.startTime);
            const w = Math.max(xScale(phase.endTime) - x, 8);
            return (
              <clipPath key={`clip-${phase.id}`} id={`clip-${phase.id}`}>
                <rect x={x} y={PHASE_BAR_Y} width={w} height={PHASE_BAR_HEIGHT} rx={4} />
              </clipPath>
            );
          })}
        </defs>

        {/* ── PHASE BARS (Gantt-style) ── */}
        {phases.map((phase) => {
          const x = xScale(phase.startTime);
          const w = Math.max(xScale(phase.endTime) - x, 8);
          const isHovered = hoveredPhase === phase.id;

          return (
            <g
              key={phase.id}
              style={{ cursor: "pointer" }}
              onClick={() => onPhaseClick?.(phase.id)}
              onMouseEnter={() => {
                setHoveredPhase(phase.id);
                setTooltip({
                  x: x + w / 2,
                  y: PHASE_BAR_Y - 4,
                  content: (
                    <div>
                      <div className="font-semibold text-[11px]">
                        {phase.icon} {phase.name}
                      </div>
                      <div className="text-[9px] text-eco-muted font-mono">
                        {formatTime(phase.startTime)} — {formatTime(phase.endTime)} · {formatDuration(phase.durationMinutes)}
                      </div>
                      {phase.tempRange && (
                        <div className="text-[9px] text-eco-blue font-mono">
                          {phase.tempRange.min}–{phase.tempRange.max}°C
                        </div>
                      )}
                      <div className="text-[9px] text-eco-muted">
                        {phase.events.length} eventos
                        {phase.hasIncidents && " · ⚠ incidentes"}
                      </div>
                    </div>
                  ),
                });
              }}
              onMouseLeave={() => {
                setHoveredPhase(null);
                setTooltip(null);
              }}
            >
              {/* Phase bar background */}
              <rect
                x={x}
                y={PHASE_BAR_Y}
                width={w}
                height={PHASE_BAR_HEIGHT}
                rx={4}
                fill={phase.color}
                fillOpacity={isHovered ? 0.2 : 0.12}
                stroke={phase.color}
                strokeOpacity={isHovered ? 0.5 : 0.25}
                strokeWidth={1}
              />
              {/* Phase name label (if bar is wide enough) */}
              {w > 60 && (
                <text
                  x={x + w / 2}
                  y={PHASE_BAR_Y + 14}
                  textAnchor="middle"
                  fill={phase.color}
                  fontSize={9}
                  fontWeight={600}
                  fontFamily="ui-monospace, monospace"
                >
                  {phase.icon} {phase.name}
                </text>
              )}
              {/* Duration label */}
              {w > 40 && (
                <text
                  x={x + w / 2}
                  y={PHASE_BAR_Y + 27}
                  textAnchor="middle"
                  fill={phase.color}
                  fillOpacity={0.6}
                  fontSize={8}
                  fontFamily="ui-monospace, monospace"
                >
                  {formatDuration(phase.durationMinutes)}
                </text>
              )}
              {/* Incident indicator */}
              {phase.hasIncidents && (
                <circle
                  cx={x + w - 8}
                  cy={PHASE_BAR_Y + 8}
                  r={4}
                  fill="#DC2626"
                  stroke="#fff"
                  strokeWidth={1}
                />
              )}
            </g>
          );
        })}

        {/* ── EVENT DOTS ROW ── */}
        {visibleEvents.map((event, i) => {
          const ts = new Date(event.timestamp).getTime();
          const cx = xScale(ts);
          const config = EVENT_TYPE_CONFIG[event.type] || EVENT_TYPE_CONFIG.OBSERVATION;
          const isIncident = event.type === "INCIDENT";
          const r = isIncident ? 5 : 3.5;

          return (
            <g
              key={`evt-${i}`}
              onMouseEnter={() => {
                setTooltip({
                  x: cx,
                  y: EVENT_DOT_Y - 12,
                  content: (
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase"
                          style={{ color: config.color, background: config.bg }}
                        >
                          {config.label}
                        </span>
                        <span className="text-[9px] font-mono text-eco-muted">
                          {formatTime(ts)}
                        </span>
                      </div>
                      <p className="text-[10px] text-eco-ink leading-snug max-w-[200px]">
                        {event.detail}
                      </p>
                    </div>
                  ),
                });
              }}
              onMouseLeave={() => setTooltip(null)}
              style={{ cursor: "pointer" }}
            >
              {isIncident && (
                <circle cx={cx} cy={EVENT_DOT_Y} r={r + 3} fill="#DC2626" opacity={0.12} />
              )}
              <circle
                cx={cx}
                cy={EVENT_DOT_Y}
                r={r}
                fill={config.color}
                stroke="#fff"
                strokeWidth={1.5}
              />
            </g>
          );
        })}

        {/* Event row label */}
        <text
          x={PADDING_LEFT - 6}
          y={EVENT_DOT_Y + 3}
          textAnchor="end"
          fill="rgba(39,57,73,0.25)"
          fontSize={7}
          fontFamily="ui-monospace, monospace"
        >
          Eventos
        </text>

        {/* ── TEMPERATURE LINE ── */}
        {tempAreaPath && (
          <path d={tempAreaPath} fill="url(#tempFillGrad)" />
        )}
        {tempLinePath && (
          <path d={tempLinePath} fill="none" stroke="#2D8CF0" strokeWidth={1.5} strokeLinejoin="round" />
        )}

        {/* Temp Y axis ticks */}
        {tempTicks.map((t) => (
          <g key={`ty-${t}`}>
            <text
              x={PADDING_LEFT - 6}
              y={yTempScale(t) + 3}
              textAnchor="end"
              fill="rgba(39,57,73,0.25)"
              fontSize={8}
              fontFamily="ui-monospace, monospace"
            >
              {t}°
            </text>
            <line
              x1={PADDING_LEFT}
              x2={chartWidth - PADDING_RIGHT}
              y1={yTempScale(t)}
              y2={yTempScale(t)}
              stroke="rgba(39,57,73,0.04)"
              strokeDasharray="3 3"
            />
          </g>
        ))}

        {/* ── X AXIS (time) ── */}
        {timeTicks.map((ts, i) => (
          <text
            key={`tx-${i}`}
            x={xScale(ts)}
            y={TOTAL_HEIGHT - 4}
            textAnchor="middle"
            fill="rgba(39,57,73,0.3)"
            fontSize={8}
            fontFamily="ui-monospace, monospace"
          >
            {formatTime(ts)}
          </text>
        ))}

        {/* Vertical dashed lines from phase boundaries */}
        {phases.map((phase, i) => (
          <g key={`boundary-${i}`}>
            <line
              x1={xScale(phase.startTime)}
              x2={xScale(phase.startTime)}
              y1={PHASE_BAR_Y + PHASE_BAR_HEIGHT + 2}
              y2={TEMP_AREA_Y + TEMP_AREA_HEIGHT}
              stroke={phase.color}
              strokeOpacity={0.15}
              strokeDasharray="2 3"
              strokeWidth={0.5}
            />
          </g>
        ))}
      </svg>

      {/* ── Floating Tooltip ── */}
      {tooltip && (
        <div
          className="absolute pointer-events-none bg-white border border-eco-border rounded-lg p-2.5 shadow-lg z-10"
          style={{
            left: `min(calc(${(tooltip.x / chartWidth) * 100}% - 60px), calc(100% - 220px))`,
            top: 0,
            maxWidth: 240,
          }}
        >
          {tooltip.content}
        </div>
      )}

      {/* ── Legend ── */}
      <div className="flex items-center gap-4 px-1 pt-2 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          {phases.map((phase) => (
            <button
              key={phase.id}
              onClick={() => onPhaseClick?.(phase.id)}
              className="flex items-center gap-1.5 text-[9px] hover:opacity-70 transition-opacity"
            >
              <span
                className="w-3 h-2 rounded-sm flex-shrink-0"
                style={{ backgroundColor: phase.color, opacity: 0.4 }}
              />
              <span className="text-eco-muted font-medium">{phase.name}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-eco-muted ml-auto">
          <span className="w-3 h-[2px] rounded-full bg-eco-blue" />
          <span>Control °C</span>
        </div>
      </div>
    </div>
  );
}
