"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface SystemPerformanceScoreProps {
  avgYield: number;
  avgCO2ReductionPct: number;
  completionRate: number; // completedBatches / totalBatches * 100
  avgOilQuality: number; // 0-100 from lab results
  avgThermalConsistency: number; // 0-100
  scalingProgress: number; // latest batch weight / 500 * 100
}

function getSystemGrade(score: number): { grade: string; color: string } {
  if (score >= 85) return { grade: "A", color: "#3d7a0a" };
  if (score >= 75) return { grade: "B+", color: "#5a9a1a" };
  if (score >= 65) return { grade: "B", color: "#E8700A" };
  if (score >= 55) return { grade: "C+", color: "#E8700A" };
  return { grade: "C", color: "#DC2626" };
}

export function SystemPerformanceScore({
  avgYield,
  avgCO2ReductionPct,
  completionRate,
  avgOilQuality,
  avgThermalConsistency,
  scalingProgress,
}: SystemPerformanceScoreProps) {
  const dimensions = [
    { subject: "Yield Promedio", value: Math.round(Math.min(avgYield * 4, 100)) },
    { subject: "Reducción CO₂", value: Math.round(Math.min(avgCO2ReductionPct, 100)) },
    { subject: "Tasa Completación", value: Math.round(completionRate) },
    { subject: "Calidad Aceite", value: Math.round(avgOilQuality) },
    { subject: "Consistencia", value: Math.round(avgThermalConsistency) },
    { subject: "Escalamiento", value: Math.round(Math.min(scalingProgress, 100)) },
  ];

  const overall =
    dimensions.reduce((s, d) => s + d.value, 0) / dimensions.length;
  const { grade, color } = getSystemGrade(overall);

  return (
    <div className="bg-eco-surface border border-eco-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[10px] tracking-[2px] text-eco-muted uppercase">
            Performance Score del Sistema
          </h3>
          <p className="text-[10px] text-eco-muted-2 mt-0.5">
            Evaluación agregada de todos los lotes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-2xl font-black px-3 py-1 rounded-lg"
            style={{ color, background: `${color}12` }}
          >
            {grade}
          </span>
          <span className="font-mono text-sm text-eco-muted">
            {overall.toFixed(0)}/100
          </span>
        </div>
      </div>

      <div className="flex justify-center">
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={dimensions} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid stroke="rgba(39,57,73,0.08)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 9, fill: "rgba(39,57,73,0.5)" }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fontSize: 8, fill: "rgba(39,57,73,0.3)" }}
              tickCount={5}
            />
            <Radar
              name="Sistema"
              dataKey="value"
              stroke="#273949"
              fill="#b5e951"
              fillOpacity={0.25}
              strokeWidth={2}
              dot={{ fill: "#b5e951", stroke: "#3d7a0a", strokeWidth: 1.5, r: 4 }}
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
              formatter={(value: number) => [`${value}/100`, "Score"]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
