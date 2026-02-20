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

const FINDING_STYLES: Record<
  string,
  { icon: string; bg: string; border: string; color: string; label: string }
> = {
  positive: {
    icon: "\u2713",
    bg: "rgba(61,122,10,0.04)",
    border: "rgba(61,122,10,0.15)",
    color: "#3d7a0a",
    label: "Positivo",
  },
  warning: {
    icon: "\u26A0",
    bg: "rgba(232,112,10,0.04)",
    border: "rgba(232,112,10,0.15)",
    color: "#E8700A",
    label: "Atenci\u00F3n",
  },
  critical: {
    icon: "\u26D4",
    bg: "rgba(220,38,38,0.04)",
    border: "rgba(220,38,38,0.12)",
    color: "#DC2626",
    label: "Cr\u00EDtico",
  },
  neutral: {
    icon: "\u2139",
    bg: "rgba(45,140,240,0.04)",
    border: "rgba(45,140,240,0.15)",
    color: "#2D8CF0",
    label: "Info",
  },
};

const IMPORTANCE_STYLES: Record<string, { bg: string; border: string; dot: string; label: string }> = {
  high: { bg: "rgba(220,38,38,0.03)", border: "rgba(220,38,38,0.12)", dot: "#DC2626", label: "Alta prioridad" },
  medium: { bg: "rgba(232,112,10,0.03)", border: "rgba(232,112,10,0.12)", dot: "#E8700A", label: "Relevante" },
  low: { bg: "rgba(45,140,240,0.03)", border: "rgba(45,140,240,0.10)", dot: "#2D8CF0", label: "Informativo" },
};

