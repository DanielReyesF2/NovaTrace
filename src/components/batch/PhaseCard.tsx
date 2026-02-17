"use client";

import { EVENT_TYPE_CONFIG } from "./eventConfig";
import type { Phase } from "./phaseDetection";

interface PhaseCardProps {
  phase: Phase;
  isExpanded: boolean;
  onToggle: () => void;
  firstEventTime: number; // first event of entire batch, for elapsed calc
}

function formatTimeShort(ts: number) {
  return new Date(ts).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(minutes: number) {
  if (minutes < 1) return "<1m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function PhaseCard({ phase, isExpanded, onToggle, firstEventTime }: PhaseCardProps) {
  return (
    <div
      id={phase.id}
      className={`rounded-xl border transition-all duration-200 ${
        phase.hasIncidents
          ? "border-red-200/60 bg-red-50/20"
          : "border-black/[0.04] bg-white"
      }`}
    >
      {/* ── Phase Header ── always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-eco-surface-2/30 transition-colors rounded-xl"
      >
        {/* Phase color dot */}
        <span
          className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
          style={{ backgroundColor: phase.color }}
        />

        {/* Phase info */}
        <div className="flex-1 min-w-0 flex items-center gap-2.5 flex-wrap">
          {/* Name */}
          <span className="text-sm font-semibold text-eco-ink whitespace-nowrap">
            {phase.icon} {phase.name}
          </span>

          {/* Time range */}
          <span className="text-[10px] font-mono text-eco-muted whitespace-nowrap">
            {formatTimeShort(phase.startTime)}
            {phase.durationMinutes > 0 && ` — ${formatTimeShort(phase.endTime)}`}
          </span>

          {/* Duration badge */}
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-eco-surface-2 text-eco-muted whitespace-nowrap">
            {formatDuration(phase.durationMinutes)}
          </span>

          {/* Event type badges */}
          <div className="flex items-center gap-1">
            {Object.entries(phase.counts)
              .filter(([, count]) => count > 0)
              .sort(([a], [b]) => {
                // Show incidents first
                const order = ["INCIDENT", "PHASE_CHANGE", "EQUIPMENT_TOGGLE", "FUEL_ADD", "VALVE_CHANGE", "OBSERVATION"];
                return order.indexOf(a) - order.indexOf(b);
              })
              .map(([type, count]) => {
                const config = EVENT_TYPE_CONFIG[type] || EVENT_TYPE_CONFIG.OBSERVATION;
                return (
                  <span
                    key={type}
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded-full whitespace-nowrap"
                    style={{ color: config.color, background: config.bg }}
                    title={config.label}
                  >
                    {config.icon}{count}
                  </span>
                );
              })}
          </div>
        </div>

        {/* Temp range */}
        {phase.tempRange && (
          <span className="text-[10px] font-mono text-eco-blue whitespace-nowrap hidden sm:block">
            {phase.tempRange.min}–{phase.tempRange.max}°C
          </span>
        )}

        {/* Expand arrow */}
        <span
          className="text-eco-muted text-[10px] transition-transform duration-200 flex-shrink-0"
          style={{
            display: "inline-block",
            transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
          }}
        >
          ▶
        </span>
      </button>

      {/* ── Phase Body ── collapsible event list */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 animate-fade-in">
          <div className="relative ml-1.5">
            {/* Vertical connecting line */}
            <div className="absolute left-[15px] top-0 bottom-0 w-px bg-eco-border" />

            <div className="space-y-0.5">
              {phase.events.map((event, i) => {
                const config = EVENT_TYPE_CONFIG[event.type] || EVENT_TYPE_CONFIG.OBSERVATION;
                const ts = new Date(event.timestamp).getTime();
                const time = formatTimeShort(ts);
                const elapsed = ts - firstEventTime;
                const elapsedMin = Math.round(elapsed / 60000);
                const elapsedStr =
                  elapsedMin >= 60
                    ? `+${Math.floor(elapsedMin / 60)}h ${elapsedMin % 60}m`
                    : `+${elapsedMin}m`;

                const isIncident = event.type === "INCIDENT";
                const isPhaseChange = event.type === "PHASE_CHANGE";

                return (
                  <div
                    key={event.id}
                    className={`relative flex gap-3 py-2 px-1.5 rounded-lg transition-colors ${
                      isIncident
                        ? "bg-red-50/50"
                        : isPhaseChange
                          ? "bg-eco-surface-2/30"
                          : "hover:bg-eco-surface-2/20"
                    }`}
                  >
                    {/* Timeline dot */}
                    <div
                      className="relative z-10 flex-shrink-0 w-[30px] h-[30px] rounded-full border-2 flex items-center justify-center text-[10px]"
                      style={{
                        borderColor: config.color,
                        backgroundColor: config.bg,
                        color: config.color,
                      }}
                    >
                      {config.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 py-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                          style={{ color: config.color, background: config.bg }}
                        >
                          {config.label}
                        </span>
                        <span className="text-[9px] font-mono text-eco-muted">{time}</span>
                        {i > 0 && (
                          <span className="text-[8px] font-mono text-eco-muted-2">
                            {elapsedStr}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-[13px] leading-relaxed mt-0.5 ${
                          isIncident ? "text-eco-red font-medium" : "text-eco-ink"
                        }`}
                      >
                        {event.detail}
                      </p>
                      {event.notes && (
                        <p className="text-[11px] text-eco-muted mt-0.5 italic leading-relaxed">
                          {event.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
