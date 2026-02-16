"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface BatchRow {
  id: string;
  code: string;
  date: string;
  status: string;
  feedstockType: string;
  feedstockOrigin: string;
  feedstockWeight: number;
  oilOutput: number | null;
  yieldPercent: number | null;
  durationMinutes: number | null;
  co2Avoided: number | null;
  maxReactorTemp: number | null;
}

interface BatchComparisonTableProps {
  data: BatchRow[];
}

type SortKey = "date" | "feedstockWeight" | "oilOutput" | "yieldPercent" | "co2Avoided" | "durationMinutes";

function yieldColor(y: number | null): string {
  if (y == null) return "rgba(39,57,73,0.3)";
  if (y < 10) return "#DC2626";
  if (y < 15) return "#E8700A";
  return "#3d7a0a";
}

function yieldBg(y: number | null): string {
  if (y == null) return "transparent";
  if (y < 10) return "rgba(220,38,38,0.06)";
  if (y < 15) return "rgba(232,112,10,0.06)";
  return "rgba(61,122,10,0.06)";
}

export function BatchComparisonTable({ data }: BatchComparisonTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      let va: number, vb: number;
      switch (sortKey) {
        case "date":
          va = new Date(a.date).getTime();
          vb = new Date(b.date).getTime();
          break;
        case "feedstockWeight":
          va = a.feedstockWeight;
          vb = b.feedstockWeight;
          break;
        case "oilOutput":
          va = a.oilOutput ?? 0;
          vb = b.oilOutput ?? 0;
          break;
        case "yieldPercent":
          va = a.yieldPercent ?? 0;
          vb = b.yieldPercent ?? 0;
          break;
        case "co2Avoided":
          va = a.co2Avoided ?? 0;
          vb = b.co2Avoided ?? 0;
          break;
        case "durationMinutes":
          va = a.durationMinutes ?? 9999;
          vb = b.durationMinutes ?? 9999;
          break;
        default:
          va = 0;
          vb = 0;
      }
      return sortAsc ? va - vb : vb - va;
    });
  }, [data, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const SortHeader = ({ label, col }: { label: string; col: SortKey }) => (
    <th
      className="py-2.5 px-2 text-left cursor-pointer hover:text-eco-ink transition-colors select-none"
      onClick={() => toggleSort(col)}
    >
      <span className="flex items-center gap-1">
        {label}
        {sortKey === col && (
          <span className="text-eco-green">{sortAsc ? "↑" : "↓"}</span>
        )}
      </span>
    </th>
  );

  return (
    <div className="bg-eco-surface border border-eco-border rounded-xl p-5">
      <h3 className="text-[10px] tracking-[2px] text-eco-muted uppercase mb-4">
        Tabla Comparativa de Lotes
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="text-[10px] text-eco-muted border-b border-eco-border uppercase tracking-wider">
              <th className="py-2.5 px-2 text-left">Lote</th>
              <SortHeader label="Fecha" col="date" />
              <th className="py-2.5 px-2 text-left">Tipo</th>
              <SortHeader label="Peso" col="feedstockWeight" />
              <SortHeader label="Aceite" col="oilOutput" />
              <SortHeader label="Yield" col="yieldPercent" />
              <SortHeader label="CO₂ Ev." col="co2Avoided" />
              <SortHeader label="Duración" col="durationMinutes" />
              <th className="py-2.5 px-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((batch) => (
              <tr
                key={batch.id}
                className="border-b border-eco-border/50 hover:bg-eco-surface-2/30 transition-colors"
              >
                <td className="py-2.5 px-2">
                  <Link
                    href={`/batch/${batch.id}`}
                    className="text-eco-blue hover:underline font-semibold"
                  >
                    {batch.code.split("-").slice(-2).join("-")}
                  </Link>
                </td>
                <td className="py-2.5 px-2 text-eco-muted">
                  {new Date(batch.date).toLocaleDateString("es-MX", {
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="py-2.5 px-2 text-eco-ink-light text-[10px]">
                  {batch.feedstockType}
                </td>
                <td className="py-2.5 px-2 font-semibold">
                  {batch.feedstockWeight} kg
                </td>
                <td className="py-2.5 px-2 text-eco-purple font-semibold">
                  {batch.oilOutput != null && batch.oilOutput > 0
                    ? `${batch.oilOutput} L`
                    : "—"}
                </td>
                <td className="py-2.5 px-2">
                  <span
                    className="inline-block px-2 py-0.5 rounded-full font-bold text-[10px]"
                    style={{
                      color: yieldColor(batch.yieldPercent),
                      background: yieldBg(batch.yieldPercent),
                    }}
                  >
                    {batch.yieldPercent != null ? `${batch.yieldPercent}%` : "—"}
                  </span>
                </td>
                <td className="py-2.5 px-2 font-semibold" style={{ color: "#3d7a0a" }}>
                  {batch.co2Avoided != null && batch.co2Avoided > 0
                    ? `${batch.co2Avoided.toFixed(0)} kg`
                    : "—"}
                </td>
                <td className="py-2.5 px-2 text-eco-muted">
                  {batch.durationMinutes != null
                    ? `${Math.floor(batch.durationMinutes / 60)}h ${batch.durationMinutes % 60}m`
                    : "—"}
                </td>
                <td className="py-2.5 px-2">
                  <span
                    className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      color:
                        batch.status === "COMPLETED"
                          ? "#3d7a0a"
                          : batch.status === "INCOMPLETE"
                          ? "#E8700A"
                          : "#2D8CF0",
                      background:
                        batch.status === "COMPLETED"
                          ? "rgba(61,122,10,0.08)"
                          : batch.status === "INCOMPLETE"
                          ? "rgba(232,112,10,0.08)"
                          : "rgba(45,140,240,0.08)",
                    }}
                  >
                    {batch.status === "COMPLETED"
                      ? "Completado"
                      : batch.status === "INCOMPLETE"
                      ? "Incompleto"
                      : batch.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
