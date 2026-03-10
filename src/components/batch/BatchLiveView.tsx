"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BatchInfo {
  id: string;
  code: string;
  status: string;
  feedstockType: string;
  feedstockWeight: number;
  feedstockOrigin: string;
  startTime: string | null;
  operators: string[];
  maxReactorTemp: number | null;
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
  notes: string | null;
}

interface ProcessEvent {
  id: string;
  timestamp: string;
  type: string;
  detail: string;
  notes: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function elapsed(startIso: string | null): string {
  if (!startIso) return "--";
  const ms = Date.now() - new Date(startIso).getTime();
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${h}h ${m}min`;
}

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  VALVE_CHANGE: { label: "Valvula", color: "bg-blue-100 text-blue-700" },
  EQUIPMENT_TOGGLE: { label: "Equipo", color: "bg-purple-100 text-purple-700" },
  FUEL_ADD: { label: "Combustible", color: "bg-amber-100 text-amber-700" },
  INCIDENT: { label: "Incidente", color: "bg-red-100 text-red-700" },
  OBSERVATION: { label: "Observacion", color: "bg-gray-100 text-gray-600" },
  PHASE_CHANGE: { label: "Fase", color: "bg-eco-green/20 text-green-700" },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BatchLiveView({ batch }: { batch: BatchInfo }) {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [events, setEvents] = useState<ProcessEvent[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLive, setIsLive] = useState(batch.status === "ACTIVE");

  const fetchData = useCallback(async () => {
    try {
      const [rRes, eRes] = await Promise.all([
        fetch(`/api/batches/${batch.id}/readings`),
        fetch(`/api/batches/${batch.id}/events`),
      ]);
      if (rRes.ok) setReadings(await rRes.json());
      if (eRes.ok) setEvents(await eRes.json());
      setLastUpdate(new Date());
    } catch {
      // silently retry on next interval
    }
  }, [batch.id]);

  // Initial load + polling
  useEffect(() => {
    fetchData();
    if (!isLive) return;
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData, isLive]);

  const latestReading = readings.length > 0 ? readings[readings.length - 1] : null;

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-4 max-w-[1400px] mx-auto">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/batch/${batch.id}`}
            className="text-eco-muted hover:text-eco-ink transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-eco-ink flex items-center gap-2">
              {batch.code}
              {isLive && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  En Vivo
                </span>
              )}
              {!isLive && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500">
                  {batch.status}
                </span>
              )}
            </h1>
            <p className="text-xs text-eco-muted">
              {batch.feedstockType} &middot; {batch.feedstockWeight} kg &middot; {batch.feedstockOrigin}
              {batch.operators?.length > 0 && <> &middot; {batch.operators.join(", ")}</>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-eco-muted">
          <span>Tiempo: <b className="text-eco-ink">{elapsed(batch.startTime)}</b></span>
          <span>Lecturas: <b className="text-eco-ink">{readings.length}</b></span>
          <span>Eventos: <b className="text-eco-ink">{events.length}</b></span>
          <span className="text-[10px]">
            Actualizado {lastUpdate.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              isLive
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-eco-green/20 text-green-700 hover:bg-eco-green/30"
            }`}
          >
            {isLive ? "Pausar" : "Reanudar"}
          </button>
        </div>
      </div>

      {/* ---- Quick stats bar ---- */}
      {latestReading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          <QuickStat label="Reactor" value={latestReading.reactorTemp} unit="°C" warn={latestReading.reactorTemp != null && latestReading.reactorTemp > 350} />
          <QuickStat label="Amortiguador" value={latestReading.controlTemp} unit="°C" />
          <QuickStat label="Acero" value={latestReading.steelTemp} unit="°C" />
          <QuickStat label="Cadena" value={latestReading.chainTemp} unit="°C" />
          <QuickStat label="Compresor" value={latestReading.compressorPsi} unit=" PSI" />
          <QuickStat label="Regulador" value={latestReading.regulatorPsi} unit=" PSI" />
          <QuickStat label="Papalote" value={latestReading.damperPosition} unit="" />
        </div>
      )}

      {/* ---- Readings table ---- */}
      <div className="bg-white rounded-xl border border-black/5 shadow-soft overflow-hidden">
        <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-eco-ink">Lecturas</h2>
          <span className="text-[10px] text-eco-muted font-mono">{readings.length} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-eco-bg text-eco-muted text-[10px] uppercase tracking-wider">
                <th className="px-3 py-2 text-left font-semibold w-10">#</th>
                <th className="px-3 py-2 text-left font-semibold">Hora</th>
                <th className="px-3 py-2 text-right font-semibold">Reactor °C</th>
                <th className="px-3 py-2 text-right font-semibold">Amortiguador °C</th>
                <th className="px-3 py-2 text-right font-semibold">Acero °C</th>
                <th className="px-3 py-2 text-right font-semibold">Cadena °C</th>
                <th className="px-3 py-2 text-right font-semibold">Compresor PSI</th>
                <th className="px-3 py-2 text-right font-semibold">Regulador PSI</th>
                <th className="px-3 py-2 text-right font-semibold">Papalote</th>
                <th className="px-3 py-2 text-left font-semibold">Notas</th>
              </tr>
            </thead>
            <tbody>
              {readings.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-8 text-center text-eco-muted">
                    Sin lecturas todavia. Envia datos por WhatsApp para comenzar.
                  </td>
                </tr>
              )}
              {[...readings].reverse().map((r, i) => {
                const num = readings.length - i;
                const isNew = i === 0;
                return (
                  <tr
                    key={r.id}
                    className={`border-t border-black/[0.03] hover:bg-eco-green/5 transition-colors ${
                      isNew ? "bg-eco-green/10 animate-fade-in" : ""
                    }`}
                  >
                    <td className="px-3 py-2 text-eco-muted font-mono">{num}</td>
                    <td className="px-3 py-2 font-mono text-eco-ink">{formatTime(r.timestamp)}</td>
                    <td className={`px-3 py-2 text-right font-mono font-semibold ${
                      r.reactorTemp != null && r.reactorTemp > 350
                        ? "text-red-600"
                        : r.reactorTemp != null
                        ? "text-eco-ink"
                        : "text-eco-muted"
                    }`}>
                      {r.reactorTemp ?? "--"}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-eco-ink">{r.controlTemp ?? "--"}</td>
                    <td className="px-3 py-2 text-right font-mono text-eco-ink">{r.steelTemp ?? "--"}</td>
                    <td className="px-3 py-2 text-right font-mono text-eco-ink">{r.chainTemp ?? "--"}</td>
                    <td className="px-3 py-2 text-right font-mono text-eco-ink">{r.compressorPsi ?? "--"}</td>
                    <td className="px-3 py-2 text-right font-mono text-eco-ink">{r.regulatorPsi ?? "--"}</td>
                    <td className="px-3 py-2 text-right font-mono text-eco-ink">{r.damperPosition ?? "--"}</td>
                    <td className="px-3 py-2 text-eco-muted max-w-[150px] truncate">{r.notes ?? ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- Events timeline ---- */}
      <div className="bg-white rounded-xl border border-black/5 shadow-soft overflow-hidden">
        <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-eco-ink">Eventos</h2>
          <span className="text-[10px] text-eco-muted font-mono">{events.length} registros</span>
        </div>
        <div className="divide-y divide-black/[0.03]">
          {events.length === 0 && (
            <p className="px-4 py-8 text-center text-xs text-eco-muted">
              Sin eventos registrados.
            </p>
          )}
          {[...events].reverse().map((e, i) => {
            const ev = EVENT_LABELS[e.type] || EVENT_LABELS.OBSERVATION;
            return (
              <div
                key={e.id}
                className={`flex items-start gap-3 px-4 py-2.5 ${i === 0 ? "bg-eco-green/5 animate-fade-in" : ""}`}
              >
                <span className="font-mono text-[10px] text-eco-muted w-16 flex-shrink-0 pt-0.5">
                  {formatTime(e.timestamp)}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex-shrink-0 ${ev.color}`}>
                  {ev.label}
                </span>
                <span className="text-xs text-eco-ink">{e.detail}</span>
                {e.notes && <span className="text-[10px] text-eco-muted ml-auto">{e.notes}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// QuickStat card
// ---------------------------------------------------------------------------

function QuickStat({
  label,
  value,
  unit,
  warn = false,
}: {
  label: string;
  value: number | null;
  unit: string;
  warn?: boolean;
}) {
  return (
    <div className={`rounded-lg px-3 py-2 border ${
      warn ? "bg-red-50 border-red-200" : "bg-white border-black/5"
    }`}>
      <p className="text-[10px] text-eco-muted uppercase tracking-wider">{label}</p>
      <p className={`text-lg font-semibold font-mono ${
        warn ? "text-red-600" : value != null ? "text-eco-ink" : "text-eco-muted"
      }`}>
        {value != null ? `${value}${unit}` : "--"}
      </p>
    </div>
  );
}
