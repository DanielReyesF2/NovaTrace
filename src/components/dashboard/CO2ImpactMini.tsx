"use client";

import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";

interface BatchData {
  date: string;
  co2Avoided: number | null;
}

interface CO2ImpactMiniProps {
  batches: BatchData[];
  stats: {
    totalCO2Avoided: number;
    totalCO2Baseline: number;
  };
}

export function CO2ImpactMini({ batches, stats }: CO2ImpactMiniProps) {
  const sorted = [...batches]
    .filter((b) => b.co2Avoided != null && b.co2Avoided > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let cumulative = 0;
  const chartData = sorted.map((b) => {
    cumulative += b.co2Avoided!;
    return { v: Math.round(cumulative * 10) / 10 };
  });

  const treesEquiv = Math.round(stats.totalCO2Avoided / 22);
  const reductionPct =
    stats.totalCO2Baseline > 0
      ? ((stats.totalCO2Avoided / stats.totalCO2Baseline) * 100).toFixed(0)
      : "0";

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] p-5">
      <h3 className="text-[11px] tracking-[2px] text-eco-muted uppercase font-medium mb-3">
        Impacto CO₂
      </h3>
      <div className="flex items-baseline gap-1.5 mb-1">
        <AnimatedCounter
          value={stats.totalCO2Avoided}
          decimals={1}
          className="font-mono text-3xl font-semibold tracking-tight"
          duration={1000}
        />
        <span className="text-[11px] text-eco-muted font-light">kg CO₂eq</span>
      </div>

      {/* Mini area chart */}
      {chartData.length > 1 && (
        <div className="my-2" style={{ height: 100 }}>
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="co2MiniGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3d7a0a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3d7a0a" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke="#3d7a0a"
                strokeWidth={2}
                fill="url(#co2MiniGrad)"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex items-center gap-3 text-[10px] text-eco-muted mt-2">
        <span>
          ≈ <strong className="text-eco-ink">{treesEquiv}</strong> árboles/año
        </span>
        <span className="text-eco-muted-2">·</span>
        <span>
          <strong style={{ color: "#3d7a0a" }}>{reductionPct}%</strong> reducción
        </span>
      </div>
    </div>
  );
}
