"use client";

import { useState } from "react";

interface LabAnalysis {
  summary: string;
  findings: Array<{
    type: "positive" | "warning" | "critical" | "neutral";
    title: string;
    detail: string;
  }>;
  normalization: string;
  productCharacterization: string;
  safetyAssessment?: string;
  proactiveInsights?: Array<{
    question: string;
    answer: string;
    importance: "high" | "medium" | "low";
  }>;
  recommendations: string[];
}

/* ── Style configs ── */
const FINDING_STYLES: Record<
  string,
  { icon: string; bg: string; border: string; color: string; label: string }
> = {
  critical: {
    icon: "!",
    bg: "rgba(220,38,38,0.05)",
    border: "rgba(220,38,38,0.15)",
    color: "#DC2626",
    label: "Crítico",
  },
  warning: {
    icon: "!",
    bg: "rgba(232,112,10,0.04)",
    border: "rgba(232,112,10,0.12)",
    color: "#E8700A",
    label: "Atención",
  },
  positive: {
    icon: "✓",
    bg: "rgba(61,122,10,0.04)",
    border: "rgba(61,122,10,0.12)",
    color: "#3d7a0a",
    label: "OK",
  },
  neutral: {
    icon: "i",
    bg: "rgba(45,140,240,0.03)",
    border: "rgba(45,140,240,0.10)",
    color: "#2D8CF0",
    label: "Info",
  },
};

const IMPORTANCE_COLORS: Record<string, string> = {
  high: "#DC2626",
  medium: "#E8700A",
  low: "#2D8CF0",
};

