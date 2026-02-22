"use client";

import {
  LineChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface YieldSparklineProps {
  batches: {
    code: string;
    yieldPercent: number | null;
  }[];
}

const TARGET_YIELD = 15;

export function YieldSparkline({ batches }: YieldSparklineProps) {
  const data = [...batches]
    .filter((b) => b.yieldPercent != null && b.yieldPercent > 0)
    .reverse()
    .slice(-15)
    .map((b) => ({
      name: b.code.split("-").pop() || b.code,
      yield: Number(b.yieldPercent!.toFixed(1)),
    }));

  if (data.length < 2) return null;

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] px-5 py-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] tracking-[1.5px] text-eco-muted uppercase font-medium">
          Tendencia de Rendimiento
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-[2px] rounded-full bg-[#3d7a0a]" />
            <span className="text-[9px] text-eco-muted">Yield %</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-[2px] rounded-full bg-[#E8700A] opacity-50" style={{ borderTop: "1px dashed #E8700A" }} />
            <span className="text-[9px] text-eco-muted">Meta {TARGET_YIELD}%</span>
          </div>
        </div>
      </div>
      <div className="h-[56px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
            <ReferenceLine
              y={TARGET_YIELD}
              stroke="#E8700A"
              strokeDasharray="4 4"
              strokeWidth={1}
              strokeOpacity={0.5}
            />
            <Line
              type="monotone"
              dataKey="yield"
              stroke="#3d7a0a"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, fill: "#3d7a0a", strokeWidth: 0 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const val = payload[0].value as number;
                return (
                  <div className="bg-eco-navy/95 backdrop-blur-sm text-white text-[10px] font-mono px-2.5 py-1.5 rounded-lg shadow-lg border border-white/10">
                    {val.toFixed(1)}%
                  </div>
                );
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
