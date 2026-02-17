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
    <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] text-eco-muted uppercase tracking-wide font-medium">
          {title}
        </span>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${color}10` }}
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
          className="font-mono text-3xl font-semibold tracking-tight"
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
