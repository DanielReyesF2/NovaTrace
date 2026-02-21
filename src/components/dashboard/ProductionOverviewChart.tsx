"use client";

import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface BatchData {
  code: string;
  date: string;
  status: string;
  feedstockWeight: number;
  oilOutput: number | null;
}

interface ProductionOverviewChartProps {
  batches: BatchData[];
}

export function ProductionOverviewChart({ batches }: ProductionOverviewChartProps) {
  const chartData = batches
    .filter((b) => b.status === "COMPLETED")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((b) => ({
      name: b.code,
      date: new Date(b.date).toLocaleDateString("es-MX", {
        month: "short",
        day: "numeric",
      }),
      feedstock: b.feedstockWeight,
      oil: b.oilOutput ?? 0,
    }));

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] p-5">
      <h3 className="text-[11px] tracking-[2px] text-eco-muted uppercase font-medium mb-4">
        Producción General
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="feedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#273949" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#273949" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="oilGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7C5CFC" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#7C5CFC" stopOpacity={0.02} />
            </linearGradient>
          </defs>
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
            tickFormatter={(v) => `${v}`}
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
              `${value.toFixed(1)}`,
              name === "feedstock" ? "Feedstock (kg)" : "Aceite (L)",
            ]}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            iconSize={6}
            wrapperStyle={{ fontSize: "10px", color: "rgba(39,57,73,0.5)" }}
            formatter={(value: string) =>
              value === "feedstock" ? "Feedstock (kg)" : "Aceite (L)"
            }
          />
          <Area
            type="monotone"
            dataKey="feedstock"
            stroke="#273949"
            strokeWidth={2}
            fill="url(#feedGrad)"
            dot={{ fill: "#273949", r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#273949", stroke: "#fff", strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="oil"
            stroke="#7C5CFC"
            strokeWidth={2}
            fill="url(#oilGrad)"
            dot={{ fill: "#7C5CFC", r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#7C5CFC", stroke: "#fff", strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