/* ── Collapsible section ── */
function Section({
  title,
  icon,
  color,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${color}18` }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-black/[0.01]"
        style={{ background: `${color}06` }}
      >
        <span style={{ color }} className="flex-shrink-0 opacity-60">
          {icon}
        </span>
        <span className="text-[11px] font-semibold text-eco-ink flex-1">
          {title}
        </span>
        <span
          className="text-[10px] text-eco-muted transition-transform duration-200"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          ▶
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

/* ── Main component ── */
export function NovaLabAnalysis() {
  const [state, setState] = useState<
    "idle" | "loading" | "loaded" | "error"
  >("idle");
  const [analysis, setAnalysis] = useState<LabAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [elapsed, setElapsed] = useState(0);

  const analyze = async () => {
    setState("loading");
    setErrorMsg("");
    const t0 = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - t0) / 1000)), 1000);
    try {
      const res = await fetch("/api/lab/insights?fresh=1");
      const data = await res.json();
      clearInterval(timer);
      if (!res.ok) {
        setErrorMsg(data.error || "Error al contactar Nova AI");
        setState("error");
        return;
      }
      setAnalysis(data.analysis);
      setState("loaded");
    } catch {
      clearInterval(timer);
      setErrorMsg("No se pudo conectar con Nova AI");
      setState("error");
    }
  };

  // Sort findings: critical first, then warning, then rest
  const sortedFindings = analysis?.findings
    ? [...analysis.findings].sort((a, b) => {
        const order: Record<string, number> = { critical: 0, warning: 1, positive: 2, neutral: 3 };
        return (order[a.type] ?? 3) - (order[b.type] ?? 3);
      })
    : [];

  // Count findings by type
  const findingCounts = sortedFindings.reduce(
    (acc, f) => {
      acc[f.type] = (acc[f.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] overflow-hidden">
      {/* ── Header ── */}
      <div
        className="px-5 py-3.5 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #273949, #3d5a29)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white text-[13px] font-bold tracking-tight">
              Nova AI — Análisis de Laboratorio
            </h3>
            <p className="text-white/30 text-[9px]">
              Química · Seguridad · Normalización · Preguntas proactivas
            </p>
          </div>
        </div>
        {state !== "loading" && (
          <button
            onClick={analyze}
            className="text-[10px] font-semibold px-3.5 py-1.5 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
          >
            {state === "loaded" ? "↻ Regenerar" : "✦ Analizar"}
          </button>
        )}
      </div>

      {/* ── Body ── */}
      <div className="p-5">
        {/* IDLE */}
        {state === "idle" && (
          <div className="text-center py-6">
            <div
              className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(39,57,73,0.06), rgba(61,122,10,0.06))",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#273949"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 3v7.4a2 2 0 01-.4 1.2L4 18.6a1 1 0 00.8 1.4h14.4a1 1 0 00.8-1.4l-4.6-7a2 2 0 01-.4-1.2V3" />
                <line x1="8" y1="3" x2="16" y2="3" />
              </svg>
            </div>
            <p className="text-sm text-eco-ink font-medium mb-1">
              Análisis profundo de laboratorio
            </p>
            <p className="text-[11px] text-eco-muted mb-4 max-w-sm mx-auto leading-relaxed">
              Nova analiza la química detrás de cada resultado, normaliza métodos
              ASTM, evalúa seguridad y genera preguntas proactivas.
            </p>
            <button
              onClick={analyze}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-semibold transition-all hover:shadow-lg hover:scale-[1.03] active:scale-100"
              style={{
                background: "linear-gradient(135deg, #273949, #3d7a0a)",
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
              </svg>
              Iniciar análisis con Nova
            </button>
          </div>
        )}

        {/* LOADING */}
        {state === "loading" && (
          <div className="py-10 text-center space-y-3">
            {/* Progress bar */}
            <div className="max-w-xs mx-auto">
              <div className="h-1 rounded-full bg-eco-surface-2 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #273949, #3d7a0a)",
                    width: `${Math.min(95, elapsed * 1.4)}%`,
                    transition: "width 1s linear",
                  }}
                />
              </div>
            </div>
            <div>
              <p className="text-sm text-eco-ink font-medium">
                Nova analizando...
              </p>
              <p className="text-[10px] text-eco-muted mt-0.5">
                {elapsed < 15
                  ? "Leyendo resultados de laboratorio"
                  : elapsed < 40
                    ? "Normalizando métodos ASTM y evaluando química"
                    : elapsed < 60
                      ? "Generando evaluación de seguridad e insights"
                      : "Finalizando análisis profundo"}
                {" "}
                <span className="font-mono text-eco-muted-2">{elapsed}s</span>
              </p>
            </div>
          </div>
        )}

        {/* ERROR */}
        {state === "error" && (
          <div className="py-6 text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 border border-red-100">
              <span className="text-red-500 text-xs">⚠</span>
              <span className="text-[11px] text-red-600">{errorMsg}</span>
            </div>
            <div>
              <button
                onClick={analyze}
                className="text-[11px] text-eco-blue hover:underline font-medium"
              >
                Reintentar análisis
              </button>
            </div>
          </div>
        )}

        {/* ── LOADED ── */}
        {state === "loaded" && analysis && (
          <div className="space-y-5">
            {/* ── Safety banner (if exists) ── */}
            {analysis.safetyAssessment && (
              <div
                className="flex gap-3 p-3.5 rounded-xl"
                style={{
                  background: "linear-gradient(135deg, rgba(220,38,38,0.04), rgba(232,112,10,0.03))",
                  border: "1px solid rgba(220,38,38,0.12)",
                }}
              >
                <div className="flex-shrink-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(220,38,38,0.08)" }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#DC2626"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] font-bold text-red-700 mb-1">
                    Evaluación de Seguridad
                  </h4>
                  <p className="text-[11px] text-eco-ink leading-relaxed">
                    {analysis.safetyAssessment}
                  </p>
                </div>
              </div>
            )}

            {/* ── Summary + quick stats ── */}
            <div>
              <p className="text-[13px] text-eco-ink leading-relaxed">
                {analysis.summary}
              </p>
              {/* Finding count chips */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {Object.entries(findingCounts).map(([type, count]) => {
                  const s = FINDING_STYLES[type] || FINDING_STYLES.neutral;
                  return (
                    <span
                      key={type}
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ color: s.color, background: `${s.color}10` }}
                    >
                      {count} {s.label}
                    </span>
                  );
                })}
                {analysis.proactiveInsights && analysis.proactiveInsights.length > 0 && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-purple-600 bg-purple-50">
                    {analysis.proactiveInsights.length} Preguntas
                  </span>
                )}
                {analysis.recommendations.length > 0 && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-emerald-700 bg-emerald-50">
                    {analysis.recommendations.length} Acciones
                  </span>
                )}
              </div>
            </div>

            {/* ── Findings ── */}
            {sortedFindings.length > 0 && (
              <div>
                <h4 className="text-[10px] text-eco-muted uppercase tracking-[2px] font-medium mb-2.5">
                  Hallazgos
                </h4>
                <div className="space-y-2">
                  {sortedFindings.map((f, i) => {
                    const s =
                      FINDING_STYLES[f.type] || FINDING_STYLES.neutral;
                    return (
                      <div
                        key={i}
                        className="flex gap-2.5 p-3 rounded-xl"
                        style={{
                          background: s.bg,
                          border: `1px solid ${s.border}`,
                        }}
                      >
                        <span
                          className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold mt-0.5"
                          style={{
                            color: "#fff",
                            background: s.color,
                          }}
                        >
                          {s.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span
                            className="text-[11px] font-bold"
                            style={{ color: s.color }}
                          >
                            {f.title}
                          </span>
                          <p className="text-[11px] text-eco-ink-light leading-relaxed mt-0.5">
                            {f.detail}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Technical deep-dives (collapsible) ── */}
            <div className="space-y-2">
              <h4 className="text-[10px] text-eco-muted uppercase tracking-[2px] font-medium mb-1">
                Análisis técnico
              </h4>

              {/* Normalization */}
              {analysis.normalization && (
                <Section
                  title="Normalización de Métodos ASTM"
                  icon={
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                    </svg>
                  }
                  color="#2D8CF0"
                  defaultOpen={false}
                >
                  <p className="text-[11px] text-eco-ink leading-relaxed">
                    {analysis.normalization}
                  </p>
                </Section>
              )}

              {/* Product Characterization */}
              {analysis.productCharacterization && (
                <Section
                  title="Caracterización del Producto"
                  icon={
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M9 3v7.4a2 2 0 01-.4 1.2L4 18.6a1 1 0 00.8 1.4h14.4a1 1 0 00.8-1.4l-4.6-7a2 2 0 01-.4-1.2V3" />
                    </svg>
                  }
                  color="#7C5CFC"
                  defaultOpen={false}
                >
                  <p className="text-[11px] text-eco-ink leading-relaxed">
                    {analysis.productCharacterization}
                  </p>
                </Section>
              )}
            </div>

            {/* ── Proactive Insights ── */}
            {analysis.proactiveInsights &&
              analysis.proactiveInsights.length > 0 && (
                <div>
                  <h4 className="text-[10px] text-eco-muted uppercase tracking-[2px] font-medium mb-0.5">
                    Preguntas que no sabías que debías hacer
                  </h4>
                  <p className="text-[9px] text-eco-muted-2 mb-2.5">
                    Nova identificó estos puntos críticos para tu operación
                  </p>
                  <div className="space-y-2">
                    {analysis.proactiveInsights.map((insight, i) => {
                      const dotColor =
                        IMPORTANCE_COLORS[insight.importance] || "#2D8CF0";
                      return (
                        <div
                          key={i}
                          className="rounded-xl bg-eco-surface-2/40 border border-black/[0.03] overflow-hidden"
                        >
                          <div className="px-3.5 py-2.5 flex items-start gap-2.5">
                            <span
                              className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                              style={{ background: dotColor }}
                            >
                              ?
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-bold text-eco-ink leading-snug">
                                {insight.question}
                              </p>
                              <p className="text-[11px] text-eco-ink-light leading-relaxed mt-1">
                                {insight.answer}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* ── Recommendations ── */}
            {analysis.recommendations.length > 0 && (
              <div>
                <h4 className="text-[10px] text-eco-muted uppercase tracking-[2px] font-medium mb-2.5">
                  Acciones recomendadas
                </h4>
                <div className="space-y-1.5">
                  {analysis.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg"
                      style={{
                        background:
                          i % 2 === 0
                            ? "rgba(61,122,10,0.03)"
                            : "transparent",
                      }}
                    >
                      <span
                        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-mono font-bold mt-0.5"
                        style={{
                          color: "#3d7a0a",
                          background: "rgba(61,122,10,0.10)",
                        }}
                      >
                        {i + 1}
                      </span>
                      <p className="text-[11px] text-eco-ink leading-relaxed">
                        {rec}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Footer ── */}
            <div className="pt-3 border-t border-eco-border flex items-center justify-between">
              <p className="text-[8px] text-eco-muted-2 italic">
                Generado por Nova AI · Orientativo, no sustituye criterio
                profesional
              </p>
              <button
                onClick={analyze}
                className="text-[10px] text-eco-muted hover:text-eco-ink-light transition-colors font-medium"
              >
                ↻ Regenerar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
