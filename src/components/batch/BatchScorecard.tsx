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

interface BatchScorecardProps {
  yieldPercent: number | null;
  co2Avoided: number | null;
  co2Baseline: number | null;
  durationMinutes: number | null;
  feedstockWeight: number;
  dieselConsumedL?: number | null;
  maxReactorTemp: number | null;
  incidents: number;
  labResults: Array<{
    viscosity40C: number | null;
    waterContent: number | null;
    sulfurPercent: number | null;
    verdict: string | null;
  }>;
  readings: Array<{
    reactorTemp: number | null;
  }>;
}

function clamp(v: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, v));
}

function getGrade(score: number): { grade: string; color: string } {
  if (score >= 95) return { grade: "A+", color: "#3d7a0a" };
  if (score >= 90) return { grade: "A", color: "#3d7a0a" };
  if (score >= 85) return { grade: "A-", color: "#5a9a1a" };
  if (score >= 80) return { grade: "B+", color: "#7ab82a" };
  if (score >= 75) return { grade: "B", color: "#E8700A" };
  if (score >= 70) return { grade: "B-", color: "#E8700A" };
  if (score >= 65) return { grade: "C+", color: "#E8700A" };
  if (score >= 60) return { grade: "C", color: "#DC2626" };
  return { grade: "D", color: "#DC2626" };
}

export function BatchScorecard({
  yieldPercent,
  co2Avoided,
  co2Baseline,
  durationMinutes,
  feedstockWeight,
  dieselConsumedL,
  maxReactorTemp,
  incidents,
  labResults,
  readings,
}: BatchScorecardProps) {
  // 1. Oil Quality (0-100)
  let oilQuality = 50;
  if (labResults.length > 0) {
    const lab = labResults[0];
    let passes = 0;
    if (lab.viscosity40C != null && lab.viscosity40C < 2) passes++;
    if (lab.waterContent != null && lab.waterContent < 200) passes++;
    if (lab.sulfurPercent != null && lab.sulfurPercent < 0.05) passes++;
    if (lab.verdict?.toLowerCase().includes("cumple")) passes++;
    oilQuality = passes === 4 ? 95 : passes === 3 ? 80 : passes === 2 ? 60 : 40;
  }

  // 2. Energy Efficiency (0-100)
  const dieselPerKg = (dieselConsumedL ?? 2) / feedstockWeight;
  const energyEfficiency = clamp(100 - dieselPerKg * 1000); // Lower diesel/kg = better

  // 3. Yield Score (0-100) — linear map: 0%→0, 25%→100
  const yieldScore = clamp(((yieldPercent ?? 0) / 25) * 100);

  // 4. Environmental Impact (0-100)
  const impactScore =
    co2Baseline && co2Avoided
      ? clamp((co2Avoided / co2Baseline) * 100)
      : 30;

  // 5. Thermal Consistency (0-100)
  const productionReadings = readings
    .filter((r) => r.reactorTemp != null && r.reactorTemp > 200)
    .map((r) => r.reactorTemp!);

  let thermalConsistency = 50;
  if (productionReadings.length > 3) {
    const mean = productionReadings.reduce((s, v) => s + v, 0) / productionReadings.length;
    const variance =
      productionReadings.reduce((s, v) => s + Math.pow(v - mean, 2), 0) /
      productionReadings.length;
    const stdDev = Math.sqrt(variance);
    // Lower stdDev = more consistent. 0°C → 100, 50°C → 0
    thermalConsistency = clamp(100 - stdDev * 2);
  }

  // 6. Compliance (0-100)
  const compliance = incidents === 0 ? 100 : incidents === 1 ? 70 : 40;

  const dimensions = [
    { subject: "Calidad Aceite", value: Math.round(oilQuality), fullMark: 100 },
    { subject: "Eficiencia\nEnergética", value: Math.round(energyEfficiency), fullMark: 100 },
    { subject: "Yield", value: Math.round(yieldScore), fullMark: 100 },
    { subject: "Impacto\nAmbiental", value: Math.round(impactScore), fullMark: 100 },
    { subject: "Consistencia\nTérmica", value: Math.round(thermalConsistency), fullMark: 100 },
    { subject: "Cumplimiento", value: Math.round(compliance), fullMark: 100 },
  ];

  // Weighted average
  const weights = [0.2, 0.1, 0.25, 0.2, 0.15, 0.1];
  const overallScore = dimensions.reduce(
    (s, d, i) => s + d.value * weights[i],
    0
  );
  const { grade, color } = getGrade(overallScore);

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] tracking-[2px] text-eco-muted uppercase font-medium">
          Scorecard del Lote
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-eco-muted">Score general:</span>
          <span
            className="font-mono text-lg font-semibold tracking-tighter px-2.5 py-0.5 rounded-lg"
            style={{ color, background: `${color}12` }}
          >
            {grade}
          </span>
          <span className="font-mono text-sm font-bold" style={{ color }}>
            {overallScore.toFixed(0)}/100
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Radar Chart */}
        <ResponsiveContainer width="100%" height={280}>
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
              name="Score"
              dataKey="value"
              stroke="#b5e951"
              fill="#b5e951"
              fillOpacity={0.2}
              strokeWidth={2}
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

        {/* Dimension breakdown */}
        <div className="space-y-3 pt-2">
          {dimensions.map((d, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-eco-muted">
                  {d.subject.replace("\n", " ")}
                </span>
                <span
                  className="font-mono text-xs font-bold"
                  style={{
                    color:
                      d.value >= 80
                        ? "#3d7a0a"
                        : d.value >= 60
                        ? "#E8700A"
                        : "#DC2626",
                  }}
                >
                  {d.value}
                </span>
              </div>
              <div className="h-1.5 bg-eco-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${d.value}%`,
                    background:
                      d.value >= 80
                        ? "linear-gradient(90deg, #3d7a0a, #5a9a1a)"
                        : d.value >= 60
                        ? "linear-gradient(90deg, #E8700A, #f59e0b)"
                        : "linear-gradient(90deg, #DC2626, #ef4444)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
