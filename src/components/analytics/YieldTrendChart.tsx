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

interface YieldTrendChartProps {
  data: Array<{
    code: string;
    date: string;
    yieldPercent: number | null;
    status: string;
  }>;
}

export function YieldTrendChart({ data }: YieldTrendChartProps) {
  const chartData = data
    .filter((b) => b.status === "COMPLETED" && b.yieldPercent != null)
    .map((b) => ({
      name: b.code.split("-").slice(-2).join("-"),
      date: new Date(b.date).toLocaleDateString("es-MX", {
        month: "short",
        day: "numeric",
      }),
      yield: b.yieldPercent,
    }));

  return (
    <div className="bg-eco-surface border border-eco-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] tracking-[2px] text-eco-muted uppercase">
          Tendencia de Yield por Lote
        </h3>
        <div className="flex items-center gap-3 text-[9px] text-eco-muted">
          <div className="flex items-center gap-1">
            <div className="w-6 h-px" style={{ background: "#E8700A", borderTop: "1.5px dashed #E8700A" }} />
            Target 15%
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
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
            formatter={(value: number) => [`${value}%`, "Yield"]}
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
            dot={{
              fill: "#b5e951",
              stroke: "#3d7a0a",
              strokeWidth: 2,
              r: 5,
            }}
            activeDot={{
              r: 7,
              fill: "#b5e951",
              stroke: "#273949",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
