"use client";

import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

interface KPICardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  trend?: { value: number; label: string };
  icon: React.ReactNode;
  color: string;
}

export function KPICard({
  title,
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
  trend,
  icon,
  color,
}: KPICardProps) {
  return (
    <div className="bg-eco-surface border border-eco-border rounded-xl p-5 card-hover">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-eco-muted uppercase tracking-wider">
          {title}
        </span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}15` }}
        >
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <AnimatedCounter
          value={value}
          decimals={decimals}
          prefix={prefix}
          suffix={suffix}
          className="font-mono text-3xl font-bold"
          duration={1400}
        />
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1.5">
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{
              color: trend.value >= 0 ? "#3d7a0a" : "#DC2626",
              background:
                trend.value >= 0 ? "rgba(61,122,10,0.1)" : "rgba(220,38,38,0.08)",
            }}
          >
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value).toFixed(0)}%
          </span>
          <span className="text-[10px] text-eco-muted-2">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
