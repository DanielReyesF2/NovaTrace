"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { Annotation } from "./AnnotationMarkers";

// Dynamic import with SSR disabled — critical for Three.js
const ModelViewer = dynamic(() => import("./ModelViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-eco-navy">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-eco-green/30 border-t-eco-green" />
        <span className="text-xs text-white/40">Inicializando viewer 3D…</span>
      </div>
    </div>
  ),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ChildEquipment {
  id: string;
  name: string;
  type: string;
  tag: string | null;
  subsystem: string | null;
  specs: Record<string, unknown> | null;
  location: string | null;
  calibrationStatus: string;
  calibrationExpiry: string | null;
  isActive: boolean;
  _count: { readings: number };
}

interface Reading {
  id: string;
  timestamp: string;
  reactorTemp: number | null;
  controlTemp: number | null;
  steelTemp: number | null;
  chainTemp: number | null;
  compressorPsi: number | null;
  regulatorPsi: number | null;
  damperPosition: number | null;
}

interface EquipmentData {
  id: string;
  name: string;
  type: string;
  tag: string | null;
  serialNumber: string | null;
  manufacturer: string | null;
  model: string | null;
  location: string | null;
  subsystem: string | null;
  specs: Record<string, unknown> | null;
  calibrationStatus: string;
  calibrationExpiry: string | null;
  isActive: boolean;
  childEquipment: ChildEquipment[];
  parentEquipment: { id: string; name: string; tag: string | null } | null;
  readings: Reading[];
  createdBy: { id: string; name: string } | null;
}

interface EquipmentTwinProps {
  equipment: EquipmentData;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const SUBSYSTEM_COLORS: Record<string, string> = {
  PYROLYSIS: "#E8700A",
  DISTILLATION: "#2D8CF0",
  UTILITIES: "#6B7280",
  INSTRUMENTATION: "#7C5CFC",
};

const TYPE_LABELS: Record<string, string> = {
  REACTOR: "Reactor",
  DISTILLER: "Destilador",
  CONDENSER: "Condensador",
  BUFFER_CHAMBER: "Amortiguador",
  BURNER: "Quemador",
  BLOWER: "Soplador",
  PUMP: "Bomba",
  COMPRESSOR: "Compresor",
  TANK: "Tanque",
  VALVE: "Valvula",
  DAMPER: "Damper",
  COOLING_TOWER: "Torre enfriamiento",
  GAS_SYSTEM: "Sist. gas",
  PIPING: "Tuberia",
  THERMOCOUPLE: "Termopar",
  SCALE: "Bascula",
  FLOW_METER: "Caudalimetro",
  PRESSURE_GAUGE: "Manometro",
  HYGROMETER: "Higrometro",
  TIMER: "Temporizador",
  CONTROL_PANEL: "Panel control",
  CONVEYOR: "Transmision",
  OTHER: "Otro",
};

function calibrationToStatus(status: string): "normal" | "warning" | "critical" {
  if (status === "EXPIRED") return "critical";
  if (status === "EXPIRING") return "warning";
  return "normal";
}

function specsToMetrics(specs: Record<string, unknown> | null): { label: string; value: string; unit?: string }[] {
  if (!specs) return [];
  const metrics: { label: string; value: string; unit?: string }[] = [];

  const specMap: Record<string, { label: string; unit?: string }> = {
    powerKw: { label: "Potencia", unit: "kW" },
    capacityKg: { label: "Capacidad", unit: "kg" },
    volumeL: { label: "Volumen", unit: "L" },
    operatingTempRange: { label: "Rango temp." },
    pressureRange: { label: "Rango presion" },
    flowRateL: { label: "Flujo", unit: "L/min" },
    material: { label: "Material" },
    rangeC: { label: "Rango", unit: "°C" },
    accuracy: { label: "Precision" },
    rangePsi: { label: "Rango", unit: "PSI" },
    resolution: { label: "Resolucion" },
    dimensions: { label: "Dimensiones" },
    fuelType: { label: "Combustible" },
  };

  for (const [key, val] of Object.entries(specs)) {
    if (val === null || val === undefined) continue;
    const mapping = specMap[key];
    if (mapping) {
      metrics.push({ label: mapping.label, value: String(val), unit: mapping.unit });
    }
  }

  return metrics.slice(0, 4); // Max 4 metrics per annotation
}

// Pre-defined positions with good spatial separation (detail page shows more)
const DETAIL_POSITIONS: [number, number, number][] = [
  [-3.5, 1.8, -1.0],
  [3.2, 0.8, 1.5],
  [0.0, 2.5, -3.0],
  [-2.0, 0.5, 3.0],
  [2.5, 2.0, -2.0],
  [-1.0, 1.5, 3.5],
  [3.0, 1.2, -0.5],
  [-3.0, 2.2, 1.5],
  [1.5, 0.8, -3.5],
  [0.0, 1.0, 2.8],
];

// Generate annotations from child equipment data
function generateAnnotations(children: ChildEquipment[]): Annotation[] {
  return children.slice(0, DETAIL_POSITIONS.length).map((child, i) => ({
    id: child.id,
    position: DETAIL_POSITIONS[i],
    label: child.tag ? `${child.tag} — ${child.name}` : child.name,
    description: `${TYPE_LABELS[child.type] ?? child.type}${child.location ? ` · ${child.location}` : ""}`,
    status: calibrationToStatus(child.calibrationStatus),
    metrics: [
      ...specsToMetrics(child.specs),
      { label: "Lecturas", value: String(child._count.readings) },
    ].slice(0, 4),
  }));
}

// ---------------------------------------------------------------------------
// Demo scan — pre-loaded Polycam model
// ---------------------------------------------------------------------------
const DEMO_MODEL = {
  objUrl: "/models/scan-001/21_2_2026.obj",
  mtlUrl: "/models/scan-001/21_2_2026.mtl",
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function EquipmentTwin({ equipment }: EquipmentTwinProps) {
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [modelInfo, setModelInfo] = useState<{ name: string; meshCount: number } | null>(null);

  const handleModelLoaded = useCallback((info: { name: string; meshCount: number }) => {
    setModelInfo(info);
  }, []);

  const annotations = generateAnnotations(equipment.childEquipment);
  const subsystemColor = SUBSYSTEM_COLORS[equipment.subsystem ?? ""] ?? "#6B7280";
  const latestReading = equipment.readings[0] ?? null;

  return (
    <div className="flex h-screen flex-col bg-eco-bg">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-eco-border bg-white px-5 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/equipment"
            className="flex items-center gap-1.5 text-[11px] text-eco-muted hover:text-eco-ink transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Equipos
          </Link>
          <div className="h-5 w-px bg-eco-border" />
          <div>
            <div className="flex items-center gap-2">
              {equipment.tag && (
                <span className="font-mono text-[9px] text-eco-muted bg-eco-bg px-1.5 py-0.5 rounded">
                  {equipment.tag}
                </span>
              )}
              <h1 className="text-sm font-semibold text-eco-ink">{equipment.name}</h1>
              <span
                className="text-[8px] font-semibold px-2 py-0.5 rounded-full uppercase"
                style={{ color: subsystemColor, background: `${subsystemColor}15` }}
              >
                {equipment.subsystem ?? "—"}
              </span>
            </div>
            <p className="text-[10px] text-eco-muted mt-0.5">
              {TYPE_LABELS[equipment.type] ?? equipment.type}
              {equipment.manufacturer ? ` · ${equipment.manufacturer}` : ""}
              {equipment.model ? ` ${equipment.model}` : ""}
              {" · Gemelo Digital 3D"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {modelInfo && (
            <span className="text-[10px] text-eco-muted bg-eco-bg px-2.5 py-1 rounded-lg">
              {modelInfo.meshCount} meshes
            </span>
          )}
          {/* Toggle buttons */}
          <button
            onClick={() => setShowGrid((v) => !v)}
            className={`p-1.5 rounded-lg transition-colors ${showGrid ? "bg-eco-green-dim text-eco-green" : "text-eco-muted hover:bg-eco-bg"}`}
            title="Grid"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </button>
          <button
            onClick={() => setShowAnnotations((v) => !v)}
            className={`p-1.5 rounded-lg transition-colors ${showAnnotations ? "bg-eco-green-dim text-eco-green" : "text-eco-muted hover:bg-eco-bg"}`}
            title="Etiquetas"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* 3D Viewer */}
        <div className="relative flex-1">
          <ModelViewer
            modelUrl={DEMO_MODEL.objUrl}
            mtlUrl={DEMO_MODEL.mtlUrl}
            showGrid={showGrid}
            showAnnotations={showAnnotations}
            annotations={annotations}
            onModelLoaded={handleModelLoaded}
          />

          {/* Equipment count badge */}
          {equipment.childEquipment.length > 0 && (
            <div className="absolute top-4 left-4 z-10 bg-eco-navy/90 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/10">
              <span className="text-[10px] text-white/60">
                {equipment.childEquipment.length} componentes
              </span>
            </div>
          )}
        </div>

        {/* Right panel — Equipment info */}
        <aside className="hidden w-80 border-l border-eco-border bg-white lg:flex lg:flex-col overflow-y-auto">
          {/* Specs section */}
          <div className="border-b border-eco-border px-4 py-4">
            <h3 className="text-[9px] text-eco-muted uppercase tracking-wider font-semibold mb-3">
              Especificaciones
            </h3>
            {equipment.specs && Object.keys(equipment.specs).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(equipment.specs as Record<string, unknown>).map(([key, val]) => {
                  if (val === null || val === undefined) return null;
                  const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
                  return (
                    <div key={key} className="flex justify-between items-baseline">
                      <span className="text-[10px] text-eco-muted">{label}</span>
                      <span className="text-[11px] text-eco-ink font-medium">{String(val)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[10px] text-eco-muted-2">Sin especificaciones</p>
            )}
          </div>

          {/* Latest reading */}
          {latestReading && (
            <div className="border-b border-eco-border px-4 py-4">
              <h3 className="text-[9px] text-eco-muted uppercase tracking-wider font-semibold mb-3">
                Ultima lectura
              </h3>
              <p className="text-[9px] text-eco-muted-2 mb-2">
                {new Date(latestReading.timestamp).toLocaleString("es-MX", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {latestReading.reactorTemp != null && (
                  <ReadingCell label="Reactor" value={latestReading.reactorTemp} unit="°C" warn={latestReading.reactorTemp > 450} />
                )}
                {latestReading.controlTemp != null && (
                  <ReadingCell label="Control" value={latestReading.controlTemp} unit="°C" />
                )}
                {latestReading.steelTemp != null && (
                  <ReadingCell label="Acero" value={latestReading.steelTemp} unit="°C" />
                )}
                {latestReading.chainTemp != null && (
                  <ReadingCell label="Cadena" value={latestReading.chainTemp} unit="°C" warn={latestReading.chainTemp > 80} />
                )}
                {latestReading.compressorPsi != null && (
                  <ReadingCell label="Compresor" value={latestReading.compressorPsi} unit="PSI" />
                )}
                {latestReading.regulatorPsi != null && (
                  <ReadingCell label="Regulador" value={latestReading.regulatorPsi} unit="PSI" />
                )}
              </div>
            </div>
          )}

          {/* Child equipment list */}
          {equipment.childEquipment.length > 0 && (
            <div className="px-4 py-4">
              <h3 className="text-[9px] text-eco-muted uppercase tracking-wider font-semibold mb-3">
                Componentes ({equipment.childEquipment.length})
              </h3>
              <div className="space-y-1.5">
                {equipment.childEquipment.map((child) => {
                  const childColor = SUBSYSTEM_COLORS[child.subsystem ?? ""] ?? "#6B7280";
                  return (
                    <div
                      key={child.id}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-eco-bg/50 hover:bg-eco-bg transition-colors"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{
                          background: child.calibrationStatus === "EXPIRED"
                            ? "#DC2626"
                            : child.calibrationStatus === "EXPIRING"
                              ? "#D97706"
                              : "#3d7a0a",
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {child.tag && (
                            <span className="font-mono text-[8px] text-eco-muted">{child.tag}</span>
                          )}
                          <span className="text-[10px] text-eco-ink font-medium truncate">{child.name}</span>
                        </div>
                        <span className="text-[8px] text-eco-muted">{TYPE_LABELS[child.type] ?? child.type}</span>
                      </div>
                      <span className="text-[8px] text-eco-muted-2">{child._count.readings} lect.</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Info section */}
          <div className="mt-auto border-t border-eco-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: equipment.isActive ? "#3d7a0a" : "#DC2626" }}
              />
              <span className="text-[9px] text-eco-muted">
                {equipment.isActive ? "Activo" : "Inactivo"}
                {equipment.serialNumber ? ` · S/N ${equipment.serialNumber}` : ""}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reading cell
// ---------------------------------------------------------------------------
function ReadingCell({
  label,
  value,
  unit,
  warn,
}: {
  label: string;
  value: number;
  unit: string;
  warn?: boolean;
}) {
  return (
    <div className="bg-eco-bg rounded-lg px-2.5 py-2">
      <p className="text-[8px] text-eco-muted uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-mono font-bold mt-0.5 ${warn ? "text-eco-red" : "text-eco-ink"}`}>
        {value.toFixed(1)}
        <span className="text-[9px] text-eco-muted ml-0.5 font-normal">{unit}</span>
      </p>
    </div>
  );
}
