"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface CO2TimeChartProps {
  data: Array<{
    code: string;
    date: string;
    co2Avoided: number | null;
  }>;
}

export function CO2TimeChart({ data }: CO2TimeChartProps) {
  let cumulative = 0;
  const chartData = data
    .filter((b) => b.co2Avoided != null && b.co2Avoided > 0)
    .map((b) => {
      cumulative += b.co2Avoided!;
      return {
        name: b.code.split("-").slice(-2).join("-"),
        date: new Date(b.date).toLocaleDateString("es-MX", {
          month: "short",
          day: "numeric",
        }),
        cumulative: Math.round(cumulative * 10) / 10,
        batch: Math.round(b.co2Avoided! * 10) / 10,
      };
    });

  return (
    <div className="bg-eco-surface border border-eco-border rounded-xl p-5">
      <h3 className="text-[10px] tracking-[2px] text-eco-muted uppercase mb-4">
        CO₂ Evitado Acumulado
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="co2Gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3d7a0a" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3d7a0a" stopOpacity={0.02} />
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
            tickFormatter={(v) => `${v} kg`}
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
              `${value.toFixed(1)} kg CO₂eq`,
              name === "cumulative" ? "Acumulado" : "Este lote",
            ]}
          />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke="#3d7a0a"
            strokeWidth={2.5}
            fill="url(#co2Gradient)"
            dot={{ fill: "#3d7a0a", r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#b5e951", stroke: "#3d7a0a", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
