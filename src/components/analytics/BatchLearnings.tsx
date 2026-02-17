"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

interface BatchWithNotes {
  id: string;
  code: string;
  date: string;
  status: string;
  feedstockType: string;
  feedstockWeight: number;
  oilOutput: number | null;
  maxReactorTemp: number | null;
  notes: string | null;
  stopReason: string | null;
}

interface BatchLearningsProps {
  batches: BatchWithNotes[];
}

interface Learning {
  batchCode: string;
  batchId: string;
  date: string;
  type: "hallazgo" | "protocolo" | "descubrimiento" | "conclusion" | "config" | "general";
  severity: "critical" | "high" | "medium" | "info";
  title: string;
  detail: string;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  hallazgo: { label: "Hallazgo", color: "#E8700A", bg: "rgba(232,112,10,0.08)", icon: "🔍" },
  protocolo: { label: "Protocolo", color: "#3d7a0a", bg: "rgba(61,122,10,0.08)", icon: "📋" },
  descubrimiento: { label: "Descubrimiento", color: "#2D8CF0", bg: "rgba(45,140,240,0.08)", icon: "💡" },
  conclusion: { label: "Conclusión", color: "#7C5CFC", bg: "rgba(124,92,252,0.08)", icon: "✦" },
  config: { label: "Configuración", color: "#3d7a0a", bg: "rgba(61,122,10,0.08)", icon: "⚙" },
  general: { label: "Nota", color: "rgba(39,57,73,0.6)", bg: "rgba(39,57,73,0.05)", icon: "○" },
};

const SEVERITY_CONFIG: Record<string, { label: string; color: string }> = {
  critical: { label: "CRÍTICO", color: "#DC2626" },
  high: { label: "ALTO", color: "#E8700A" },
  medium: { label: "MEDIO", color: "#f59e0b" },
  info: { label: "INFO", color: "#2D8CF0" },
};

/**
 * Extract structured learnings from batch notes
 */
function extractLearnings(batch: BatchWithNotes): Learning[] {
  const learnings: Learning[] = [];
  const notes = batch.notes || "";

  if (!notes.trim()) return learnings;

  // Split notes into sections by common patterns
  const lines = notes.split("\n").filter((l) => l.trim());

  for (const line of lines) {
    const trimmed = line.trim();

    // Pattern: [HALLAZGO CRÍTICO] Description
    const bracketMatch = trimmed.match(
      /^\[([A-ZÁÉÍÓÚÑ\s]+?)(?:\s+(CRÍTICO|ALTO|MEDIO|MEDIO-ALTO))?\]\s*(.+)/i
    );

    if (bracketMatch) {
      const typeRaw = bracketMatch[1].toLowerCase().trim();
      const severityRaw = (bracketMatch[2] || "info").toLowerCase().replace("-", "_").replace("medio_alto", "high");
      const detail = bracketMatch[3].trim();

      let type: Learning["type"] = "general";
      if (typeRaw.includes("hallazgo")) type = "hallazgo";
      else if (typeRaw.includes("protocolo")) type = "protocolo";
      else if (typeRaw.includes("descubrimiento")) type = "descubrimiento";
      else if (typeRaw.includes("conclusi")) type = "conclusion";
      else if (typeRaw.includes("config")) type = "config";

      let severity: Learning["severity"] = "info";
      if (severityRaw.includes("criti") || severityRaw.includes("críti")) severity = "critical";
      else if (severityRaw.includes("alto") || severityRaw === "high") severity = "high";
      else if (severityRaw.includes("medio")) severity = "medium";

      // Extract title (first sentence or clause)
      const titleEnd = detail.indexOf("—");
      const title = titleEnd > 0 ? detail.slice(0, titleEnd).trim() : detail.slice(0, 80);

      learnings.push({
        batchCode: batch.code,
        batchId: batch.id,
        date: batch.date,
        type,
        severity,
        title,
        detail,
      });
      continue;
    }

    // Pattern: Numbered items like "1. HALLAZGO..." or "• Description"
    const numberedMatch = trimmed.match(/^(?:\d+[\.\)]\s*|[•·]\s*)(.+)/);
    if (numberedMatch && trimmed.length > 30) {
      const detail = numberedMatch[1].trim();
      let type: Learning["type"] = "general";
      let severity: Learning["severity"] = "info";

      if (detail.toLowerCase().includes("hallazgo")) type = "hallazgo";
      else if (detail.toLowerCase().includes("protocolo")) type = "protocolo";
      else if (detail.toLowerCase().includes("recomend")) type = "config";

      if (detail.toLowerCase().includes("crítico") || detail.toLowerCase().includes("critical")) severity = "critical";
      else if (detail.toLowerCase().includes("alto") || detail.toLowerCase().includes("important")) severity = "high";

      learnings.push({
        batchCode: batch.code,
        batchId: batch.id,
        date: batch.date,
        type,
        severity,
        title: detail.slice(0, 80),
        detail,
      });
      continue;
    }

    // Long freeform notes (> 50 chars) as general learnings
    if (trimmed.length > 50 && !trimmed.startsWith("===") && !trimmed.startsWith("---")) {
      learnings.push({
        batchCode: batch.code,
        batchId: batch.id,
        date: batch.date,
        type: "general",
        severity: "info",
        title: trimmed.slice(0, 80),
        detail: trimmed,
      });
    }
  }

  // Also extract from stopReason if present
  if (batch.stopReason && batch.stopReason.length > 30) {
    learnings.push({
      batchCode: batch.code,
      batchId: batch.id,
      date: batch.date,
      type: "hallazgo",
      severity: "high",
      title: `Razón de paro — ${batch.code}`,
      detail: batch.stopReason,
    });
  }

  return learnings;
}

