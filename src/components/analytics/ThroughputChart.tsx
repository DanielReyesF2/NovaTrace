"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ThroughputChartProps {
  data: Array<{
    code: string;
    date: string;
    feedstockWeight: number;
    oilOutput: number | null;
    status: string;
  }>;
}

export function ThroughputChart({ data }: ThroughputChartProps) {
  // Group by month
  const monthlyMap = new Map<string, { feedstock: number; oil: number }>();

  data.forEach((b) => {
    const d = new Date(b.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("es-MX", { month: "short", year: "2-digit" });
    if (!monthlyMap.has(key)) monthlyMap.set(key, { feedstock: 0, oil: 0 });
    const entry = monthlyMap.get(key)!;
    entry.feedstock += b.feedstockWeight;
    entry.oil += b.oilOutput ?? 0;
  });

  const chartData = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => {
      const [y, m] = key.split("-");
      const d = new Date(parseInt(y), parseInt(m) - 1);
      return {
        month: d.toLocaleDateString("es-MX", { month: "short", year: "2-digit" }),
        feedstock: Math.round(val.feedstock),
        oil: Math.round(val.oil * 10) / 10,
      };
    });

  return (
    <div className="bg-eco-surface border border-eco-border rounded-xl p-5">
      <h3 className="text-[10px] tracking-[2px] text-eco-muted uppercase mb-4">
        Throughput Mensual
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(39,57,73,0.06)" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: "rgba(39,57,73,0.4)" }}
            tickLine={false}
            axisLine={{ stroke: "rgba(39,57,73,0.08)" }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "rgba(39,57,73,0.4)" }}
            tickLine={false}
            axisLine={false}
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
              `${value} ${name === "feedstock" ? "kg" : "L"}`,
              name === "feedstock" ? "Feedstock" : "Aceite",
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: "10px" }}
            formatter={(value) =>
              value === "feedstock" ? "Feedstock (kg)" : "Aceite (L)"
            }
          />
          <Bar
            dataKey="feedstock"
            fill="#273949"
            radius={[4, 4, 0, 0]}
            barSize={24}
          />
          <Bar
            dataKey="oil"
            fill="#7C5CFC"
            radius={[4, 4, 0, 0]}
            barSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
