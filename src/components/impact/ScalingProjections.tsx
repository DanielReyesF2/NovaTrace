"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ScalingProjectionsProps {
  currentMonthlyCO2: number; // kg CO2 avoided per month (current rate)
}

export function ScalingProjections({ currentMonthlyCO2 }: ScalingProjectionsProps) {
  const [activeScenario, setActiveScenario] = useState<"all" | "conservative" | "moderate" | "aggressive">("all");

  // Project 12 months ahead
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(2025, 2 + i); // Start Mar 2025
    return {
      month: d.toLocaleDateString("es-MX", { month: "short", year: "2-digit" }),
      conservative: Math.round(currentMonthlyCO2 * (i + 1)),
      moderate: Math.round(currentMonthlyCO2 * 2 * (i + 1)),
      aggressive: Math.round(currentMonthlyCO2 * 5 * (i + 1)),
    };
  });

  const scenarios = [
    { key: "all", label: "Todos", color: "#273949" },
    { key: "conservative", label: "Conservador (1x)", color: "#2D8CF0" },
    { key: "moderate", label: "Moderado (2x)", color: "#E8700A" },
    { key: "aggressive", label: "Agresivo (5x)", color: "#3d7a0a" },
  ] as const;

  const showLine = (key: string) =>
    activeScenario === "all" || activeScenario === key;

  return (
    <div className="bg-eco-surface border border-eco-border rounded-xl p-5">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <h3 className="text-[10px] tracking-[2px] text-eco-muted uppercase">
            Proyecciones de Escalamiento
          </h3>
          <p className="text-[10px] text-eco-muted-2 mt-0.5">
            CO₂ evitado acumulado — próximos 12 meses
          </p>
        </div>
        <div className="flex gap-1.5">
          {scenarios.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveScenario(s.key)}
              className="text-[10px] px-2.5 py-1 rounded-full font-medium transition-all"
              style={{
                color: activeScenario === s.key ? "white" : s.color,
                background: activeScenario === s.key ? s.color : `${s.color}10`,
                border: `1px solid ${activeScenario === s.key ? s.color : `${s.color}20`}`,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={months} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="conservativeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2D8CF0" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#2D8CF0" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="moderateGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E8700A" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#E8700A" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="aggressiveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3d7a0a" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#3d7a0a" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}t` : `${v}kg`}
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
              value >= 1000
                ? `${(value / 1000).toFixed(1)} t CO₂eq`
                : `${value} kg CO₂eq`,
              name === "conservative"
                ? "Conservador"
                : name === "moderate"
                ? "Moderado"
                : "Agresivo",
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: "10px" }}
            formatter={(value) =>
              value === "conservative"
                ? "Conservador (1x)"
                : value === "moderate"
                ? "Moderado (2x)"
                : "Agresivo (5x)"
            }
          />
          {showLine("conservative") && (
            <Area
              type="monotone"
              dataKey="conservative"
              stroke="#2D8CF0"
              strokeWidth={2}
              fill="url(#conservativeGrad)"
              dot={false}
            />
          )}
          {showLine("moderate") && (
            <Area
              type="monotone"
              dataKey="moderate"
              stroke="#E8700A"
              strokeWidth={2}
              fill="url(#moderateGrad)"
              dot={false}
            />
          )}
          {showLine("aggressive") && (
            <Area
              type="monotone"
              dataKey="aggressive"
              stroke="#3d7a0a"
              strokeWidth={2}
              fill="url(#aggressiveGrad)"
              dot={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