export function NovaLabAnalysis() {
  const [state, setState] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const [analysis, setAnalysis] = useState<LabAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const analyze = async () => {
    setState("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/lab/insights");
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Error al contactar Nova AI");
        setState("error");
        return;
      }
      setAnalysis(data.analysis);
      setState("loaded");
    } catch {
      setErrorMsg("No se pudo conectar con Nova AI");
      setState("error");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] overflow-hidden">
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #273949, #3d5a29)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white text-sm font-bold">An&aacute;lisis Profundo Nova AI</h3>
            <p className="text-white/40 text-[10px]">Qu&iacute;mica, seguridad, normalizaci&oacute;n y preguntas que no sab&iacute;as que deb&iacute;as hacer</p>
          </div>
        </div>
        {state !== "loading" && (
          <button
            onClick={analyze}
            className="text-[10px] font-semibold px-4 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
          >
            {state === "loaded" ? "\u21BB Regenerar" : "\u2726 Analizar"}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-6">
        {/* IDLE */}
        {state === "idle" && (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(39,57,73,0.06), rgba(61,122,10,0.06))" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#273949" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 3v7.4a2 2 0 01-.4 1.2L4 18.6a1 1 0 00.8 1.4h14.4a1 1 0 00.8-1.4l-4.6-7a2 2 0 01-.4-1.2V3" />
                <line x1="8" y1="3" x2="16" y2="3" />
              </svg>
            </div>
            <p className="text-sm text-eco-ink font-medium mb-1">An&aacute;lisis profundo de laboratorio</p>
            <p className="text-xs text-eco-muted mb-4 max-w-md mx-auto leading-relaxed">
              Nova analizar&aacute; la qu&iacute;mica detr&aacute;s de cada resultado, normalizar&aacute; m&eacute;todos ASTM,
              evaluar&aacute; seguridad y te dir&aacute; cosas que no sab&iacute;as que necesitabas preguntar.
            </p>
            <button
              onClick={analyze}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-semibold transition-all hover:shadow-lg hover:scale-105 active:scale-100"
              style={{ background: "linear-gradient(135deg, #273949, #3d7a0a)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
              </svg>
              Iniciar an&aacute;lisis con Nova
            </button>
          </div>
        )}

        {/* LOADING */}
        {state === "loading" && (
          <div className="py-12 text-center space-y-4">
            <div className="flex justify-center gap-1.5">
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  className="w-2.5 h-2.5 rounded-full animate-bounce"
                  style={{ background: "#3d7a0a", animationDelay: `${d}ms` }}
                />
              ))}
            </div>
            <div>
              <p className="text-sm text-eco-ink font-medium">Nova analizando resultados...</p>
              <p className="text-[10px] text-eco-muted mt-1">
                Analizando qu&iacute;mica, normalizando temperaturas, evaluando seguridad, generando insights
              </p>
            </div>
          </div>
        )}

        {/* ERROR */}
        {state === "error" && (
          <div className="py-8 text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-eco-red/5 border border-eco-red/10">
              <span className="text-eco-red text-sm">{"\u26A0"}</span>
              <span className="text-xs text-eco-red">{errorMsg}</span>
            </div>
            <div>
              <button onClick={analyze} className="text-xs text-eco-blue hover:underline">
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* LOADED */}
        {state === "loaded" && analysis && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="p-4 rounded-xl" style={{ background: "linear-gradient(135deg, rgba(39,57,73,0.03), rgba(61,122,10,0.03))", border: "1px solid rgba(39,57,73,0.08)" }}>
              <p className="text-sm text-eco-ink leading-relaxed">{analysis.summary}</p>
            </div>

            {/* Findings */}
            {analysis.findings.length > 0 && (
              <div>
                <h4 className="text-[10px] text-eco-muted uppercase tracking-[2px] font-semibold mb-3">
                  Hallazgos
                </h4>
                <div className="space-y-2.5">
                  {analysis.findings.map((f, i) => {
                    const s = FINDING_STYLES[f.type] || FINDING_STYLES.neutral;
                    return (
                      <div
                        key={i}
                        className="flex gap-3 p-3.5 rounded-xl"
                        style={{ background: s.bg, border: `1px solid ${s.border}` }}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                            style={{ color: s.color, background: `${s.color}15` }}
                          >
                            {s.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-bold" style={{ color: s.color }}>
                              {f.title}
                            </span>
                            <span
                              className="text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                              style={{ color: s.color, background: `${s.color}12` }}
                            >
                              {s.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-eco-ink-light leading-relaxed">{f.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Normalization analysis */}
            {analysis.normalization && (
              <div>
                <h4 className="text-[10px] text-eco-muted uppercase tracking-[2px] font-semibold mb-3 flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                  </svg>
                  Normalizaci&oacute;n de M&eacute;todos
                </h4>
                <div className="p-4 rounded-xl bg-eco-blue/[0.03] border border-eco-blue/10">
                  <p className="text-[11px] text-eco-ink leading-relaxed whitespace-pre-line">{analysis.normalization}</p>
                </div>
              </div>
            )}

            {/* Product characterization */}
            {analysis.productCharacterization && (
              <div>
                <h4 className="text-[10px] text-eco-muted uppercase tracking-[2px] font-semibold mb-3 flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M9 3v7.4a2 2 0 01-.4 1.2L4 18.6a1 1 0 00.8 1.4h14.4a1 1 0 00.8-1.4l-4.6-7a2 2 0 01-.4-1.2V3" />
                  </svg>
                  Caracterizaci&oacute;n del Producto
                </h4>
                <div className="p-4 rounded-xl" style={{ background: "rgba(124,92,252,0.03)", border: "1px solid rgba(124,92,252,0.10)" }}>
                  <p className="text-[11px] text-eco-ink leading-relaxed whitespace-pre-line">{analysis.productCharacterization}</p>
                </div>
              </div>
            )}

            {/* Safety Assessment */}
            {analysis.safetyAssessment && (
              <div>
                <h4 className="text-[10px] text-eco-muted uppercase tracking-[2px] font-semibold mb-3 flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Evaluaci&oacute;n de Seguridad
                </h4>
                <div className="p-4 rounded-xl" style={{ background: "rgba(220,38,38,0.02)", border: "1px solid rgba(220,38,38,0.10)" }}>
                  <p className="text-[11px] text-eco-ink leading-relaxed whitespace-pre-line">{analysis.safetyAssessment}</p>
                </div>
              </div>
            )}

            {/* Proactive Insights — the key section */}
            {analysis.proactiveInsights && analysis.proactiveInsights.length > 0 && (
              <div>
                <h4 className="text-[10px] text-eco-muted uppercase tracking-[2px] font-semibold mb-1 flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  Lo Que No Sab&iacute;as Que Deb&iacute;as Preguntar
                </h4>
                <p className="text-[9px] text-eco-muted mb-3">
                  Nova identific&oacute; estas preguntas cr&iacute;ticas que podr&iacute;an impactar tu operaci&oacute;n
                </p>
                <div className="space-y-3">
                  {analysis.proactiveInsights.map((insight, i) => {
                    const imp = IMPORTANCE_STYLES[insight.importance] || IMPORTANCE_STYLES.medium;
                    return (
                      <div
                        key={i}
                        className="rounded-xl overflow-hidden"
                        style={{ background: imp.bg, border: `1px solid ${imp.border}` }}
                      >
                        {/* Question */}
                        <div className="px-4 py-3 flex items-start gap-3">
                          <span
                            className="flex-shrink-0 mt-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ background: imp.dot }}
                          >
                            ?
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-eco-ink">{insight.question}</span>
                              <span
                                className="text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full flex-shrink-0"
                                style={{ color: imp.dot, background: `${imp.dot}12` }}
                              >
                                {imp.label}
                              </span>
                            </div>
                            <p className="text-[11px] text-eco-ink-light leading-relaxed">{insight.answer}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div>
                <h4 className="text-[10px] text-eco-muted uppercase tracking-[2px] font-semibold mb-3">
                  Recomendaciones
                </h4>
                <div className="space-y-2">
                  {analysis.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-eco-surface-2/50">
                      <span className="text-[10px] font-mono font-bold flex-shrink-0 mt-px w-5 h-5 rounded-full flex items-center justify-center" style={{ color: "#3d7a0a", background: "rgba(61,122,10,0.08)" }}>
                        {i + 1}
                      </span>
                      <p className="text-xs text-eco-ink leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 border-t border-eco-border flex items-center justify-between">
              <p className="text-[8px] text-eco-muted-2 italic">
                An&aacute;lisis generado por Nova AI &middot; Los resultados son orientativos y no sustituyen el criterio profesional
              </p>
              <button
                onClick={analyze}
                className="text-[10px] text-eco-muted hover:text-eco-blue transition-colors"
              >
                {"\u21BB"} Regenerar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
