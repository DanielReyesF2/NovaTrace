"use client";

import { useState, useMemo } from "react";

interface BatchData {
  id: string;
  code: string;
  date: string;
  status: string;
  yieldPercent: number | null;
  maxReactorTemp: number | null;
  durationMinutes: number | null;
  co2Avoided: number | null;
  feedstockWeight: number;
}

interface BatchPerformanceHeatMapProps {
  batches: BatchData[];
}

const METRICS = [
  { key: "yieldPercent", label: "Rendimiento", unit: "%", decimals: 1 },
  { key: "maxReactorTemp", label: "Temp Max", unit: "°C", decimals: 0 },
  { key: "durationMinutes", label: "Duración", unit: "min", decimals: 0 },
  { key: "co2Avoided", label: "CO₂ Evitado", unit: "kg", decimals: 1 },
  { key: "feedstockWeight", label: "Feedstock", unit: "kg", decimals: 0 },
] as const;

type MetricKey = (typeof METRICS)[number]["key"];

/* 5-stop color scale: red → orange → yellow → light green → green */
const COLOR_STOPS = [
  { r: 220, g: 38, b: 38 },    // red
  { r: 232, g: 112, b: 10 },   // orange
  { r: 234, g: 179, b: 8 },    // yellow
  { r: 132, g: 204, b: 22 },   // light green
  { r: 61, g: 122, b: 10 },    // green
];

function interpolateColor(t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const segment = clamped * (COLOR_STOPS.length - 1);
  const i = Math.floor(segment);
  const f = segment - i;
  const c0 = COLOR_STOPS[Math.min(i, COLOR_STOPS.length - 1)];
  const c1 = COLOR_STOPS[Math.min(i + 1, COLOR_STOPS.length - 1)];
  const r = Math.round(c0.r + (c1.r - c0.r) * f);
  const g = Math.round(c0.g + (c1.g - c0.g) * f);
  const b = Math.round(c0.b + (c1.b - c0.b) * f);
  return `rgb(${r},${g},${b})`;
}

