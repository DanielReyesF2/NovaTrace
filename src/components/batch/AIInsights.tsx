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
    icon: "\u2713",
    bg: "rgba(61,122,10,0.05)",
    border: "rgba(61,122,10,0.15)",
    color: "#3d7a0a",
  },
  warning: {
    icon: "\u26A0",
    bg: "rgba(232,112,10,0.05)",
    border: "rgba(232,112,10,0.15)",
    color: "#E8700A",
  },
  neutral: {
    icon: "\u2139",
    bg: "rgba(45,140,240,0.05)",
    border: "rgba(45,140,240,0.15)",
    color: "#2D8CF0",
  },
};

export function AIInsights({ batchId }: AIInsightsProps) {
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");
  const [insights, setInsights] = useState<NovaInsights | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [showFull, setShowFull] = useState(false);

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
      setGeneratedAt(data.generatedAt);
      setState("loaded");
    } catch {
      setErrorMsg("No se pudo conectar con Nova AI");
      setState("error");
    }
  };

  // Auto-analyze on mount
  useEffect(() => {
    analyze();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId]);

  // Top 3 highlights for the summary card
  const topHighlights = insights?.highlights?.slice(0, 3) ?? [];

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-soft"
      style={{
        border: "1px solid transparent",
        backgroundImage:
          "linear-gradient(#FDFAF5, #FDFAF5), linear-gradient(135deg, rgba(39,57,73,0.2), rgba(61,122,10,0.2))",
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
      }}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #273949, #3d7a0a)",
            }}
          >
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
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-eco-navy">
              Resumen Ejecutivo — Nova AI
            </h3>
          </div>
          {state === "loaded" && (
            <span className="text-[9px] text-eco-muted-2 font-mono whitespace-nowrap">
              {generatedAt
                ? new Date(generatedAt).toLocaleString("es-MX", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </span>
          )}
        </div>

        {/* ── LOADING STATE ── */}
        {state === "loading" && (
          <div className="py-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{ background: "#3d7a0a", animationDelay: "0ms" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{ background: "#3d7a0a", animationDelay: "150ms" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{ background: "#3d7a0a", animationDelay: "300ms" }}
                />
              </div>
              <span className="text-xs text-eco-muted">
                Nova analizando el lote...
              </span>
            </div>
            <div className="space-y-2.5">
              <div className="h-14 bg-eco-surface-2 rounded-lg animate-pulse" />
              <div className="h-14 bg-eco-surface-2 rounded-lg animate-pulse" />
              <div className="h-14 bg-eco-surface-2 rounded-lg animate-pulse" />
            </div>
          </div>
        )}

        {/* ── ERROR STATE ── */}
        {state === "error" && (
          <div className="py-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-eco-red/5 border border-eco-red/10 mb-3">
              <span className="text-eco-red text-sm">{"\u26A0"}</span>
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

        {/* ── LOADED: Top 3 Highlights (always visible) ── */}
        {state === "loaded" && insights && (
          <div className="space-y-3">
            {/* Top 3 key findings */}
            <div className="space-y-2">
              {topHighlights.map((h, i) => {
                const style =
                  HIGHLIGHT_STYLES[h.type] || HIGHLIGHT_STYLES.neutral;
                return (
                  <div
                    key={i}
                    className="flex gap-3 p-3 rounded-lg"
                    style={{
                      background: style.bg,
                      border: `1px solid ${style.border}`,
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5"
                      style={{ color: style.color }}
                    >
                      {style.icon}
                    </div>
                    <div className="min-w-0">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: style.color }}
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

            {/* Expand to full analysis */}
            <button
              onClick={() => setShowFull(!showFull)}
              className="flex items-center gap-2 w-full py-2 text-left group"
            >
              <span
                className="text-eco-muted text-[10px] transition-transform duration-200"
                style={{
                  display: "inline-block",
                  transform: showFull ? "rotate(90deg)" : "rotate(0deg)",
                }}
              >
                {"\u25B6"}
              </span>
              <span className="text-[11px] text-eco-muted group-hover:text-eco-ink transition-colors">
                {showFull
                  ? "Ocultar análisis completo"
                  : "Ver análisis completo de Nova"}
              </span>
            </button>

            {/* Full analysis (collapsible) */}
            {showFull && (
              <div className="space-y-4 animate-fade-in pt-1 border-t border-eco-border">
                {/* Summary */}
                <div className="p-3 rounded-lg bg-gradient-to-r from-eco-navy/[0.03] to-eco-green/[0.03] border border-eco-border mt-3">
                  <p className="text-[11px] text-eco-muted uppercase tracking-wider mb-1.5 font-medium">
                    Resumen
                  </p>
                  <p className="text-sm text-eco-ink leading-relaxed">
                    {insights.summary}
                  </p>
                </div>

                {/* Remaining highlights (beyond top 3) */}
                {insights.highlights.length > 3 && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-eco-muted uppercase tracking-wider font-medium">
                      Hallazgos adicionales
                    </p>
                    {insights.highlights.slice(3).map((h, i) => {
                      const style =
                        HIGHLIGHT_STYLES[h.type] || HIGHLIGHT_STYLES.neutral;
                      return (
                        <div
                          key={i}
                          className="flex gap-3 p-3 rounded-lg"
                          style={{
                            background: style.bg,
                            border: `1px solid ${style.border}`,
                          }}
                        >
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5"
                            style={{ color: style.color }}
                          >
                            {style.icon}
                          </div>
                          <div className="min-w-0">
                            <span
                              className="text-xs font-semibold"
                              style={{ color: style.color }}
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
                    <p className="text-[11px] text-eco-muted uppercase tracking-wider font-medium mb-1.5">
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
                    <p className="text-[11px] text-eco-muted uppercase tracking-wider font-medium mb-1.5">
                      Recomendaciones
                    </p>
                    <div className="space-y-1.5">
                      {insights.recommendations.map((rec, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 p-2.5 rounded-lg bg-eco-surface-2/50"
                        >
                          <span
                            className="text-[10px] font-mono font-bold flex-shrink-0 mt-px"
                            style={{ color: "#3d7a0a" }}
                          >
                            {i + 1}.
                          </span>
                          <p className="text-xs text-eco-ink leading-relaxed">
                            {rec}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Regenerate */}
                <div className="flex items-center justify-end pt-2 border-t border-eco-border">
                  <button
                    onClick={analyze}
                    className="text-[9px] text-eco-blue hover:underline"
                  >
                    Regenerar análisis
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
