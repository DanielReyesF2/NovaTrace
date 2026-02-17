"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  Scatter,
} from "recharts";
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

/* eslint-disable @typescript-eslint/no-explicit-any */
function MiniTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;

  // If it's an event dot
  if (d.eventDetail) {
    const config = EVENT_TYPE_CONFIG[d.eventType] || EVENT_TYPE_CONFIG.OBSERVATION;
    return (
      <div className="bg-white border border-eco-border rounded-lg p-2.5 shadow-lg max-w-[220px]">
        <div className="flex items-center gap-1.5 mb-1">
          <span
            className="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase"
            style={{ color: config.color, background: config.bg }}
          >
            {config.label}
          </span>
          <span className="text-[9px] font-mono text-eco-muted">{formatTime(d.timestamp)}</span>
        </div>
        <p className="text-[10px] text-eco-ink leading-snug">{d.eventDetail}</p>
      </div>
    );
  }

  // Temperature tooltip
  return (
    <div className="bg-white border border-eco-border rounded-lg p-2 shadow-lg">
      <p className="text-[9px] font-mono text-eco-muted mb-1">{formatTime(d.timestamp)}</p>
      {d.control != null && (
        <p className="text-[10px]">
          <span className="text-eco-muted">Control: </span>
          <span className="font-mono font-bold text-eco-blue">{d.control}°C</span>
        </p>
      )}
    </div>
  );
}

/* Custom dot shape for events */
function EventDot(props: any) {
  const { cx, cy, payload } = props;
  if (!cx || !cy) return null;

  const config = EVENT_TYPE_CONFIG[payload.eventType] || EVENT_TYPE_CONFIG.OBSERVATION;
  const isIncident = payload.eventType === "INCIDENT";
  const r = isIncident ? 6 : 4;

  return (
    <g>
      {isIncident && (
        <circle cx={cx} cy={cy} r={r + 3} fill={config.color} opacity={0.15} />
      )}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={config.color}
        stroke="#fff"
        strokeWidth={1.5}
        style={{ cursor: "pointer" }}
      />
    </g>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function TimelineMiniChart({
  readings,
  events,
  phases,
  onPhaseClick,
}: TimelineMiniChartProps) {
  // Build temperature data
  const tempData = useMemo(
    () =>
      readings.map((r) => ({
        timestamp: new Date(r.timestamp).getTime(),
        control: r.controlTemp,
      })),
    [readings]
  );

  // Build event dots (only chart-visible types)
  const eventDots = useMemo(() => {
    const visibleEvents = events.filter((e) => CHART_VISIBLE_TYPES.has(e.type));
    return visibleEvents.map((e) => {
      const ts = new Date(e.timestamp).getTime();
      // Find nearest reading for Y position
      let bestControl = 0;
      let bestDist = Infinity;
      for (const r of readings) {
        const rTs = new Date(r.timestamp).getTime();
        const dist = Math.abs(rTs - ts);
        if (dist < bestDist && r.controlTemp != null) {
          bestDist = dist;
          bestControl = r.controlTemp;
        }
      }
      return {
        timestamp: ts,
        control: bestControl,
        eventType: e.type,
        eventDetail: e.detail,
      };
    });
  }, [events, readings]);

  // Y domain
  const allTemps = tempData
    .map((d) => d.control)
    .filter((t): t is number => t !== null);
  const yMax = Math.max(...allTemps, 50);
  const yDomainMax = Math.ceil(yMax / 50) * 50 + 10;

  if (tempData.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-black/[0.03] p-3 pb-1">
      <ResponsiveContainer width="100%" height={160}>
        <ComposedChart
          data={tempData}
          margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
        >
          <defs>
            <linearGradient id="miniControlGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2D8CF0" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#2D8CF0" stopOpacity={0.01} />
            </linearGradient>
          </defs>

          {/* Phase background bands */}
          {phases.map((phase) => (
            <ReferenceArea
              key={phase.id}
              x1={phase.startTime}
              x2={phase.endTime}
              fill={phase.color}
              fillOpacity={0.06}
              ifOverflow="hidden"
              onClick={() => onPhaseClick?.(phase.id)}
              style={{ cursor: onPhaseClick ? "pointer" : undefined }}
            />
          ))}

          <XAxis
            dataKey="timestamp"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={formatTime}
            stroke="none"
            tick={{
              fill: "rgba(39,57,73,0.3)",
              fontSize: 9,
              fontFamily: "ui-monospace, monospace",
            }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="temp"
            domain={[0, yDomainMax]}
            stroke="none"
            tick={{
              fill: "rgba(39,57,73,0.25)",
              fontSize: 9,
              fontFamily: "ui-monospace, monospace",
            }}
            tickLine={false}
            axisLine={false}
            width={36}
            tickFormatter={(v) => `${v}°`}
          />

          <Tooltip content={<MiniTooltip />} />

          {/* Area fill */}
          <Area
            yAxisId="temp"
            type="monotone"
            dataKey="control"
            fill="url(#miniControlGrad)"
            stroke="none"
            connectNulls
          />

          {/* Control temperature line */}
          <Line
            yAxisId="temp"
            type="monotone"
            dataKey="control"
            stroke="#2D8CF0"
            strokeWidth={2}
            dot={false}
            connectNulls
            activeDot={{
              r: 3,
              strokeWidth: 1.5,
              stroke: "#fff",
              fill: "#2D8CF0",
            }}
          />

          {/* Event dots */}
          <Scatter
            yAxisId="temp"
            data={eventDots}
            shape={<EventDot />}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Phase legend */}
      <div className="flex items-center gap-3 px-1 pb-1.5 pt-0.5 flex-wrap">
        {phases.map((phase) => (
          <button
            key={phase.id}
            onClick={() => onPhaseClick?.(phase.id)}
            className="flex items-center gap-1 text-[9px] hover:opacity-70 transition-opacity"
          >
            <span
              className="w-2 h-2 rounded-sm flex-shrink-0"
              style={{ backgroundColor: phase.color, opacity: 0.6 }}
            />
            <span className="text-eco-muted">{phase.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
