"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

interface GHGWaterfallChartProps {
  baseline: number;
  processEmissions: number;
  oilCombustion: number;
  charSequestration: number;
  projectTotal: number;
}

export function GHGWaterfallChart({
  baseline,
  processEmissions,
  oilCombustion,
  charSequestration,
  projectTotal,
}: GHGWaterfallChartProps) {
  // Waterfall: invisible base + visible bar
  const data = [
    {
      name: "Quema abierta\n(baseline)",
      invisible: 0,
      value: baseline,
      total: baseline,
      color: "#DC2626",
    },
    {
      name: "Proceso\npirólisis",
      invisible: 0,
      value: processEmissions,
      total: processEmissions,
      color: "#E8700A",
    },
    {
      name: "Combustión\naceite",
      invisible: processEmissions,
      value: oilCombustion,
      total: processEmissions + oilCombustion,
      color: "#7C5CFC",
    },
    {
      name: "Captura\nchar",
      invisible: processEmissions + oilCombustion - charSequestration,
      value: charSequestration,
      total: charSequestration,
      color: "#3d7a0a",
      isNegative: true,
    },
    {
      name: "Total\nproyecto",
      invisible: 0,
      value: projectTotal,
      total: projectTotal,
      color: "#2D8CF0",
    },
  ];

  return (
    <div className="bg-eco-surface border border-eco-border rounded-xl p-5">
      <h3 className="text-[10px] tracking-[2px] text-eco-muted uppercase mb-1">
        Desglose GHG — Ciclo de Vida
      </h3>
      <p className="text-[10px] text-eco-muted-2 mb-4">
        Comparación baseline vs proyecto (kg CO₂eq acumulados)
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(39,57,73,0.06)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 9, fill: "rgba(39,57,73,0.5)" }}
            tickLine={false}
            axisLine={{ stroke: "rgba(39,57,73,0.08)" }}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "rgba(39,57,73,0.4)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v.toFixed(0)}`}
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
            formatter={(value: number, name: string) => {
              if (name === "invisible") return [null, null];
              return [`${value.toFixed(1)} kg CO₂eq`, "Emisiones"];
            }}
          />
          <Bar dataKey="invisible" stackId="a" fill="transparent" />
          <Bar dataKey="value" stackId="a" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
          <ReferenceLine y={0} stroke="rgba(39,57,73,0.15)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
