"use client";

import { useState } from "react";
import Link from "next/link";

// TODO: Import sub-components as they're built
// import { ThermalProfile } from "./ThermalProfile";
// import { ImpactPanel } from "./ImpactPanel";
// import { LabResults } from "./LabResults";

interface BatchDetailProps {
  batch: {
    id: string;
    code: string;
    date: string;
    status: string;
    feedstockType: string;
    feedstockOrigin: string;
    feedstockWeight: number;
    feedstockCondition: string | null;
    contaminationPct: number | null;
    oilOutput: number | null;
    yieldPercent: number | null;
    durationMinutes: number | null;
    maxReactorTemp: number | null;
    operators: string[];
    stopReason: string | null;
    notes: string | null;
    co2Baseline: number | null;
    co2Project: number | null;
    co2Avoided: number | null;
    readings: Array<{
      id: string;
      timestamp: string;
      reactorTemp: number | null;
      controlTemp: number | null;
      steelTemp: number | null;
      chainTemp: number | null;
    }>;
    events: Array<{
      id: string;
      timestamp: string;
      type: string;
      detail: string;
    }>;
    labResults: Array<{
      id: string;
      labName: string;
      labCertification: string | null;
      sampleNumber: string;
      reportDate: string;
      viscosity40C: number | null;
      sulfurPercent: number | null;
      waterContent: number | null;
      verdict: string | null;
    }>;
    certificates: Array<{
      id: string;
      code: string;
      hash: string;
    }>;
  };
}

