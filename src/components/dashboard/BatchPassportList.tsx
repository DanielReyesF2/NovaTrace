"use client";

import { useState } from "react";
import Link from "next/link";

/* ── Types ── */
interface BatchPassport {
  id: string;
  code: string;
  date: string;
  status: string;
  feedstockType: string;
  feedstockOrigin: string;
  feedstockWeight: number;
  oilOutput: number | null;
  yieldPercent: number | null;
  co2Avoided: number | null;
  co2Baseline: number | null;
  operators: string[];
  labResults: { id: string; labName: string; verdict: string | null }[];
  certificates: { id: string; code: string }[];
}

interface BatchPassportListProps {
  batches: BatchPassport[];
}

/* ── Status config ── */
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  COMPLETED: { label: "Completado", color: "#3d7a0a", bg: "rgba(61,122,10,0.08)", icon: "\u2713" },
  ACTIVE: { label: "En Proceso", color: "#E8700A", bg: "rgba(232,112,10,0.08)", icon: "\u25cb" },
  INCOMPLETE: { label: "Incompleto", color: "#DC2626", bg: "rgba(220,38,38,0.06)", icon: "\u2717" },
  TEST: { label: "Prueba", color: "#7C5CFC", bg: "rgba(124,92,252,0.08)", icon: "\u25b7" },
};

