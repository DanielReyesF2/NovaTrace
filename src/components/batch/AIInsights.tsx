"use client";

import { useState } from "react";

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
  const [state, setState] = useState<"idle" | "loading" | "loaded" | "error">(
    "idle"
  );
  const [insights, setInsights] = useState<NovaInsights | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [showThermal, setShowThermal] = useState(false);

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

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        border: "1px solid transparent",
        backgroundImage:
          "linear-gradient(#FDFAF5, #FDFAF5), linear-gradient(135deg, rgba(39,57,73,0.2), rgba(61,122,10,0.2))",
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
      }}
    >
      <div className="p-5">
        {/* Header — always shown */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, #273949, #3d7a0a)",
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
          </div>
          <div>
            <h3 className="text-sm font-bold text-eco-navy">Nova AI</h3>
            <p className="text-[10px] text-eco-muted">
              Análisis inteligente de rendimiento, temperatura y calidad
            </p>
          </div>
        </div>

        {/* ── IDLE STATE ── */}
        {state === "idle" && (
          <div className="text-center py-6">
            <p className="text-xs text-eco-muted mb-4">
              Nova puede analizar este lote y darte insights sobre el proceso,
              eficiencia térmica, y recomendaciones de mejora.
            </p>
            <button
              onClick={analyze}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition-all hover:shadow-md active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #273949, #3d7a0a)",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
              </svg>
              Analizar este lote
            </button>
          </div>
        )}

        {/* ── LOADING STATE ── */}
        {state === "loading" && (
          <div className="py-6 space-y-4">
            <div className="flex items-center gap-2 justify-center">
              <div className="flex gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{
                    background: "#3d7a0a",
                    animationDelay: "0ms",
                  }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{
                    background: "#3d7a0a",
                    animationDelay: "150ms",
                  }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{
                    background: "#3d7a0a",
                    animationDelay: "300ms",
                  }}
                />
              </div>
              <span className="text-xs text-eco-muted">
                Nova está analizando...
              </span>
            </div>
            {/* Skeleton */}
            <div className="space-y-3">
              <div className="h-4 bg-eco-surface-2 rounded-full animate-pulse w-3/4" />
              <div className="h-4 bg-eco-surface-2 rounded-full animate-pulse w-full" />
              <div className="h-4 bg-eco-surface-2 rounded-full animate-pulse w-5/6" />
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="h-16 bg-eco-surface-2 rounded-lg animate-pulse" />
                <div className="h-16 bg-eco-surface-2 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* ── ERROR STATE ── */}
        {state === "error" && (
          <div className="py-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-eco-red/5 border border-eco-red/10 mb-3">
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

        {/* ── LOADED STATE ── */}
        {state === "loaded" && insights && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-eco-navy/[0.03] to-eco-green/[0.03] border border-eco-border">
              <p className="text-sm text-eco-ink leading-relaxed">
                {insights.summary}
              </p>
            </div>

            {/* Highlights */}
            <div className="space-y-2">
              {insights.highlights.map((h, i) => {
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
                      <p className="text-xs text-eco-ink-light mt-0.5 leading-relaxed">
                        {h.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Thermal Analysis — collapsible */}
            {insights.thermalAnalysis && (
              <div className="border border-eco-border rounded-lg">
                <button
                  onClick={() => setShowThermal(!showThermal)}
                  className="flex items-center justify-between w-full p-3 text-left"
                >
                  <span className="text-[10px] text-eco-muted uppercase tracking-wider">
                    Análisis Térmico Detallado
                  </span>
                  <span
                    className="text-eco-muted transition-transform duration-200"
                    style={{
                      display: "inline-block",
                      transform: showThermal
                        ? "rotate(90deg)"
                        : "rotate(0deg)",
                    }}
                  >
                    ▶
                  </span>
                </button>
                {showThermal && (
                  <div className="px-3 pb-3">
                    <p className="text-xs text-eco-ink-light leading-relaxed">
                      {insights.thermalAnalysis}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Recommendations */}
            {insights.recommendations.length > 0 && (
              <div>
                <h4 className="text-[10px] text-eco-muted uppercase tracking-wider mb-2">
                  Recomendaciones
                </h4>
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

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-eco-border">
              <p className="text-[9px] text-eco-muted-2 italic">
                Análisis generado por Nova AI ·{" "}
                {generatedAt
                  ? new Date(generatedAt).toLocaleString("es-MX", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </p>
              <button
                onClick={analyze}
                className="text-[9px] text-eco-blue hover:underline"
              >
                Regenerar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
