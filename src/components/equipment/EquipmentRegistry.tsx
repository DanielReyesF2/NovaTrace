"use client";

import { useState } from "react";
import Link from "next/link";

interface EquipmentItem {
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
  parentEquipmentId: string | null;
  calibrationDate: string | null;
  calibrationExpiry: string | null;
  calibrationProvider: string | null;
  calibrationCertUrl: string | null;
  accuracySpec: string | null;
  calibrationStatus: string;
  isActive: boolean;
  createdAt: string;
  createdBy: { id: string; name: string } | null;
  _count: { readings: number; fractions: number };
}

interface EquipmentRegistryProps {
  equipment: EquipmentItem[];
  stats: {
    total: number;
    active: number;
    expiringSoon: number;
    expired: number;
  };
}

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

const SUBSYSTEM_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  PYROLYSIS: { label: "Pirolisis", color: "#E8700A", bg: "rgba(232,112,10,0.08)" },
  DISTILLATION: { label: "Destilacion", color: "#2D8CF0", bg: "rgba(45,140,240,0.08)" },
  UTILITIES: { label: "Utilidades", color: "#6B7280", bg: "rgba(107,114,128,0.08)" },
  INSTRUMENTATION: { label: "Instrumentacion", color: "#7C5CFC", bg: "rgba(124,92,252,0.08)" },
};

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  VALID: { label: "Vigente", color: "#3d7a0a", bg: "rgba(181,233,81,0.15)" },
  EXPIRING: { label: "Por vencer", color: "#D97706", bg: "rgba(217,119,6,0.1)" },
  EXPIRED: { label: "Vencido", color: "#DC2626", bg: "rgba(220,38,38,0.08)" },
  RETIRED: { label: "Retirado", color: "#6B7280", bg: "rgba(107,114,128,0.1)" },
};