export function BatchLearnings({ batches }: BatchLearningsProps) {
  const [filter, setFilter] = useState<"all" | "critical" | "high" | "protocol">("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Extract all learnings from all batches
  const allLearnings = useMemo(() => {
    const learnings: Learning[] = [];
    for (const batch of batches) {
      learnings.push(...extractLearnings(batch));
    }
    // Sort by date desc, then severity
    const severityOrder = { critical: 0, high: 1, medium: 2, info: 3 };
    learnings.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
    return learnings;
  }, [batches]);

  // Filtered learnings
  const filteredLearnings = useMemo(() => {
    if (filter === "all") return allLearnings;
    if (filter === "critical") return allLearnings.filter((l) => l.severity === "critical");
    if (filter === "high") return allLearnings.filter((l) => l.severity === "critical" || l.severity === "high");
    if (filter === "protocol") return allLearnings.filter((l) => l.type === "protocolo" || l.type === "config");
    return allLearnings;
  }, [allLearnings, filter]);

  // Stats
  const stats = useMemo(() => ({
    total: allLearnings.length,
    critical: allLearnings.filter((l) => l.severity === "critical").length,
    high: allLearnings.filter((l) => l.severity === "high").length,
    protocols: allLearnings.filter((l) => l.type === "protocolo" || l.type === "config").length,
    batchesWithNotes: batches.filter((b) => b.notes && b.notes.length > 10).length,
  }), [allLearnings, batches]);

  if (allLearnings.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] p-6 text-center">
        <p className="text-sm text-eco-muted">
          Aún no hay aprendizajes registrados. Los aprendizajes se extraen
          automáticamente de las notas y análisis de cada lote.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #273949, #3d7a0a)" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
              <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-eco-navy">
              Base de Conocimiento
            </h3>
            <p className="text-[10px] text-eco-muted">
              {stats.total} aprendizajes de {stats.batchesWithNotes} lotes
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-px bg-eco-border rounded-lg overflow-hidden mb-3">
          {[
            { label: "Total", value: `${stats.total}`, color: "#273949" },
            { label: "Críticos", value: `${stats.critical}`, color: stats.critical > 0 ? "#DC2626" : "#3d7a0a" },
            { label: "Importantes", value: `${stats.high}`, color: stats.high > 0 ? "#E8700A" : "#273949" },
            { label: "Protocolos", value: `${stats.protocols}`, color: "#3d7a0a" },
          ].map((s, i) => (
            <div key={i} className="bg-eco-surface p-2 text-center">
              <div className="font-mono text-sm font-bold" style={{ color: s.color }}>
                {s.value}
              </div>
              <div className="text-[7px] text-eco-muted uppercase tracking-wider mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Filter buttons */}
        <div className="flex gap-1.5">
          {([
            { key: "all", label: "Todos" },
            { key: "critical", label: "Críticos" },
            { key: "high", label: "Importantes" },
            { key: "protocol", label: "Protocolos" },
          ] as const).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-[10px] px-2.5 py-1 rounded-full transition-all ${
                filter === f.key
                  ? "bg-eco-navy text-white font-semibold"
                  : "bg-eco-surface-2 text-eco-muted hover:text-eco-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Learnings list */}
      <div className="max-h-[500px] overflow-y-auto">
        <div className="px-5 pb-5 space-y-1.5">
          {filteredLearnings.map((learning, idx) => {
            const typeConfig = TYPE_CONFIG[learning.type] || TYPE_CONFIG.general;
            const sevConfig = SEVERITY_CONFIG[learning.severity] || SEVERITY_CONFIG.info;
            const isExpanded = expandedId === idx;
            const isLong = learning.detail.length > 120;

            return (
              <div
                key={idx}
                className={`rounded-lg border transition-all ${
                  learning.severity === "critical"
                    ? "border-red-200/60 bg-red-50/20"
                    : "border-black/[0.04] bg-white hover:bg-eco-surface-2/20"
                }`}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : idx)}
                  className="w-full text-left p-3 flex items-start gap-2.5"
                >
                  {/* Icon */}
                  <span className="text-sm flex-shrink-0 mt-0.5">{typeConfig.icon}</span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      {/* Batch code link */}
                      <Link
                        href={`/batch/${learning.batchId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[9px] font-mono font-bold text-eco-blue hover:underline"
                      >
                        {learning.batchCode}
                      </Link>

                      {/* Type badge */}
                      <span
                        className="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase"
                        style={{ color: typeConfig.color, background: typeConfig.bg }}
                      >
                        {typeConfig.label}
                      </span>

                      {/* Severity badge (only for critical/high) */}
                      {(learning.severity === "critical" || learning.severity === "high") && (
                        <span
                          className="text-[7px] font-bold px-1 py-0.5 rounded uppercase"
                          style={{ color: sevConfig.color, background: `${sevConfig.color}15` }}
                        >
                          {sevConfig.label}
                        </span>
                      )}

                      {/* Date */}
                      <span className="text-[8px] text-eco-muted-2 font-mono">
                        {new Date(learning.date).toLocaleDateString("es-MX", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>

                    {/* Title / Detail */}
                    <p
                      className={`text-[12px] text-eco-ink leading-relaxed ${
                        !isExpanded && isLong ? "line-clamp-2" : ""
                      }`}
                    >
                      {learning.detail}
                    </p>
                  </div>

                  {/* Expand arrow */}
                  {isLong && (
                    <span
                      className="text-eco-muted-2 text-[9px] transition-transform duration-200 flex-shrink-0 mt-1"
                      style={{
                        display: "inline-block",
                        transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                      }}
                    >
                      ▶
                    </span>
                  )}
                </button>
              </div>
            );
          })}

          {filteredLearnings.length === 0 && (
            <div className="text-center py-6 text-sm text-eco-muted">
              No hay aprendizajes con este filtro
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
