"use client";

import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

interface HeroStatsBarProps {
  batches: { id: string; status: string }[];
  stats: {
    totalBatches: number;
    completedBatches: number;
    totalFeedstockKg: number;
    totalOilLiters: number;
    totalCO2Avoided: number;
    totalCO2Baseline: number;
  };
}

const TREES_PER_TON_CO2 = 45; // ~45 árboles absorben 1 ton CO₂/año

export function HeroStatsBar({ batches, stats }: HeroStatsBarProps) {
  const treesEquiv = Math.round(
    (stats.totalCO2Avoided / 1000) * TREES_PER_TON_CO2
  );

  const metrics = [
    {
      label: "Lotes",
      value: stats.completedBatches,
      suffix: "",
      decimals: 0,
      sub: `de ${stats.totalBatches} totales`,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      ),
      accent: "#1d2b36",
    },
    {
      label: "Plástico Procesado",
      value: stats.totalFeedstockKg,
      suffix: " kg",
      decimals: 0,
      sub: "feedstock total",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
        </svg>
      ),
      accent: "#7C5CFC",
    },
    {
      label: "Aceite Producido",
      value: stats.totalOilLiters,
      suffix: " L",
      decimals: 0,
      sub: stats.totalFeedstockKg > 0
        ? `${((stats.totalOilLiters / stats.totalFeedstockKg) * 100).toFixed(1)}% yield promedio`
        : "—",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
      ),
      accent: "#E8700A",
    },
    {
      label: "CO\u2082 Evitado",
      value: stats.totalCO2Avoided,
      suffix: " kg",
      decimals: 0,
      sub: `\u2248 ${treesEquiv} \u00e1rboles/a\u00f1o`,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
        </svg>
      ),
      accent: "#3d7a0a",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="bg-white rounded-2xl shadow-soft border border-black/[0.03] p-5 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[1.5px] text-eco-muted uppercase font-medium">
              {m.label}
            </span>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: `${m.accent}0D`, color: m.accent }}
            >
              {m.icon}
            </div>
          </div>
          <div>
            <AnimatedCounter
              value={m.value}
              decimals={m.decimals}
              suffix={m.suffix}
              className="font-mono text-[28px] font-semibold tracking-tight text-eco-ink"
              duration={1000}
            />
          </div>
          <span className="text-[10px] text-eco-muted leading-tight">
            {m.sub}
          </span>
        </div>
      ))}
    </div>
  );
}
