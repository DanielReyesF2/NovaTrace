"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, useCallback } from "react";

const ModelViewer = dynamic(
  () => import("@/components/equipment/ModelViewer"),
  { ssr: false }
);

/* ── Types ── */
interface EquipmentSummary {
  id: string;
  name: string;
  tag: string | null;
  type: string;
  calibrationStatus: string;
  calibrationExpiry: string | null;
  location: string | null;
  subsystem: string | null;
  specs: Record<string, unknown> | null;
  _count: { childEquipment: number };
}

interface PlantTwinPreviewProps {
  equipment: EquipmentSummary[];
  modelUrl?: string;
  mtlUrl?: string;
}

/* ── Status helpers ── */
const STATUS_MAP: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  VALID: { label: "Vigente", color: "#3d7a0a", bg: "rgba(61,122,10,0.08)", dot: "#3d7a0a" },
  EXPIRING: { label: "Por Vencer", color: "#E8700A", bg: "rgba(232,112,10,0.08)", dot: "#E8700A" },
  EXPIRED: { label: "Vencida", color: "#DC2626", bg: "rgba(220,38,38,0.06)", dot: "#DC2626" },
  RETIRED: { label: "Retirado", color: "#6b7280", bg: "rgba(107,114,128,0.08)", dot: "#6b7280" },
};

/* ── Annotation generation ── */
function generateAnnotations(equipment: EquipmentSummary[]) {
  const annotatable = equipment.filter(
    (eq) => eq.subsystem && eq.tag
  );
  const grid = annotatable.map((eq, i) => {
    const angle = (i / Math.max(annotatable.length, 1)) * Math.PI * 2;
    const radius = 2 + (i % 3) * 0.8;
    return {
      id: eq.id,
      position: [
        Math.cos(angle) * radius,
        0.6 + (i % 3) * 0.5,
        Math.sin(angle) * radius,
      ] as [number, number, number],
      label: eq.tag || eq.name,
      description: eq.name,
      status:
        eq.calibrationStatus === "EXPIRED"
          ? ("critical" as const)
          : eq.calibrationStatus === "EXPIRING"
            ? ("warning" as const)
            : ("normal" as const),
      metrics: eq.specs
        ? Object.entries(eq.specs as Record<string, unknown>)
            .slice(0, 3)
            .map(([k, v]) => ({
              label: k.replace(/([A-Z])/g, " $1").trim(),
              value: String(v),
            }))
        : [],
    };
  });
  return grid;
}

/* ── Component ── */
export function PlantTwinPreview({
  equipment,
  modelUrl = "/models/scan-001/21_2_2026.obj",
  mtlUrl = "/models/scan-001/21_2_2026.mtl",
}: PlantTwinPreviewProps) {
  const [modelInfo, setModelInfo] = useState<{ name: string; meshCount: number } | null>(null);
  const annotations = generateAnnotations(equipment);

  const handleModelLoaded = useCallback(
    (info: { name: string; meshCount: number }) => setModelInfo(info),
    []
  );

  // Counts
  const alertCount = equipment.filter(
    (e) => e.calibrationStatus === "EXPIRED" || e.calibrationStatus === "EXPIRING"
  ).length;

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-eco-navy/5">
            <svg className="h-4 w-4 text-eco-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-eco-ink">
              Gemelo Digital — Planta DY-500
            </h2>
            <p className="text-[10px] text-eco-muted">
              {equipment.length} equipos
              {modelInfo ? ` · ${modelInfo.meshCount} meshes` : ""}
              {alertCount > 0 && (
                <span className="text-eco-red ml-1">
                  · {alertCount} alerta{alertCount > 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>
        </div>
        <Link
          href="/equipment"
          className="text-[11px] font-medium text-eco-green hover:text-eco-green/80 flex items-center gap-1 transition-colors"
        >
          Ver Planta Completa
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>

      {/* Content: 3D Viewer + Equipment sidebar */}
      <div className="flex flex-col lg:flex-row">
        {/* 3D Viewer */}
        <div className="flex-1 h-[380px] min-h-[300px] relative">
          <ModelViewer
            modelUrl={modelUrl}
            mtlUrl={mtlUrl}
            showGrid
            showAnnotations
            annotations={annotations}
            onModelLoaded={handleModelLoaded}
          />
          {/* Overlay badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-eco-navy/80 backdrop-blur-sm text-white/60 text-[9px] font-mono px-2.5 py-1 rounded-lg">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-eco-green animate-pulse" />
            3D Live
          </div>
        </div>

        {/* Equipment sidebar */}
        <div className="lg:w-72 border-t lg:border-t-0 lg:border-l border-black/[0.04] max-h-[380px] overflow-y-auto">
          <div className="p-4 space-y-1">
            <p className="text-[9px] tracking-[1.5px] text-eco-muted uppercase font-medium mb-3">
              Equipos Principales
            </p>
            {equipment.slice(0, 8).map((eq) => {
              const status = STATUS_MAP[eq.calibrationStatus] || STATUS_MAP.VALID;
              return (
                <Link
                  key={eq.id}
                  href={`/equipment/${eq.id}/twin`}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-eco-surface-2/50 transition-colors group"
                >
                  <span
                    className="mt-1 block h-2 w-2 rounded-full flex-shrink-0"
                    style={{ background: status.dot }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-eco-ink truncate group-hover:text-eco-green transition-colors">
                      {eq.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {eq.tag && (
                        <span className="font-mono text-[9px] text-eco-muted">
                          {eq.tag}
                        </span>
                      )}
                      <span
                        className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{ color: status.color, background: status.bg }}
                      >
                        {status.label}
                      </span>
                    </div>
                    {eq._count.childEquipment > 0 && (
                      <p className="text-[9px] text-eco-muted mt-0.5">
                        {eq._count.childEquipment} sub-componente{eq._count.childEquipment > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                  <svg className="h-3 w-3 text-eco-muted/40 mt-1 flex-shrink-0 group-hover:text-eco-green transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              );
            })}
            {equipment.length > 8 && (
              <Link
                href="/equipment"
                className="block text-center text-[10px] text-eco-muted hover:text-eco-green py-2 transition-colors"
              >
                + {equipment.length - 8} equipos m\u00e1s
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
