"use client";

import Link from "next/link";

interface NovaAISummaryProps {
  lastBatchId: string | null;
}

export function NovaAISummary({ lastBatchId }: NovaAISummaryProps) {
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
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
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
          </div>
          <div>
            <h3 className="text-sm font-bold text-eco-navy">Nova AI</h3>
            <p className="text-[10px] text-eco-muted">
              Inteligencia artificial de EcoNova
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-eco-ink-light leading-relaxed mb-4">
          Nova analiza cada lote en detalle: rendimiento, perfil térmico,
          eventos del proceso, resultados de laboratorio e impacto ambiental.
          Abre un lote para obtener insights con AI.
        </p>

        {/* Capabilities */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { icon: "🌡", label: "Perfil térmico" },
            { icon: "📊", label: "Rendimiento" },
            { icon: "🔬", label: "Calidad" },
            { icon: "🌱", label: "Impacto CO₂" },
          ].map((cap) => (
            <div
              key={cap.label}
              className="flex items-center gap-1.5 text-[10px] text-eco-muted"
            >
              <span>{cap.icon}</span>
              {cap.label}
            </div>
          ))}
        </div>

        {/* CTA */}
        {lastBatchId && (
          <Link
            href={`/batch/${lastBatchId}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-white text-xs font-semibold transition-all hover:shadow-md active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #273949, #3d7a0a)",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
            </svg>
            Analizar último lote con Nova
          </Link>
        )}
      </div>
    </div>
  );
}
