"use client";

import { useMemo } from "react";
import { EVENT_TYPE_CONFIG } from "./eventConfig";

interface ProcessEvent {
  id: string;
  timestamp: string;
  type: string;
  detail: string;
  notes: string | null;
}

interface ProcessTimelineProps {
  events: ProcessEvent[];
}

export function ProcessTimeline({ events }: ProcessTimelineProps) {
  // Compute elapsed time from first event
  const firstTs = useMemo(
    () => (events.length > 0 ? new Date(events[0].timestamp).getTime() : 0),
    [events]
  );

  return (
    <div className="relative">
      {/* Vertical connecting line */}
      <div className="absolute left-[19px] top-0 bottom-0 w-px bg-eco-border" />

      <div className="space-y-1">
        {events.map((event, i) => {
          const config = EVENT_TYPE_CONFIG[event.type] || EVENT_TYPE_CONFIG.OBSERVATION;
          const ts = new Date(event.timestamp);
          const time = ts.toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const elapsed = ts.getTime() - firstTs;
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
              className={`relative flex gap-3.5 py-2.5 px-2 rounded-lg transition-colors ${
                isIncident
                  ? "bg-red-50/50"
                  : isPhaseChange
                    ? "bg-eco-surface-2/30"
                    : "hover:bg-eco-surface-2/20"
              }`}
            >
              {/* Timeline dot */}
              <div
                className="relative z-10 flex-shrink-0 w-[38px] h-[38px] rounded-full border-2 flex items-center justify-center text-xs"
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
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                    style={{ color: config.color, background: config.bg }}
                  >
                    {config.label}
                  </span>
                  <span className="text-[10px] font-mono text-eco-muted">{time}</span>
                  {i > 0 && (
                    <span className="text-[9px] font-mono text-eco-muted-2">{elapsedStr}</span>
                  )}
                </div>
                <p className={`text-sm leading-relaxed mt-1 ${isIncident ? "text-eco-red font-medium" : "text-eco-ink"}`}>
                  {event.detail}
                </p>
                {event.notes && (
                  <p className="text-xs text-eco-muted mt-1 italic leading-relaxed">
                    {event.notes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Duration summary */}
      {events.length >= 2 && (() => {
        const totalMs =
          new Date(events[events.length - 1].timestamp).getTime() -
          new Date(events[0].timestamp).getTime();
        const totalMin = Math.round(totalMs / 60000);
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;

        return (
          <div className="mt-4 pt-3 border-t border-eco-border flex items-center justify-between">
            <span className="text-[10px] text-eco-muted">
              {events.length} eventos registrados
            </span>
            <span className="text-[10px] font-mono text-eco-ink-light">
              Duración total: <strong>{h}h {m}m</strong>
            </span>
          </div>
        );
      })()}
    </div>
  );
}
