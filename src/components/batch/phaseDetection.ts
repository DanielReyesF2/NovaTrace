/**
 * Phase Detection for Pyrolysis Process Timeline
 *
 * Groups events into logical operational phases based on:
 * 1. Temperature ranges (CONTROL temp from readings)
 * 2. Analysis observations (post-process notes starting with "[")
 * 3. Time gaps between events
 */

export interface ProcessEvent {
  id: string;
  timestamp: string;
  type: string;
  detail: string;
  notes: string | null;
}

export interface Reading {
  timestamp: string;
  reactorTemp: number | null;
  controlTemp: number | null;
  steelTemp: number | null;
  chainTemp: number | null;
}

export interface Phase {
  id: string;
  name: string;
  icon: string;
  color: string;
  bg: string;
  startTime: number;
  endTime: number;
  durationMinutes: number;
  events: ProcessEvent[];
  counts: Record<string, number>;
  hasIncidents: boolean;
  tempRange: { min: number; max: number } | null;
}

// Phase definitions by temperature range
const PHASE_DEFS = [
  { key: "arranque", name: "Arranque", maxTemp: 50, icon: "🔥", color: "#E8700A", bg: "rgba(232,112,10,0.08)" },
  { key: "calentamiento", name: "Calentamiento", maxTemp: 100, icon: "📈", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  { key: "calentamiento_plus", name: "Calentamiento Activo", maxTemp: 200, icon: "⚡", color: "#2D8CF0", bg: "rgba(45,140,240,0.08)" },
  { key: "produccion", name: "Producción", maxTemp: 400, icon: "✦", color: "#3d7a0a", bg: "rgba(61,122,10,0.08)" },
] as const;

const ANALYSIS_PHASE = {
  key: "analisis",
  name: "Análisis & Aprendizajes",
  icon: "📋",
  color: "rgba(39,57,73,0.6)",
  bg: "rgba(39,57,73,0.05)",
};

/**
 * Find the CONTROL temperature at a given timestamp by interpolating readings
 */
function getControlTempAt(ts: number, readings: Reading[]): number | null {
  if (readings.length === 0) return null;

  // Find the closest reading
  let closest: Reading | null = null;
  let closestDist = Infinity;

  for (const r of readings) {
    const rTs = new Date(r.timestamp).getTime();
    const dist = Math.abs(rTs - ts);
    if (dist < closestDist) {
      closestDist = dist;
      closest = r;
    }
  }

  return closest?.controlTemp ?? closest?.reactorTemp ?? null;
}

/**
 * Check if an event is a post-process analysis observation
 */
function isAnalysisEvent(event: ProcessEvent): boolean {
  if (event.type !== "OBSERVATION") return false;
  const d = event.detail;
  return (
    d.startsWith("[HALLAZGO") ||
    d.startsWith("[DESCUBRIMIENTO") ||
    d.startsWith("[PROTOCOLO") ||
    d.startsWith("[COMPARACIÓN") ||
    d.startsWith("[CONCLUSIÓN") ||
    d.startsWith("[CRÍTICO") ||
    d.startsWith("[ALTO") ||
    d.startsWith("[MEDIO")
  );
}

/**
 * Determine which phase def matches a temperature
 */
function getPhaseForTemp(temp: number | null): (typeof PHASE_DEFS)[number] {
  if (temp === null) return PHASE_DEFS[0]; // default to arranque
  for (const def of PHASE_DEFS) {
    if (temp < def.maxTemp) return def;
  }
  return PHASE_DEFS[PHASE_DEFS.length - 1]; // produccion for very high temps
}

/**
 * Count events by type
 */
function countByType(events: ProcessEvent[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const e of events) {
    counts[e.type] = (counts[e.type] || 0) + 1;
  }
  return counts;
}

/**
 * Get temp range from readings within a time window
 */
function getTempRange(
  startTs: number,
  endTs: number,
  readings: Reading[]
): { min: number; max: number } | null {
  const temps: number[] = [];
  for (const r of readings) {
    const rTs = new Date(r.timestamp).getTime();
    if (rTs >= startTs && rTs <= endTs) {
      if (r.controlTemp != null) temps.push(r.controlTemp);
    }
  }
  if (temps.length === 0) return null;
  return { min: Math.min(...temps), max: Math.max(...temps) };
}

/**
 * Main phase detection function
 */
export function detectPhases(
  events: ProcessEvent[],
  readings: Reading[]
): Phase[] {
  if (events.length === 0) return [];

  // 1. Separate analysis events from operational events
  const analysisEvents: ProcessEvent[] = [];
  const operationalEvents: ProcessEvent[] = [];

  for (const e of events) {
    if (isAnalysisEvent(e)) {
      analysisEvents.push(e);
    } else {
      operationalEvents.push(e);
    }
  }

  // 2. Group operational events by temperature phase
  const phaseGroups = new Map<string, ProcessEvent[]>();
  const phaseOrder: string[] = [];

  for (const event of operationalEvents) {
    const eventTs = new Date(event.timestamp).getTime();
    const temp = getControlTempAt(eventTs, readings);
    const phaseDef = getPhaseForTemp(temp);

    // Check if this is the same phase as the last one, or if we need a new group
    const lastPhaseKey = phaseOrder.length > 0 ? phaseOrder[phaseOrder.length - 1] : null;

    if (lastPhaseKey === phaseDef.key) {
      // Same phase, append
      phaseGroups.get(phaseDef.key)!.push(event);
    } else {
      // Check if we already have this phase and it's not the last one
      // In that case, create a numbered version to avoid merging non-consecutive groups
      let key: string = phaseDef.key;
      if (phaseGroups.has(key) && lastPhaseKey !== key) {
        // Find a unique key
        let suffix = 2;
        while (phaseGroups.has(`${phaseDef.key}_${suffix}`)) suffix++;
        key = `${phaseDef.key}_${suffix}`;
      }

      if (!phaseGroups.has(key)) {
        phaseGroups.set(key, []);
        phaseOrder.push(key);
      }
      phaseGroups.get(key)!.push(event);
    }
  }

  // 3. Build Phase objects
  const phases: Phase[] = [];
  let phaseIdx = 0;

  for (const key of phaseOrder) {
    const groupEvents = phaseGroups.get(key)!;
    if (groupEvents.length === 0) continue;

    // Find the base phase def
    const baseKey = key.replace(/_\d+$/, "");
    const phaseDef = PHASE_DEFS.find((d) => d.key === baseKey) || PHASE_DEFS[0];

    const startTime = new Date(groupEvents[0].timestamp).getTime();
    const endTime = new Date(groupEvents[groupEvents.length - 1].timestamp).getTime();

    phases.push({
      id: `phase-${phaseIdx}`,
      name: phaseDef.name,
      icon: phaseDef.icon,
      color: phaseDef.color,
      bg: phaseDef.bg,
      startTime,
      endTime,
      durationMinutes: Math.round((endTime - startTime) / 60000),
      events: groupEvents,
      counts: countByType(groupEvents),
      hasIncidents: groupEvents.some((e) => e.type === "INCIDENT"),
      tempRange: getTempRange(startTime, endTime, readings),
    });
    phaseIdx++;
  }

  // 4. Merge very short phases (< 2 events) into adjacent ones
  // Skip this for now — keep all phases visible

  // 5. Add analysis phase if there are analysis events
  if (analysisEvents.length > 0) {
    const startTime = new Date(analysisEvents[0].timestamp).getTime();
    const endTime = new Date(analysisEvents[analysisEvents.length - 1].timestamp).getTime();

    phases.push({
      id: `phase-${phaseIdx}`,
      name: ANALYSIS_PHASE.name,
      icon: ANALYSIS_PHASE.icon,
      color: ANALYSIS_PHASE.color,
      bg: ANALYSIS_PHASE.bg,
      startTime,
      endTime,
      durationMinutes: Math.round((endTime - startTime) / 60000),
      events: analysisEvents,
      counts: countByType(analysisEvents),
      hasIncidents: false,
      tempRange: null,
    });
  }

  return phases;
}