const TABS = [
  { id: "summary", label: "Resumen" },
  { id: "thermal", label: "Perfil Térmico" },
  { id: "lab", label: "Laboratorio" },
  { id: "impact", label: "Impacto GHG" },
  { id: "cert", label: "Certificado" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function BatchDetail({ batch }: BatchDetailProps) {
  const [activeTab, setActiveTab] = useState<TabId>("summary");

  return (
    <div className="min-h-screen bg-eco-bg">
      {/* Header */}
      <header className="border-b border-eco-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-white/30 hover:text-white/50 text-sm">
            ← Lotes
          </Link>
          <span className="font-mono text-sm font-bold">{batch.code}</span>
          <span className="text-[10px] text-white/20">
            {new Date(batch.date).toLocaleDateString("es-MX")}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-eco-green/10 text-eco-green border border-eco-green/20"
                  : "text-white/30 hover:text-white/50 border border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "summary" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Feedstock */}
            <div className="bg-eco-surface border border-eco-border rounded-xl p-6">
              <h3 className="text-[10px] tracking-[2px] text-eco-green uppercase mb-4">
                Feedstock
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/40">Tipo</span>
                  <span>{batch.feedstockType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Origen</span>
                  <span>{batch.feedstockOrigin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Peso</span>
                  <span className="font-mono font-bold">{batch.feedstockWeight} kg</span>
                </div>
                {batch.contaminationPct != null && (
                  <div className="flex justify-between">
                    <span className="text-white/40">Contaminación</span>
                    <span className="font-mono">~{batch.contaminationPct}%</span>
                  </div>
                )}
                {batch.feedstockCondition && (
                  <div className="flex justify-between">
                    <span className="text-white/40">Condición</span>
                    <span className="text-white/60">{batch.feedstockCondition}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Output */}
            <div className="bg-eco-surface border border-eco-border rounded-xl p-6">
              <h3 className="text-[10px] tracking-[2px] text-eco-purple uppercase mb-4">
                Producto
              </h3>
              {batch.oilOutput != null && batch.oilOutput > 0 ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/40">Aceite</span>
                    <span className="font-mono font-bold text-eco-purple">
                      {batch.oilOutput} L
                    </span>
                  </div>
                  {batch.yieldPercent != null && (
                    <div className="flex justify-between">
                      <span className="text-white/40">Rendimiento</span>
                      <span className="font-mono">{batch.yieldPercent}%</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-white/20 text-sm">
                  {batch.stopReason || "Sin producción"}
                </div>
              )}
            </div>

            {/* Impact quick view */}
            {batch.co2Avoided != null && batch.co2Avoided > 0 && (
              <div className="md:col-span-2 bg-eco-surface border border-eco-green/10 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[10px] tracking-[2px] text-eco-green uppercase mb-1">
                      Impacto Ambiental
                    </h3>
                    <p className="text-white/30 text-xs">
                      Ciclo de vida completo — quema abierta vs pirólisis
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-2xl font-bold text-eco-green">
                      −{batch.co2Avoided.toFixed(1)}
                    </div>
                    <div className="text-[10px] text-white/30">kg CO₂eq evitados</div>
                  </div>
                </div>
              </div>
            )}

            {/* Operators & Meta */}
            <div className="md:col-span-2 bg-eco-surface border border-eco-border rounded-xl p-6">
              <div className="flex items-center gap-8 text-sm">
                <div>
                  <span className="text-white/40 text-xs">Operadores: </span>
                  <span>{batch.operators.join(", ")}</span>
                </div>
                {batch.durationMinutes && (
                  <div>
                    <span className="text-white/40 text-xs">Duración: </span>
                    <span className="font-mono">
                      {Math.floor(batch.durationMinutes / 60)}h {batch.durationMinutes % 60}m
                    </span>
                  </div>
                )}
                {batch.maxReactorTemp && (
                  <div>
                    <span className="text-white/40 text-xs">Temp máx: </span>
                    <span className="font-mono text-eco-orange">
                      {batch.maxReactorTemp}°C
                    </span>
                  </div>
                )}
              </div>
              {batch.notes && (
                <p className="mt-3 text-xs text-white/30">{batch.notes}</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "thermal" && (
          <div className="bg-eco-surface border border-eco-border rounded-xl p-6">
            {batch.readings.length > 0 ? (
              <div>
                <h3 className="text-[10px] tracking-[2px] text-eco-orange uppercase mb-4">
                  Perfil Térmico — {batch.readings.length} lecturas
                </h3>
                {/* TODO: Replace with Recharts LineChart */}
                <div className="text-center py-12 text-white/20 text-sm">
                  Gráfica Recharts — implementar en Cursor
                </div>
                {/* Data table fallback */}
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="text-white/30 border-b border-eco-border">
                        <th className="py-2 text-left">Hora</th>
                        <th className="py-2 text-right">Reactor</th>
                        <th className="py-2 text-right">Control</th>
                        <th className="py-2 text-right">Acero</th>
                        <th className="py-2 text-right">Cadena</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batch.readings.slice(0, 10).map((r) => (
                        <tr key={r.id} className="border-b border-eco-border/50">
                          <td className="py-1.5 text-white/40">
                            {new Date(r.timestamp).toLocaleTimeString("es-MX", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-1.5 text-right text-eco-orange">
                            {r.reactorTemp}°C
                          </td>
                          <td className="py-1.5 text-right text-eco-blue">
                            {r.controlTemp}°C
                          </td>
                          <td className="py-1.5 text-right text-eco-purple">
                            {r.steelTemp}°C
                          </td>
                          <td className="py-1.5 text-right text-eco-green">
                            {r.chainTemp}°C
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {batch.readings.length > 10 && (
                    <p className="text-[10px] text-white/20 mt-2">
                      Mostrando 10 de {batch.readings.length} lecturas
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-white/20 text-sm">
                Sin lecturas térmicas para este lote
              </div>
            )}
          </div>
        )}

        {activeTab === "lab" && (
          <div className="bg-eco-surface border border-eco-border rounded-xl p-6">
            {batch.labResults.length > 0 ? (
              batch.labResults.map((lab) => (
                <div key={lab.id}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold">{lab.labName}</h3>
                      <p className="text-[10px] text-eco-blue">{lab.labCertification}</p>
                      <p className="text-[10px] text-white/20">
                        Muestra: {lab.sampleNumber} · {new Date(lab.reportDate).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {[
                      { test: "Viscosidad @40°C", value: lab.viscosity40C ? `${lab.viscosity40C} mm²/s` : "—", method: "ASTM D7042" },
                      { test: "Contenido de Agua", value: lab.waterContent ? `${lab.waterContent} PPM` : "—", method: "ASTM D6304" },
                      { test: "% Azufre", value: lab.sulfurPercent ? `${lab.sulfurPercent}% m/m` : "—", method: "ASTM D4951" },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between py-2 px-3 rounded bg-white/[0.02]">
                        <span className="text-xs">{row.test}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] text-white/20 font-mono">{row.method}</span>
                          <span className="text-sm font-mono font-bold">{row.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {lab.verdict && (
                    <div className="mt-4 text-center py-3 bg-eco-green/5 border border-eco-green/10 rounded-lg">
                      <span className="text-eco-green text-sm font-semibold">✓ {lab.verdict}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-white/20 text-sm">
                Sin resultados de laboratorio
              </div>
            )}
          </div>
        )}

        {activeTab === "impact" && (
          <div className="bg-eco-surface border border-eco-border rounded-xl p-6">
            {batch.co2Avoided != null ? (
              <div>
                <h3 className="text-[10px] tracking-[2px] text-eco-green uppercase mb-6">
                  Impacto Ambiental — Ciclo de Vida Completo
                </h3>

                {/* Two big numbers */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-5 bg-eco-red/5 border border-eco-red/10 rounded-xl">
                    <div className="text-[10px] text-eco-red/60 uppercase tracking-wider mb-2">Sin EcoNova</div>
                    <div className="font-mono text-3xl font-bold text-eco-red">{batch.co2Baseline?.toFixed(1)}</div>
                    <div className="text-[10px] text-white/30 mt-1">kg CO₂eq</div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-eco-green text-lg">→</div>
                      <div className="font-mono text-sm font-bold text-eco-green bg-eco-green/10 px-3 py-1 rounded-full">
                        −{batch.co2Baseline && batch.co2Project
                          ? ((1 - batch.co2Project / batch.co2Baseline) * 100).toFixed(0)
                          : 0}%
                      </div>
                    </div>
                  </div>
                  <div className="text-center p-5 bg-eco-green/5 border border-eco-green/10 rounded-xl">
                    <div className="text-[10px] text-eco-green/60 uppercase tracking-wider mb-2">Con EcoNova</div>
                    <div className="font-mono text-3xl font-bold text-eco-green">{batch.co2Project?.toFixed(1)}</div>
                    <div className="text-[10px] text-white/30 mt-1">kg CO₂eq</div>
                  </div>
                </div>

                {/* Result */}
                <div className="text-center py-4 bg-eco-green/5 border border-eco-green/15 rounded-xl">
                  <span className="font-mono text-2xl font-bold text-eco-green">
                    {batch.co2Avoided.toFixed(1)}
                  </span>
                  <span className="text-white/40 text-sm ml-2">kg CO₂eq evitados</span>
                </div>

                <p className="text-[10px] text-white/20 italic mt-4 leading-relaxed">
                  ⚠ Ciclo de vida completo: incluye combustión eventual del aceite como combustible.
                  Baseline: quema a cielo abierto (IPCC 2006). Consumo energético estimado — requiere medición real.
                </p>
              </div>
            ) : (
              <div className="text-center py-12 text-white/20 text-sm">
                Impacto GHG disponible para lotes completados
              </div>
            )}
          </div>
        )}

        {activeTab === "cert" && (
          <div className="text-center py-12 text-white/20 text-sm">
            {/* TODO: Certificate generation and display */}
            Generador de certificados — implementar en Cursor
          </div>
        )}
      </main>
    </div>
  );
}
