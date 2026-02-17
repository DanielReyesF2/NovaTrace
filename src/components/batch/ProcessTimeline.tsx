"use client";

import { useMemo, useState, useCallback } from "react";
import { detectPhases, type ProcessEvent, type Reading } from "./phaseDetection";
import { PhaseCard } from "./PhaseCard";

interface ProcessTimelineProps {
  events: ProcessEvent[];
  readings?: Reading[];
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function ProcessTimeline({ events, readings = [] }: ProcessTimelineProps) {
  // Detect phases
  const phases = useMemo(
    () => detectPhases(events, readings),
    [events, readings]
  );

  // Compute stats
  const stats = useMemo(() => {
    const incidentCount = events.filter((e) => e.type === "INCIDENT").length;
    const totalMs =
      events.length >= 2
        ? new Date(events[events.length - 1].timestamp).getTime() -
          new Date(events[0].timestamp).getTime()
        : 0;
    return {
      phases: phases.length,
      events: events.length,
      incidents: incidentCount,
      durationMinutes: Math.round(totalMs / 60000),
    };
  }, [events, phases]);

  // Expand/collapse state
  // All phases collapsed by default
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const togglePhase = useCallback((phaseId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  }, []);

  const handlePhaseClick = useCallback(
    (phaseId: string) => {
      // Expand the phase if not already
      setExpanded((prev) => {
        const next = new Set(prev);
        next.add(phaseId);
        return next;
      });
      // Scroll to phase card
      setTimeout(() => {
        document.getElementById(phaseId)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
    },
    []
  );

  const firstEventTime =
    events.length > 0 ? new Date(events[0].timestamp).getTime() : 0;

  // Expand/collapse all
  const allExpanded = expanded.size === phases.length;
  const toggleAll = useCallback(() => {
    if (allExpanded) {
      setExpanded(new Set());
    } else {
      setExpanded(new Set(phases.map((p) => p.id)));
    }
  }, [allExpanded, phases]);

  return (
    <div className="space-y-3">
      {/* ── Summary Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-eco-border rounded-lg overflow-hidden">
        {[
          { label: "Fases", value: `${stats.phases}`, color: "#7C5CFC" },
          { label: "Eventos", value: `${stats.events}`, color: "#273949" },
          {
            label: "Incidentes",
            value: `${stats.incidents}`,
            color: stats.incidents > 0 ? "#DC2626" : "#3d7a0a",
          },
          {
            label: "Duración",
            value: formatDuration(stats.durationMinutes),
            color: "#273949",
          },
        ].map((s, i) => (
          <div key={i} className="bg-eco-surface p-3 text-center">
            <div
              className="font-mono text-sm font-bold"
              style={{ color: s.color }}
            >
              {s.value}
            </div>
            <div className="text-[8px] text-eco-muted uppercase tracking-wider mt-0.5">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Expand/Collapse All ── */}
      <div className="flex items-center justify-end">
        <button
          onClick={toggleAll}
          className="text-[10px] text-eco-muted hover:text-eco-ink transition-colors"
        >
          {allExpanded ? "Colapsar todo" : "Expandir todo"}
        </button>
      </div>

      {/* ── Phase Cards ── */}
      <div className="space-y-2">
        {phases.map((phase) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            isExpanded={expanded.has(phase.id)}
            onToggle={() => togglePhase(phase.id)}
            firstEventTime={firstEventTime}
          />
        ))}
      </div>

      {/* ── Total Duration Footer ── */}
      {events.length >= 2 && (
        <div className="flex items-center justify-between pt-2 border-t border-eco-border">
          <span className="text-[10px] text-eco-muted">
            {events.length} eventos en {phases.length} fases
          </span>
          <span className="text-[10px] font-mono text-eco-ink-light">
            Duración total:{" "}
            <strong>{formatDuration(stats.durationMinutes)}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
