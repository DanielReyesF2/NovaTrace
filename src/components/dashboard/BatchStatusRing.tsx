"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

interface BatchStatusRingProps {
  batches: { status: string }[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  COMPLETED: { label: "Completado", color: "#3d7a0a" },
  ACTIVE: { label: "Activo", color: "#E8700A" },
  INCOMPLETE: { label: "Incompleto", color: "#DC2626" },
  TEST: { label: "Prueba", color: "#7C5CFC" },
};

export function BatchStatusRing({ batches }: BatchStatusRingProps) {
  const counts: Record<string, number> = {};
  for (const b of batches) {
    counts[b.status] = (counts[b.status] || 0) + 1;
  }

  const data = Object.entries(counts)
    .map(([status, value]) => ({
      name: STATUS_CONFIG[status]?.label ?? status,
      value,
      color: STATUS_CONFIG[status]?.color ?? "#999",
    }))
    .sort((a, b) => b.value - a.value);

  const total = batches.length;

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] p-5">
      <h3 className="text-[11px] tracking-[2px] text-eco-muted uppercase font-medium mb-4">
        Estado de Lotes
      </h3>
      <div className="relative" style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-mono text-2xl font-semibold tracking-tight text-eco-ink">
            {total}
          </span>
          <span className="text-[9px] text-eco-muted uppercase tracking-[1px]">
            lotes
          </span>
        </div>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5 text-[10px] text-eco-muted">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: d.color }}
            />
            {d.name} ({d.value})
          </div>
        ))}
      </div>
    </div>
  );
}
