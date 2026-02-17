"use client";

import { useState, useEffect } from "react";

interface NovaInsights {
  summary: string;
  highlights: Array<{
    type: "positive" | "warning" | "neutral";
    title: string;
    detail: string;
  }>;
  thermalAnalysis: string;
  recommendations: string[];
}

interface AIInsightsProps {
  batchId: string;
}

const HIGHLIGHT_STYLES: Record<
  string,
  { icon: string; bg: string; border: string; color: string }
> = {
  positive: {
    icon: "✓",
    bg: "rgba(61,122,10,0.05)",
    border: "rgba(61,122,10,0.15)",
    color: "#3d7a0a",
  },
  warning: {
    icon: "⚠",
    bg: "rgba(232,112,10,0.05)",
    border: "rgba(232,112,10,0.15)",
    color: "#E8700A",
  },
  neutral: {
    icon: "ℹ",
    bg: "rgba(45,140,240,0.05)",
    border: "rgba(45,140,240,0.15)",
    color: "#2D8CF0",
  },
};

export function AIInsights({ batchId }: AIInsightsProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const [insights, setInsights] = useState<NovaInsights | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const analyze = async () => {
    setState("loading");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/batches/${batchId}/insights`);
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Error al contactar Nova AI");
        setState("error");
        return;
      }
      setInsights(data.insights);
      setState("loaded");
    } catch {
      setErrorMsg("No se pudo conectar con Nova AI");
      setState("error");
    }
  };

  // Trigger analysis when panel opens for first time
  useEffect(() => {
    if (open && state === "idle") {
      analyze();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      {/* ── Floating Button ── */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-100"
        style={{
          background: "linear-gradient(135deg, #273949, #3d7a0a)",
        }}
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
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
        </svg>
        <span className="text-white text-xs font-semibold">Nova AI</span>
      </button>

      {/* ── Slide-out Panel ── */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
            {/* Panel Header */}
            <div
              className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #273949, #3d5a29)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
                </svg>
                <span className="text-white text-sm font-bold">
                  Análisis Nova AI
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/60 hover:text-white transition-colors text-lg px-2"
              >
                ✕
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* LOADING */}
              {state === "loading" && (
                <div className="py-12 text-center space-y-4">
                  <div className="flex justify-center gap-1.5">
                    {[0, 150, 300].map((d) => (
                      <span
                        key={d}
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ background: "#3d7a0a", animationDelay: `${d}ms` }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-eco-muted">
                    Nova analizando el lote...
                  </p>
                </div>
              )}

              {/* ERROR */}
              {state === "error" && (
                <div className="py-12 text-center space-y-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-eco-red/5 border border-eco-red/10">
                    <span className="text-eco-red text-sm">⚠</span>
                    <span className="text-xs text-eco-red">{errorMsg}</span>
                  </div>
                  <div>
                    <button
                      onClick={analyze}
                      className="text-xs text-eco-blue hover:underline"
                    >
                      Reintentar
                    </button>
                  </div>
                </div>
              )}

              {/* LOADED */}
              {state === "loaded" && insights && (
                <>
                  {/* Summary */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-eco-navy/[0.03] to-eco-green/[0.03] border border-eco-border">
                    <p className="text-sm text-eco-ink leading-relaxed">
                      {insights.summary}
                    </p>
                  </div>

                  {/* Highlights */}
                  {insights.highlights.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-eco-muted uppercase tracking-wider font-medium">
                        Hallazgos clave
                      </p>
                      {insights.highlights.map((h, i) => {
                        const s = HIGHLIGHT_STYLES[h.type] || HIGHLIGHT_STYLES.neutral;
                        return (
                          <div
                            key={i}
                            className="flex gap-3 p-3 rounded-lg"
                            style={{ background: s.bg, border: `1px solid ${s.border}` }}
                          >
                            <span
                              className="text-[10px] font-bold flex-shrink-0 mt-0.5"
                              style={{ color: s.color }}
                            >
                              {s.icon}
                            </span>
                            <div>
                              <span
                                className="text-xs font-semibold"
                                style={{ color: s.color }}
                              >
                                {h.title}
                              </span>
                              <p className="text-[11px] text-eco-ink-light mt-0.5 leading-relaxed">
                                {h.detail}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Thermal Analysis */}
                  {insights.thermalAnalysis && (
                    <div>
                      <p className="text-[10px] text-eco-muted uppercase tracking-wider font-medium mb-2">
                        Análisis Térmico
                      </p>
                      <p className="text-xs text-eco-ink-light leading-relaxed p-3 rounded-lg bg-eco-surface-2/50">
                        {insights.thermalAnalysis}
                      </p>
                    </div>
                  )}

                  {/* Recommendations */}
                  {insights.recommendations.length > 0 && (
                    <div>
                      <p className="text-[10px] text-eco-muted uppercase tracking-wider font-medium mb-2">
                        Recomendaciones
                      </p>
                      <div className="space-y-1.5">
                        {insights.recommendations.map((rec, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 p-2.5 rounded-lg bg-eco-surface-2/50"
                          >
                            <span className="text-[10px] font-mono font-bold flex-shrink-0 mt-px" style={{ color: "#3d7a0a" }}>
                              {i + 1}.
                            </span>
                            <p className="text-xs text-eco-ink leading-relaxed">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Regenerate */}
                  <div className="flex items-center justify-center pt-3 border-t border-eco-border">
                    <button
                      onClick={analyze}
                      className="text-[10px] text-eco-muted hover:text-eco-blue transition-colors"
                    >
                      ↻ Regenerar análisis
                    </button>
                  </div>
                </>
              )}

              {/* IDLE (shouldn't show, but just in case) */}
              {state === "idle" && (
                <div className="py-12 text-center">
                  <button
                    onClick={analyze}
                    className="text-sm text-eco-blue hover:underline"
                  >
                    Iniciar análisis
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