/* ── Expanded passport card ── */
function PassportDetail({ batch }: { batch: BatchPassport }) {
  const reductionPct =
    batch.co2Baseline && batch.co2Baseline > 0
      ? ((batch.co2Avoided ?? 0) / batch.co2Baseline) * 100
      : 0;

  const hasLab = batch.labResults.length > 0;
  const labVerified = batch.labResults.some((lr) => lr.verdict === "PASS");
  const hasCert = batch.certificates.length > 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 pb-1 border-t border-black/[0.04] mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
      {/* Origen */}
      <div>
        <p className="text-[9px] text-eco-muted uppercase tracking-[1px] font-medium mb-1">
          Origen
        </p>
        <p className="text-[11px] font-semibold text-eco-ink">
          {batch.feedstockType}
        </p>
        <p className="text-[10px] text-eco-muted">{batch.feedstockOrigin}</p>
      </div>

      {/* Producci\u00f3n */}
      <div>
        <p className="text-[9px] text-eco-muted uppercase tracking-[1px] font-medium mb-1">
          Producci\u00f3n
        </p>
        <p className="text-[11px] font-semibold text-eco-ink">
          {batch.oilOutput != null ? `${batch.oilOutput} L` : "\u2014"} aceite
        </p>
        <p className="text-[10px] text-eco-muted">
          Yield:{" "}
          <span
            className="font-semibold"
            style={{
              color:
                (batch.yieldPercent ?? 0) >= 15
                  ? "#3d7a0a"
                  : (batch.yieldPercent ?? 0) >= 10
                    ? "#E8700A"
                    : "#DC2626",
            }}
          >
            {batch.yieldPercent != null
              ? `${batch.yieldPercent.toFixed(1)}%`
              : "\u2014"}
          </span>
        </p>
      </div>

      {/* CO\u2082 */}
      <div>
        <p className="text-[9px] text-eco-muted uppercase tracking-[1px] font-medium mb-1">
          CO\u2082 Evitado
        </p>
        <p className="text-[11px] font-semibold text-eco-green">
          {batch.co2Avoided != null
            ? `${batch.co2Avoided.toFixed(1)} kg`
            : "\u2014"}
        </p>
        <p className="text-[10px] text-eco-muted">
          {reductionPct > 0 ? `${reductionPct.toFixed(0)}% reducci\u00f3n` : "\u2014"}
        </p>
      </div>

      {/* Verificaci\u00f3n */}
      <div>
        <p className="text-[9px] text-eco-muted uppercase tracking-[1px] font-medium mb-1">
          Verificaci\u00f3n
        </p>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white"
              style={{ background: hasLab ? (labVerified ? "#3d7a0a" : "#E8700A") : "#d1d5db" }}
            >
              {hasLab ? (labVerified ? "\u2713" : "!" ) : "\u2014"}
            </span>
            <span className="text-[10px] text-eco-ink">
              {hasLab
                ? `${batch.labResults[0].labName} ${labVerified ? "Aprobado" : "Pendiente"}`
                : "Sin laboratorio"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white"
              style={{ background: hasCert ? "#3d7a0a" : "#d1d5db" }}
            >
              {hasCert ? "\u2713" : "\u2014"}
            </span>
            <span className="text-[10px] text-eco-ink">
              {hasCert
                ? `${batch.certificates.length} certificado${batch.certificates.length > 1 ? "s" : ""}`
                : "Sin certificado"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ── */
export function BatchPassportList({ batches }: BatchPassportListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const rows = batches.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-eco-purple/5">
            <svg className="h-4 w-4 text-eco-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-eco-ink">
              Pasaportes de Lotes
            </h2>
            <p className="text-[10px] text-eco-muted">
              \u00daltimos {rows.length} lotes \u00b7 Click para expandir pasaporte
            </p>
          </div>
        </div>
        <Link
          href="/batch"
          className="text-[11px] font-medium text-eco-purple hover:text-eco-purple/80 flex items-center gap-1 transition-colors"
        >
          Ver Todos
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>

      {/* Batch rows */}
      <div className="px-5 pb-4 space-y-1">
        {rows.map((batch) => {
          const isExpanded = expandedId === batch.id;
          const cfg = STATUS_CONFIG[batch.status] || STATUS_CONFIG.TEST;
          const hasCert = batch.certificates.length > 0;

          return (
            <div
              key={batch.id}
              className={`rounded-xl px-4 py-3 transition-all cursor-pointer ${
                isExpanded
                  ? "bg-eco-surface-2/60 ring-1 ring-black/[0.04]"
                  : "hover:bg-eco-surface-2/40"
              }`}
              onClick={() => setExpandedId(isExpanded ? null : batch.id)}
            >
              {/* Compact row */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Code */}
                <Link
                  href={`/batch/${batch.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-mono text-[11px] font-semibold text-eco-blue hover:underline min-w-[160px]"
                >
                  {batch.code}
                </Link>

                {/* Date */}
                <span className="text-[10px] text-eco-muted min-w-[56px]">
                  {new Date(batch.date).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>

                {/* Status pill */}
                <span
                  className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ color: cfg.color, background: cfg.bg }}
                >
                  <span className="text-[7px]">{cfg.icon}</span>
                  {cfg.label}
                </span>

                {/* Mass flow */}
                <span className="font-mono text-[10px] text-eco-ink flex-1 text-center tabular-nums">
                  {batch.feedstockWeight} kg
                  <span className="text-eco-muted mx-1">\u2192</span>
                  {batch.oilOutput != null ? `${batch.oilOutput} L` : "\u2014"}
                </span>

                {/* Yield */}
                <span
                  className="font-mono text-[10px] font-semibold tabular-nums min-w-[44px] text-right"
                  style={{
                    color:
                      (batch.yieldPercent ?? 0) >= 15
                        ? "#3d7a0a"
                        : (batch.yieldPercent ?? 0) >= 10
                          ? "#E8700A"
                          : "#DC2626",
                  }}
                >
                  {batch.yieldPercent != null
                    ? `${batch.yieldPercent.toFixed(1)}%`
                    : "\u2014"}
                </span>

                {/* Cert badge */}
                <span
                  className={`inline-flex items-center gap-1 text-[9px] font-medium px-2 py-0.5 rounded-full ${
                    hasCert
                      ? "bg-eco-green/10 text-eco-green"
                      : "bg-black/[0.03] text-eco-muted"
                  }`}
                >
                  {hasCert ? "\u2713 Cert" : "Pendiente"}
                </span>

                {/* Chevron */}
                <svg
                  className={`h-3 w-3 text-eco-muted/40 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>

              {/* Expanded passport */}
              {isExpanded && <PassportDetail batch={batch} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
