"use client";

import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";

interface BatchSummary {
  id: string;
  code: string;
  date: string;
  feedstockWeight: number;
  oilOutput: number | null;
  yieldPercent: number | null;
  co2Avoided: number | null;
  co2Baseline: number | null;
}

interface HeroStatsBarProps {
  batches: BatchSummary[];
  stats: {
    totalFeedstockKg: number;
    totalOilLiters: number;
    totalCO2Avoided: number;
    totalCO2Baseline: number;
  };
}

interface MetricConfig {
  label: string;
  value: number;
  suffix: string;
  decimals: number;
  color: string;
  sparkData: { v: number }[];
}

export function HeroStatsBar({ batches, stats }: HeroStatsBarProps) {
  const sorted = [...batches].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const avgYield =
    stats.totalFeedstockKg > 0
      ? (stats.totalOilLiters / stats.totalFeedstockKg) * 100
      : 0;

  const reductionPct =
    stats.totalCO2Baseline > 0
      ? ((stats.totalCO2Avoided / stats.totalCO2Baseline) * 100)
      : 0;

  const metrics: MetricConfig[] = [
    {
      label: "CO₂ Evitado",
      value: stats.totalCO2Avoided,
      suffix: " kg",
      decimals: 1,
      color: "#3d7a0a",
      sparkData: sorted.map((b) => ({ v: b.co2Avoided ?? 0 })),
    },
    {
      label: "Feedstock",
      value: stats.totalFeedstockKg,
      suffix: " kg",
      decimals: 0,
      color: "#273949",
      sparkData: sorted.map((b) => ({ v: b.feedstockWeight })),
    },
    {
      label: "Aceite",
      value: stats.totalOilLiters,
      suffix: " L",
      decimals: 0,
      color: "#7C5CFC",
      sparkData: sorted.map((b) => ({ v: b.oilOutput ?? 0 })),
    },
    {
      label: "Rendimiento",
      value: avgYield,
      suffix: "%",
      decimals: 1,
      color: "#E8700A",
      sparkData: sorted.map((b) => ({ v: b.yieldPercent ?? 0 })),
    },
    {
      label: "Reducción",
      value: reductionPct,
      suffix: "%",
      decimals: 0,
      color: "#2D8CF0",
      sparkData: sorted.map((b) => ({
        v: b.co2Baseline && b.co2Baseline > 0
          ? ((b.co2Avoided ?? 0) / b.co2Baseline) * 100
          : 0,
      })),
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03]">
      <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-black/[0.04]">
        {metrics.map((m) => (
          <div key={m.label} className="p-5 flex flex-col justify-between">
            <span className="text-[11px] tracking-[2px] text-eco-muted uppercase font-medium">
              {m.label}
            </span>
            <div className="flex items-end justify-between gap-2 mt-2">
              <AnimatedCounter
                value={m.value}
                decimals={m.decimals}
                suffix={m.suffix}
                className="font-mono text-2xl font-semibold tracking-tight"
                duration={1000}
              />
              {m.sparkData.length > 1 && (
                <div className="w-16 h-8 flex-shrink-0">
                  <ResponsiveContainer width="100%" height={32}>
                    <AreaChart data={m.sparkData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
                      <defs>
                        <linearGradient id={`spark-${m.label}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={m.color} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={m.color} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke={m.color}
                        strokeWidth={1.5}
                        fill={`url(#spark-${m.label})`}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
