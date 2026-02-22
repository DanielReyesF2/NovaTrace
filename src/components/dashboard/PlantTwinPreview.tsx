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

/* ── Pre-defined positions with good spatial separation ── */
const ANNOTATION_POSITIONS: [number, number, number][] = [
  [-3.5, 1.8, -1.0], // far-left, upper
  [3.2, 0.8, 1.5],   // far-right, lower
  [0.0, 2.5, -3.0],  // center-back, upper
  [-2.0, 0.5, 3.0],  // left-front, low
  [2.5, 2.0, -2.0],  // right-back, upper
];

/* ── Annotation generation — max 5, priority-sorted, spatially separated ── */
function generateAnnotations(equipment: EquipmentSummary[]) {
  const annotatable = equipment.filter((eq) => eq.subsystem && eq.tag);

  // Priority: critical first, then warning, then normal
  const priority: Record<string, number> = { EXPIRED: 0, EXPIRING: 1, VALID: 2, RETIRED: 3 };
  const sorted = [...annotatable].sort(
    (a, b) => (priority[a.calibrationStatus] ?? 2) - (priority[b.calibrationStatus] ?? 2)
  );

  return sorted.slice(0, ANNOTATION_POSITIONS.length).map((eq, i) => ({
    id: eq.id,
    position: ANNOTATION_POSITIONS[i],
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
  }));
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
              Planta DY-500{modelInfo ? ` · ${modelInfo.meshCount} mallas` : ""}
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

      {/* Content: Full-bleed 3D Viewer */}
      <div className="relative h-[440px] min-h-[360px]">
        <ModelViewer
          modelUrl={modelUrl}
          mtlUrl={mtlUrl}
          showGrid
          showAnnotations
          annotations={annotations}
          onModelLoaded={handleModelLoaded}
        />

        {/* Bottom-left: live badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-eco-navy/80 backdrop-blur-sm text-white/50 text-[9px] font-mono px-2.5 py-1 rounded-lg">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-eco-green animate-pulse" />
          3D Live
        </div>

        {/* Bottom-right: floating pills */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {alertCount > 0 && (
            <div className="flex items-center gap-1.5 bg-eco-red/90 backdrop-blur-sm text-white text-[9px] font-semibold px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
              {alertCount} alerta{alertCount > 1 ? "s" : ""}
            </div>
          )}
          <div className="bg-eco-navy/80 backdrop-blur-sm text-white/40 text-[9px] font-mono px-2.5 py-1 rounded-lg">
            {equipment.length} equipos
          </div>
        </div>
      </div>
    </div>
  );
}