export function EquipmentRegistry({ equipment, stats }: EquipmentRegistryProps) {
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = equipment.filter((e) => {
    if (filter === "all") return true;
    if (filter === "expired") return e.calibrationStatus === "EXPIRED";
    if (filter === "expiring") return e.calibrationStatus === "EXPIRING";
    if (filter === "PYROLYSIS" || filter === "DISTILLATION" || filter === "UTILITIES" || filter === "INSTRUMENTATION") {
      return e.subsystem === filter;
    }
    return e.type === filter;
  });

  // Group by subsystem for grouped view
  const subsystems = ["PYROLYSIS", "DISTILLATION", "INSTRUMENTATION", "UTILITIES"];
  const grouped = subsystems.map((sub) => ({
    key: sub,
    items: filtered.filter((e) => e.subsystem === sub),
    ...SUBSYSTEM_STYLES[sub],
  })).filter((g) => g.items.length > 0);

  // Count by subsystem
  const subCounts = subsystems.reduce((acc, sub) => {
    acc[sub] = equipment.filter((e) => e.subsystem === sub).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Registro de Equipos</h1>
        <p className="text-xs text-eco-muted mt-1">
          Gemelos digitales — Planta EcoNova DY-500
        </p>
      </div>

      {/* Alert banner */}
      {(stats.expired > 0 || stats.expiringSoon > 0) && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
          <span className="text-amber-600 text-sm mt-0.5">⚠</span>
          <div className="text-xs text-amber-800">
            {stats.expired > 0 && (
              <span className="font-semibold text-red-700">{stats.expired} equipo(s) con calibracion vencida. </span>
            )}
            {stats.expiringSoon > 0 && (
              <span>{stats.expiringSoon} equipo(s) por vencer en 30 dias.</span>
            )}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-px bg-eco-border rounded-xl overflow-hidden">
        {[
          { label: "Total", value: stats.total, color: "#273949" },
          { label: "Activos", value: stats.active, color: "#3d7a0a" },
          { label: "Calibracion", value: stats.expiringSoon, color: "#D97706", sublabel: "por vencer" },
          { label: "Vencidos", value: stats.expired, color: "#DC2626" },
          { label: "Pirolisis", value: subCounts.PYROLYSIS ?? 0, color: "#E8700A" },
          { label: "Destilacion", value: subCounts.DISTILLATION ?? 0, color: "#2D8CF0" },
          { label: "Instrumentos", value: subCounts.INSTRUMENTATION ?? 0, color: "#7C5CFC" },
          { label: "Utilidades", value: subCounts.UTILITIES ?? 0, color: "#6B7280" },
        ].map((s, i) => (
          <div key={i} className="bg-white p-3 text-center">
            <div className="font-mono text-lg font-bold" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-[7px] text-eco-muted uppercase tracking-wider mt-0.5 font-medium">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {[
          { key: "all", label: `Todos (${stats.total})` },
          { key: "PYROLYSIS", label: "Pirolisis" },
          { key: "DISTILLATION", label: "Destilacion" },
          { key: "INSTRUMENTATION", label: "Instrumentacion" },
          { key: "UTILITIES", label: "Utilidades" },
          { key: "expiring", label: "Por vencer" },
          { key: "expired", label: "Vencidos" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`text-[10px] px-3 py-1.5 rounded-full font-medium transition-colors ${
              filter === tab.key
                ? "bg-eco-navy text-white"
                : "bg-eco-bg text-eco-muted hover:bg-eco-border"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Equipment grouped by subsystem */}
      {grouped.map((group) => (
        <div key={group.key} className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              className="text-[9px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider"
              style={{ color: group.color, background: group.bg }}
            >
              {group.label}
            </span>
            <span className="text-[10px] text-eco-muted">{group.items.length} equipos</span>
          </div>

          <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] overflow-hidden">
            <div className="divide-y divide-eco-border/50">
              {group.items.map((eq) => {
                const statusStyle = STATUS_STYLES[eq.calibrationStatus] ?? STATUS_STYLES.VALID;
                const isExpanded = expandedId === eq.id;
                const specs = eq.specs as Record<string, unknown> | null;
                const daysLeft = eq.calibrationExpiry
                  ? Math.ceil(
                      (new Date(eq.calibrationExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    )
                  : null;
                const hasChildren = equipment.some((e) => e.parentEquipmentId === eq.id);

                return (
                  <div key={eq.id}>
                    {/* Main row */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : eq.id)}
                      className="w-full text-left px-4 py-3 hover:bg-eco-bg/50 transition-colors flex items-center gap-3"
                    >
                      {/* Tag + Name */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {eq.tag && (
                            <span className="font-mono text-[9px] text-eco-muted bg-eco-bg px-1.5 py-0.5 rounded">
                              {eq.tag}
                            </span>
                          )}
                          <p className="text-xs font-semibold text-eco-ink truncate">{eq.name}</p>
                          {hasChildren && (
                            <span className="text-[8px] text-eco-muted">▾</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] text-eco-muted">{TYPE_LABELS[eq.type] ?? eq.type}</span>
                          {eq.manufacturer && (
                            <>
                              <span className="text-eco-muted-2">·</span>
                              <span className="text-[9px] text-eco-muted">{eq.manufacturer}{eq.model ? ` ${eq.model}` : ""}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Location */}
                      <div className="hidden md:block w-48 text-[9px] text-eco-muted truncate">
                        {eq.location ?? "—"}
                      </div>

                      {/* Calibration */}
                      <div className="hidden md:block w-24">
                        {eq.calibrationExpiry ? (
                          <p className={`text-[9px] font-mono ${daysLeft != null && daysLeft < 0 ? "text-red-600" : daysLeft != null && daysLeft < 30 ? "text-amber-600" : "text-eco-muted"}`}>
                            {daysLeft != null && daysLeft < 0 ? `−${Math.abs(daysLeft)}d` : daysLeft != null ? `${daysLeft}d` : ""}
                          </p>
                        ) : (
                          <span className="text-[9px] text-eco-muted-2">—</span>
                        )}
                      </div>

                      {/* Status pill */}
                      <span
                        className="text-[8px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{ color: statusStyle.color, background: statusStyle.bg }}
                      >
                        {statusStyle.label}
                      </span>

                      {/* Expand arrow */}
                      <svg
                        width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.5"
                        className={`text-eco-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>

                    {/* Expanded specs panel */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="bg-eco-bg rounded-xl p-4 space-y-3">
                          {/* Info grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {eq.location && (
                              <InfoCell label="Ubicacion" value={eq.location} />
                            )}
                            {eq.serialNumber && (
                              <InfoCell label="No. Serie" value={eq.serialNumber} mono />
                            )}
                            {eq.accuracySpec && (
                              <InfoCell label="Precision" value={eq.accuracySpec} />
                            )}
                            {eq.calibrationProvider && (
                              <InfoCell label="Proveedor calibracion" value={eq.calibrationProvider} />
                            )}
                            {eq.calibrationExpiry && (
                              <InfoCell
                                label="Vencimiento calibracion"
                                value={new Date(eq.calibrationExpiry).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
                              />
                            )}
                          </div>

                          {/* Specs */}
                          {specs && Object.keys(specs).length > 0 && (
                            <div>
                              <p className="text-[9px] text-eco-muted uppercase tracking-wider font-medium mb-2">
                                Especificaciones tecnicas
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                                {Object.entries(specs).map(([key, val]) => {
                                  if (val === null || val === undefined) return null;
                                  const label = key
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (s) => s.toUpperCase())
                                    .trim();
                                  let display: string;
                                  if (Array.isArray(val)) {
                                    display = val.join(", ");
                                  } else if (typeof val === "object") {
                                    display = JSON.stringify(val);
                                  } else {
                                    display = String(val);
                                  }
                                  return (
                                    <div key={key} className="flex gap-2 text-[10px]">
                                      <span className="text-eco-muted whitespace-nowrap">{label}:</span>
                                      <span className="text-eco-ink font-medium">{display}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Child equipment */}
                          {hasChildren && (
                            <div>
                              <p className="text-[9px] text-eco-muted uppercase tracking-wider font-medium mb-1.5">
                                Componentes asociados
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {equipment
                                  .filter((e) => e.parentEquipmentId === eq.id)
                                  .map((child) => (
                                    <button
                                      key={child.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedId(child.id);
                                      }}
                                      className="text-[9px] px-2 py-1 rounded-lg bg-white border border-eco-border/50 text-eco-ink hover:border-eco-green/30 transition-colors"
                                    >
                                      {child.tag && <span className="font-mono text-eco-muted mr-1">{child.tag}</span>}
                                      {child.name}
                                    </button>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Usage stats */}
                          {(eq._count.readings > 0 || eq._count.fractions > 0) && (
                            <div className="flex gap-4 text-[9px] text-eco-muted pt-1 border-t border-white/50">
                              <span>{eq._count.readings} lecturas registradas</span>
                              <span>{eq._count.fractions} fracciones producidas</span>
                            </div>
                          )}

                          {/* Digital Twin button — show for top-level equipment */}
                          {!eq.parentEquipmentId && (
                            <div className="pt-2 border-t border-white/50">
                              <Link
                                href={`/equipment/${eq.id}/twin`}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-eco-navy text-white text-[10px] font-semibold hover:bg-eco-navy-light transition-colors"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                                </svg>
                                Ver Gemelo Digital 3D
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-xs text-eco-muted">
          No se encontraron equipos
        </div>
      )}
    </div>
  );
}

function InfoCell({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[8px] text-eco-muted uppercase tracking-wider font-medium">{label}</p>
      <p className={`text-[10px] text-eco-ink mt-0.5 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