export function BatchPerformanceHeatMap({ batches }: BatchPerformanceHeatMapProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    batch: string;
    metric: string;
    value: string;
  } | null>(null);

  const sorted = useMemo(
    () =>
      [...batches]
        .filter((b) => b.status === "COMPLETED" || b.status === "ACTIVE")
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [batches]
  );

  // Compute min/max for normalization per metric
  const ranges = useMemo(() => {
    const r: Record<string, { min: number; max: number }> = {};
    for (const m of METRICS) {
      const vals = sorted
        .map((b) => b[m.key] as number | null)
        .filter((v): v is number => v != null && v > 0);
      if (vals.length === 0) {
        r[m.key] = { min: 0, max: 1 };
      } else {
        r[m.key] = { min: Math.min(...vals), max: Math.max(...vals) };
      }
    }
    return r;
  }, [sorted]);

  if (sorted.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] p-5">
        <h3 className="text-[11px] tracking-[2px] text-eco-muted uppercase font-medium mb-4">
          Heat Map de Rendimiento
        </h3>
        <div className="text-center py-10 text-eco-muted-2 text-xs">
          Sin datos suficientes
        </div>
      </div>
    );
  }

  // Layout dimensions
  const labelW = 90;
  const headerH = 28;
  const cellW = 80;
  const cellH = 28;
  const gap = 2;
  const legendH = 36;
  const cols = METRICS.length;
  const rows = sorted.length;
  const svgW = labelW + cols * (cellW + gap);
  const svgH = headerH + rows * (cellH + gap) + legendH + 8;

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] p-5">
      <h3 className="text-[11px] tracking-[2px] text-eco-muted uppercase font-medium mb-4">
        Heat Map de Rendimiento
      </h3>
      <div className="overflow-x-auto">
        <svg
          width={svgW}
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full"
          style={{ minWidth: svgW }}
        >
          {/* Column headers */}
          {METRICS.map((m, col) => (
            <text
              key={m.key}
              x={labelW + col * (cellW + gap) + cellW / 2}
              y={headerH - 8}
              textAnchor="middle"
              fill="rgba(39,57,73,0.5)"
              fontSize={10}
              fontWeight={500}
              fontFamily="Inter, sans-serif"
            >
              {m.label}
            </text>
          ))}

          {/* Rows */}
          {sorted.map((batch, row) =>
            METRICS.map((m, col) => {
              const raw = batch[m.key] as number | null;
              const range = ranges[m.key];
              const normalized =
                raw != null && range.max > range.min
                  ? (raw - range.min) / (range.max - range.min)
                  : raw != null
                  ? 0.5
                  : 0;
              const color = raw != null ? interpolateColor(normalized) : "rgba(0,0,0,0.03)";
              const displayVal =
                raw != null ? `${raw.toFixed(m.decimals)} ${m.unit}` : "—";

              return (
                <g key={`${batch.id}-${m.key}`}>
                  <rect
                    x={labelW + col * (cellW + gap)}
                    y={headerH + row * (cellH + gap)}
                    width={cellW}
                    height={cellH}
                    rx={3}
                    fill={color}
                    opacity={raw != null ? 0.85 : 0.4}
                    className="heatmap-cell"
                    style={{
                      animationDelay: `${(row * cols + col) * 30}ms`,
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      const rect = (e.target as SVGRectElement).getBoundingClientRect();
                      const parent = (e.target as SVGRectElement).closest("svg")?.getBoundingClientRect();
                      if (parent) {
                        setTooltip({
                          x: rect.left - parent.left + cellW / 2,
                          y: rect.top - parent.top - 8,
                          batch: batch.code,
                          metric: m.label,
                          value: displayVal,
                        });
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                  {/* Value text inside cell */}
                  <text
                    x={labelW + col * (cellW + gap) + cellW / 2}
                    y={headerH + row * (cellH + gap) + cellH / 2 + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="white"
                    fontSize={9}
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight={500}
                    pointerEvents="none"
                    opacity={raw != null ? 1 : 0.3}
                  >
                    {raw != null ? raw.toFixed(m.decimals) : "—"}
                  </text>
                </g>
              );
            })
          )}

          {/* Row labels (batch codes) */}
          {sorted.map((batch, row) => (
            <text
              key={`label-${batch.id}`}
              x={labelW - 8}
              y={headerH + row * (cellH + gap) + cellH / 2 + 1}
              textAnchor="end"
              dominantBaseline="central"
              fill="rgba(39,57,73,0.5)"
              fontSize={9}
              fontFamily="JetBrains Mono, monospace"
            >
              {batch.code}
            </text>
          ))}

          {/* Color legend */}
          <defs>
            <linearGradient id="heatLegendGrad" x1="0" y1="0" x2="1" y2="0">
              {COLOR_STOPS.map((c, i) => (
                <stop
                  key={i}
                  offset={`${(i / (COLOR_STOPS.length - 1)) * 100}%`}
                  stopColor={`rgb(${c.r},${c.g},${c.b})`}
                />
              ))}
            </linearGradient>
          </defs>
          <text
            x={labelW}
            y={svgH - legendH + 4}
            fill="rgba(39,57,73,0.4)"
            fontSize={9}
            fontFamily="Inter, sans-serif"
          >
            Bajo
          </text>
          <rect
            x={labelW + 28}
            y={svgH - legendH - 2}
            width={160}
            height={10}
            rx={5}
            fill="url(#heatLegendGrad)"
          />
          <text
            x={labelW + 28 + 168}
            y={svgH - legendH + 4}
            fill="rgba(39,57,73,0.4)"
            fontSize={9}
            fontFamily="Inter, sans-serif"
          >
            Alto
          </text>

          {/* Tooltip */}
          {tooltip && (
            <g>
              <rect
                x={tooltip.x - 60}
                y={tooltip.y - 36}
                width={120}
                height={32}
                rx={8}
                fill="#273949"
              />
              <text
                x={tooltip.x}
                y={tooltip.y - 24}
                textAnchor="middle"
                fill="white"
                fontSize={9}
                fontFamily="Inter, sans-serif"
              >
                {tooltip.batch} · {tooltip.metric}
              </text>
              <text
                x={tooltip.x}
                y={tooltip.y - 12}
                textAnchor="middle"
                fill="#b5e951"
                fontSize={10}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={600}
              >
                {tooltip.value}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
