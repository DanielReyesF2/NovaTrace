"use client";

import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

interface TraceabilityPipelineProps {
  stats: {
    totalBatches: number;
    totalFeedstockKg: number;
    totalOilLiters: number;
    totalCO2Avoided: number;
  };
  totalCerts: number;
}

const STEPS = [
  {
    label: "Recolección",
    key: "recoleccion",
    color: "#273949",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    label: "Transporte",
    key: "transporte",
    color: "#273949",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    label: "Planta",
    key: "planta",
    color: "#273949",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20V8l5-5v5l5-5v5l5-5v17" />
        <path d="M2 20h20" />
        <rect x="17" y="2" width="5" height="8" rx="0.5" />
      </svg>
    ),
  },
  {
    label: "Pirólisis",
    key: "pirolisis",
    color: "#E8700A",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
      </svg>
    ),
  },
  {
    label: "Aceite",
    key: "aceite",
    color: "#7C5CFC",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
      </svg>
    ),
  },
  {
    label: "Lab",
    key: "lab",
    color: "#2D8CF0",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3v7.4a2 2 0 01-.4 1.2L4 18.6a1 1 0 00.8 1.4h14.4a1 1 0 00.8-1.4l-4.6-7a2 2 0 01-.4-1.2V3" />
        <line x1="8" y1="3" x2="16" y2="3" />
      </svg>
    ),
  },
  {
    label: "Certificado",
    key: "certificado",
    color: "#3d7a0a",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
];

export function TraceabilityPipeline({ stats, totalCerts }: TraceabilityPipelineProps) {
  // Determine which steps are "active" based on real data
  const stepMetrics: Record<string, { value: number; unit: string } | null> = {
    recoleccion: stats.totalBatches > 0 ? { value: stats.totalBatches, unit: "lotes" } : null,
    transporte: stats.totalBatches > 0 ? { value: stats.totalBatches, unit: "" } : null,
    planta: stats.totalFeedstockKg > 0 ? { value: stats.totalFeedstockKg, unit: "kg" } : null,
    pirolisis: stats.totalFeedstockKg > 0 ? { value: stats.totalFeedstockKg, unit: "kg" } : null,
    aceite: stats.totalOilLiters > 0 ? { value: stats.totalOilLiters, unit: "L" } : null,
    lab: stats.totalOilLiters > 0 ? { value: stats.totalOilLiters, unit: "" } : null,
    certificado: totalCerts > 0 ? { value: totalCerts, unit: "certs" } : null,
  };

  return (
    <div className="bg-white rounded-2xl px-5 py-4 shadow-soft border border-black/[0.03]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] tracking-[2px] text-eco-muted uppercase font-medium">
          Ciclo de Trazabilidad
        </h3>
        <span className="text-[9px] text-eco-muted-2 font-mono">
          {stats.totalCO2Avoided > 0 && (
            <>
              <span style={{ color: "#3d7a0a" }}>{stats.totalCO2Avoided.toFixed(0)}</span>
              {" "}kg CO₂ evitadas
            </>
          )}
        </span>
      </div>

      {/* Horizontal process flow */}
      <div className="flex items-start">
        {STEPS.map((step, i) => {
          const metric = stepMetrics[step.key];
          const isActive = metric !== null;
          const showMetric = metric && metric.unit; // only show if has a unit (not pass-through)

          return (
            <div key={step.key} className="flex items-start flex-1 min-w-0">
              {/* Step node */}
              <div className="flex flex-col items-center min-w-0" style={{ width: "100%" }}>
                {/* Circle */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500"
                  style={{
                    background: isActive ? `${step.color}12` : "rgba(0,0,0,0.02)",
                    border: `1.5px solid ${isActive ? step.color : "rgba(0,0,0,0.06)"}`,
                    color: isActive ? step.color : "rgba(0,0,0,0.15)",
                  }}
                >
                  {step.icon}
                </div>

                {/* Label */}
                <span
                  className="text-[8px] font-semibold mt-1.5 text-center leading-tight tracking-wide uppercase"
                  style={{
                    color: isActive ? step.color : "rgba(0,0,0,0.2)",
                  }}
                >
                  {step.label}
                </span>

                {/* Metric */}
                {showMetric ? (
                  <div className="mt-0.5 text-center">
                    <span style={{ color: step.color }}>
                      <AnimatedCounter
                        value={metric.value}
                        className="font-mono text-[10px] font-bold"
                      />
                    </span>
                    <span className="text-[7px] text-eco-muted ml-0.5">
                      {metric.unit}
                    </span>
                  </div>
                ) : (
                  <div className="mt-0.5 h-[14px]" />
                )}
              </div>

              {/* Connector line + chevron (not after last) */}
              {i < STEPS.length - 1 && (
                <div className="flex items-center self-center mt-0.5 -mx-1 flex-shrink-0" style={{ marginTop: "6px" }}>
                  <div
                    className="h-px flex-1"
                    style={{
                      width: "16px",
                      background: isActive && stepMetrics[STEPS[i + 1].key]
                        ? `linear-gradient(90deg, ${step.color}40, ${STEPS[i + 1].color}40)`
                        : "rgba(0,0,0,0.06)",
                    }}
                  />
                  <svg
                    width="6"
                    height="8"
                    viewBox="0 0 6 8"
                    fill="none"
                    className="flex-shrink-0"
                  >
                    <path
                      d="M1 1l3 3-3 3"
                      stroke={
                        isActive && stepMetrics[STEPS[i + 1].key]
                          ? `${step.color}60`
                          : "rgba(0,0,0,0.08)"
                      }
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div
                    className="h-px flex-1"
                    style={{
                      width: "16px",
                      background: isActive && stepMetrics[STEPS[i + 1].key]
                        ? `linear-gradient(90deg, ${step.color}40, ${STEPS[i + 1].color}40)`
                        : "rgba(0,0,0,0.06)",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
