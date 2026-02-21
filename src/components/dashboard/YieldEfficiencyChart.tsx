"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface BatchData {
  code: string;
  date: string;
  status: string;
  yieldPercent: number | null;
}

interface YieldEfficiencyChartProps {
  batches: BatchData[];
}

interface ChartPoint {
  name: string;
  date: string;
  yield: number;
  movingAvg: number | null;
}

/* Color-coded dot based on yield threshold */
function CustomDot(props: { cx?: number; cy?: number; payload?: ChartPoint }) {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload) return null;
  const y = payload.yield;
  const color = y < 10 ? "#DC2626" : y < 15 ? "#E8700A" : "#3d7a0a";
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={color}
      stroke="white"
      strokeWidth={2}
    />
  );
}

export function YieldEfficiencyChart({ batches }: YieldEfficiencyChartProps) {
  const filtered = batches
    .filter((b) => b.status === "COMPLETED" && b.yieldPercent != null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const chartData: ChartPoint[] = filtered.map((b, i) => {
    // Moving average of last 3 completed batches
    const window = filtered.slice(Math.max(0, i - 2), i + 1);
    const avg =
      window.length >= 2
        ? window.reduce((s, w) => s + (w.yieldPercent ?? 0), 0) / window.length
        : null;

    return {
      name: b.code,
      date: new Date(b.date).toLocaleDateString("es-MX", {
        month: "short",
        day: "numeric",
      }),
      yield: b.yieldPercent!,
      movingAvg: avg ? Math.round(avg * 10) / 10 : null,
    };
  });

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] tracking-[2px] text-eco-muted uppercase font-medium">
          Eficiencia de Rendimiento
        </h3>
        <div className="flex items-center gap-3 text-[9px] text-eco-muted">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#DC2626]" />
            &lt;10%
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#E8700A]" />
            10-15%
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#3d7a0a]" />
            &gt;15%
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(39,57,73,0.06)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "rgba(39,57,73,0.4)" }}
            tickLine={false}
            axisLine={{ stroke: "rgba(39,57,73,0.08)" }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "rgba(39,57,73,0.4)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
            domain={[0, "auto"]}
          />
          <Tooltip
            contentStyle={{
              background: "#273949",
              border: "none",
              borderRadius: "8px",
              fontSize: "11px",
              color: "white",
              fontFamily: "JetBrains Mono, monospace",
            }}
            formatter={(value: number, name: string) => [
              `${value.toFixed(1)}%`,
              name === "yield" ? "Rendimiento" : "Media móvil (3)",
            ]}
          />
          <ReferenceLine
            y={15}
            stroke="#E8700A"
            strokeDasharray="6 4"
            strokeWidth={1.5}
            label={{
              value: "Target 15%",
              position: "right",
              fill: "#E8700A",
              fontSize: 9,
            }}
          />
          <Line
            type="monotone"
            dataKey="yield"
            stroke="#b5e951"
            strokeWidth={2.5}
            dot={<CustomDot />}
            activeDot={{ r: 6, fill: "#b5e951", stroke: "#273949", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="movingAvg"
            stroke="rgba(39,57,73,0.25)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
