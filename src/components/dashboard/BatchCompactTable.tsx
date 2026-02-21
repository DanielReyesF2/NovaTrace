"use client";

import Link from "next/link";

interface BatchSummary {
  id: string;
  code: string;
  date: string;
  status: string;
  feedstockWeight: number;
  oilOutput: number | null;
  yieldPercent: number | null;
  co2Avoided: number | null;
}

interface BatchCompactTableProps {
  batches: BatchSummary[];
}

const STATUS_PILLS: Record<string, { label: string; color: string; bg: string }> = {
  COMPLETED: { label: "Completado", color: "#3d7a0a", bg: "rgba(61,122,10,0.08)" },
  ACTIVE: { label: "Activo", color: "#E8700A", bg: "rgba(232,112,10,0.08)" },
  INCOMPLETE: { label: "Incompleto", color: "#DC2626", bg: "rgba(220,38,38,0.06)" },
  TEST: { label: "Prueba", color: "#7C5CFC", bg: "rgba(124,92,252,0.08)" },
};

export function BatchCompactTable({ batches }: BatchCompactTableProps) {
  const rows = batches.slice(0, 10);

  // Max yield for mini bar normalization
  const maxYield = Math.max(
    ...rows.map((b) => b.yieldPercent ?? 0).filter((v) => v > 0),
    1
  );

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] p-5">
      <h3 className="text-[11px] tracking-[2px] text-eco-muted uppercase font-medium mb-4">
        Últimos Lotes
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-black/[0.04]">
              {["Código", "Fecha", "Estado", "Feedstock", "Aceite", "Rendimiento", "CO₂"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-[9px] text-eco-muted uppercase tracking-[1px] font-medium pb-2 pr-3 whitespace-nowrap"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((batch) => {
              const pill = STATUS_PILLS[batch.status] ?? STATUS_PILLS.TEST;
              const yieldVal = batch.yieldPercent ?? 0;
              const yieldBarW = maxYield > 0 ? (yieldVal / maxYield) * 100 : 0;
              const yieldColor =
                yieldVal < 10
                  ? "#DC2626"
                  : yieldVal < 15
                  ? "#E8700A"
                  : "#3d7a0a";

              return (
                <tr
                  key={batch.id}
                  className="border-b border-black/[0.02] hover:bg-eco-surface-2/40 transition-colors"
                >
                  <td className="py-2 pr-3">
                    <Link
                      href={`/batch/${batch.id}`}
                      className="font-mono text-[11px] font-semibold text-eco-blue hover:underline"
                    >
                      {batch.code}
                    </Link>
                  </td>
                  <td className="py-2 pr-3 text-[10px] text-eco-muted whitespace-nowrap">
                    {new Date(batch.date).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short",
                    })}
                  </td>
                  <td className="py-2 pr-3">
                    <span
                      className="inline-block text-[8px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ color: pill.color, background: pill.bg }}
                    >
                      {pill.label}
                    </span>
                  </td>
                  <td className="py-2 pr-3 font-mono text-[10px] text-eco-ink tabular-nums">
                    {batch.feedstockWeight} kg
                  </td>
                  <td className="py-2 pr-3 font-mono text-[10px] text-eco-purple tabular-nums">
                    {batch.oilOutput != null ? `${batch.oilOutput} L` : "—"}
                  </td>
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-mono text-[10px] font-semibold tabular-nums"
                        style={{ color: yieldColor }}
                      >
                        {yieldVal > 0 ? `${yieldVal.toFixed(1)}%` : "—"}
                      </span>
                      {yieldVal > 0 && (
                        <div className="w-12 h-1.5 bg-eco-surface-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${yieldBarW}%`,
                              background: yieldColor,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-2 font-mono text-[10px] text-eco-ink tabular-nums">
                    {batch.co2Avoided != null
                      ? `${batch.co2Avoided.toFixed(1)} kg`
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
