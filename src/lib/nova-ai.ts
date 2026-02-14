/**
 * Nova AI Integration — Connects to EcoNova's AI Platform
 *
 * API Gateway: https://econova-ai-platform-production.up.railway.app
 * Uses the cerebro (brain) with Redis memory, 7 MCP agents,
 * and Claude for intelligent batch analysis.
 */

const NOVA_GATEWAY_URL =
  process.env.NOVA_GATEWAY_URL ||
  "https://econova-ai-platform-production.up.railway.app";

const NOVA_API_KEY = process.env.NOVA_API_KEY || "";

/* ── Types ── */
export interface NovaInsights {
  summary: string;
  highlights: Array<{
    type: "positive" | "warning" | "neutral";
    title: string;
    detail: string;
  }>;
  thermalAnalysis: string;
  recommendations: string[];
}

export interface NovaRawResponse {
  success: boolean;
  response: string;
  conversationId?: string;
  toolsUsed?: string[];
  source?: string;
  metadata?: {
    model?: string;
    elapsed_ms?: number;
  };
}

export interface BatchForAnalysis {
  id: string;
  code: string;
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
  stopReason: string | null;
  notes: string | null;
  co2Baseline: number | null;
  co2Project: number | null;
  co2Avoided: number | null;
  operators: string[];
  readings: Array<{
    timestamp: string;
    reactorTemp: number | null;
    controlTemp: number | null;
    steelTemp: number | null;
    chainTemp: number | null;
  }>;
  events: Array<{
    timestamp: string;
    type: string;
    detail: string;
    notes: string | null;
  }>;
  labResults: Array<{
    labName: string;
    viscosity40C: number | null;
    waterContent: number | null;
    sulfurPercent: number | null;
    verdict: string | null;
  }>;
}

interface HistoricalStats {
  avgYield: number;
  avgDuration: number;
  avgCO2Avoided: number;
  totalBatches: number;
}

/* ── Cache ── */
const insightsCache = new Map<
  string,
  { data: NovaInsights; timestamp: number }
>();

const CACHE_TTL_ACTIVE = 30 * 60 * 1000; // 30 min
const CACHE_TTL_COMPLETED = 24 * 60 * 60 * 1000; // 24 hours

function getCached(
  batchId: string,
  isCompleted: boolean
): NovaInsights | null {
  const entry = insightsCache.get(batchId);
  if (!entry) return null;
  const ttl = isCompleted ? CACHE_TTL_COMPLETED : CACHE_TTL_ACTIVE;
  if (Date.now() - entry.timestamp > ttl) {
    insightsCache.delete(batchId);
    return null;
  }
  return entry.data;
}

/* ── Preprocessing: build context message for Nova ── */
function buildBatchMessage(
  batch: BatchForAnalysis,
  historical: HistoricalStats,
  userName: string
): string {
  const reactorTemps = batch.readings
    .map((r) => r.reactorTemp)
    .filter((t): t is number => t !== null);

  // Thermal stats
  let thermalSummary = "Sin lecturas térmicas.";
  if (reactorTemps.length > 0) {
    const maxTemp = Math.max(...reactorTemps);
    const minTemp = Math.min(...reactorTemps);
    const avgTemp =
      reactorTemps.reduce((a, b) => a + b, 0) / reactorTemps.length;

    const variance =
      reactorTemps.reduce((s, t) => s + Math.pow(t - avgTemp, 2), 0) /
      reactorTemps.length;
    const stddev = Math.sqrt(variance);

    let productionMinutes = 0;
    for (let i = 1; i < batch.readings.length; i++) {
      if ((batch.readings[i].reactorTemp ?? 0) >= 150) {
        const dt =
          new Date(batch.readings[i].timestamp).getTime() -
          new Date(batch.readings[i - 1].timestamp).getTime();
        productionMinutes += dt / 60000;
      }
    }

    let rampMinutes = 0;
    for (let i = 0; i < batch.readings.length; i++) {
      if ((batch.readings[i].reactorTemp ?? 0) >= 150) {
        rampMinutes =
          (new Date(batch.readings[i].timestamp).getTime() -
            new Date(batch.readings[0].timestamp).getTime()) /
          60000;
        break;
      }
    }

    let maxRateOfChange = 0;
    for (let i = 1; i < reactorTemps.length; i++) {
      const dt =
        (new Date(batch.readings[i].timestamp).getTime() -
          new Date(batch.readings[i - 1].timestamp).getTime()) /
        60000;
      if (dt > 0) {
        const rate = Math.abs(reactorTemps[i] - reactorTemps[i - 1]) / dt;
        maxRateOfChange = Math.max(maxRateOfChange, rate);
      }
    }

    thermalSummary = [
      `Lecturas: ${reactorTemps.length} puntos`,
      `Reactor: mín ${minTemp.toFixed(0)}°C, máx ${maxTemp.toFixed(0)}°C, promedio ${avgTemp.toFixed(1)}°C`,
      `Estabilidad (stddev): ${stddev.toFixed(1)}°C`,
      `Rampa a 150°C: ${rampMinutes.toFixed(0)} minutos`,
      `Tiempo en zona de producción (>150°C): ${productionMinutes.toFixed(0)} minutos`,
      `Tasa máxima de cambio: ${maxRateOfChange.toFixed(1)}°C/min`,
    ].join("\n");
  }

  // Events summary
  const eventsByType: Record<string, number> = {};
  const incidents: string[] = [];
  for (const ev of batch.events) {
    eventsByType[ev.type] = (eventsByType[ev.type] || 0) + 1;
    if (ev.type === "INCIDENT") {
      incidents.push(ev.detail + (ev.notes ? ` (${ev.notes})` : ""));
    }
  }
  const eventsStr = Object.entries(eventsByType)
    .map(([type, count]) => `${type}: ${count}`)
    .join(", ");

  // Lab results
  let labStr = "Sin resultados de laboratorio.";
  if (batch.labResults.length > 0) {
    const lab = batch.labResults[0];
    const parts = [`Laboratorio: ${lab.labName}`];
    if (lab.viscosity40C != null)
      parts.push(`Viscosidad @40°C: ${lab.viscosity40C} mm²/s`);
    if (lab.waterContent != null)
      parts.push(`Contenido de agua: ${lab.waterContent} PPM`);
    if (lab.sulfurPercent != null)
      parts.push(`Azufre: ${lab.sulfurPercent}% m/m`);
    if (lab.verdict) parts.push(`Veredicto: ${lab.verdict}`);
    labStr = parts.join("\n");
  }

  return [
    `Soy ${userName} de EcoNova Trace. Necesito que analices el siguiente lote de pirólisis y me des insights detallados.`,
    "",
    `Responde con un JSON válido (sin markdown, sin backticks) con esta estructura:`,
    `{"summary":"2-3 oraciones overview","highlights":[{"type":"positive|warning|neutral","title":"título corto","detail":"explicación"}],"thermalAnalysis":"párrafo sobre perfil térmico","recommendations":["recomendación 1","recomendación 2"]}`,
    "",
    `=== LOTE ${batch.code} ===`,
    `Estado: ${batch.status}`,
    `Feedstock: ${batch.feedstockWeight} kg ${batch.feedstockType} de ${batch.feedstockOrigin}`,
    batch.contaminationPct != null
      ? `Contaminación estimada: ${batch.contaminationPct}%`
      : null,
    batch.feedstockCondition
      ? `Condición: ${batch.feedstockCondition}`
      : null,
    `Operadores: ${batch.operators.join(", ")}`,
    "",
    "--- Producción ---",
    batch.oilOutput != null
      ? `Aceite producido: ${batch.oilOutput} L`
      : "Sin producción de aceite",
    batch.yieldPercent != null
      ? `Rendimiento: ${batch.yieldPercent}%`
      : null,
    batch.durationMinutes != null
      ? `Duración: ${Math.floor(batch.durationMinutes / 60)}h ${batch.durationMinutes % 60}m`
      : null,
    batch.stopReason ? `Razón de paro: ${batch.stopReason}` : null,
    batch.notes ? `Notas: ${batch.notes}` : null,
    "",
    "--- Perfil Térmico ---",
    thermalSummary,
    "",
    "--- Eventos del Proceso ---",
    `Total: ${batch.events.length} eventos (${eventsStr || "ninguno"})`,
    incidents.length > 0
      ? `Incidentes: ${incidents.join("; ")}`
      : "Sin incidentes",
    "",
    "--- Resultados de Laboratorio ---",
    labStr,
    "",
    "--- Impacto Ambiental ---",
    batch.co2Avoided != null
      ? `CO₂ evitado: ${batch.co2Avoided.toFixed(1)} kg CO₂eq`
      : "Sin cálculo de CO₂",
    batch.co2Baseline != null && batch.co2Project != null
      ? `Reducción: ${((1 - batch.co2Project / batch.co2Baseline) * 100).toFixed(0)}% vs quema abierta`
      : null,
    "",
    `--- Promedios Históricos (${historical.totalBatches} lotes) ---`,
    `Rendimiento promedio: ${historical.avgYield.toFixed(1)}%`,
    `Duración promedio: ${historical.avgDuration.toFixed(0)} min`,
    `CO₂ evitado promedio: ${historical.avgCO2Avoided.toFixed(1)} kg`,
    "",
    "Genera entre 3 y 5 highlights y entre 2 y 3 recomendaciones accionables.",
  ]
    .filter(Boolean)
    .join("\n");
}

/* ── Call Nova AI Gateway ── */
async function callNovaGateway(
  message: string,
  conversationId: string
): Promise<NovaRawResponse | null> {
  if (!NOVA_API_KEY) {
    console.warn("[Nova AI] NOVA_API_KEY not configured");
    return null;
  }

  try {
    const res = await fetch(`${NOVA_GATEWAY_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NOVA_API_KEY}`,
      },
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
        user_id: "novatrace-system",
        page_context: "novatrace-batch-analysis",
      }),
    });

    if (!res.ok) {
      console.error(
        `[Nova AI] Gateway returned ${res.status}: ${await res.text()}`
      );
      return null;
    }

    const data = await res.json();
    return data as NovaRawResponse;
  } catch (error) {
    console.error("[Nova AI] Gateway request failed:", error);
    return null;
  }
}

/* ── Parse structured insights from Nova's response ── */
function parseInsights(responseText: string): NovaInsights | null {
  try {
    // Try direct JSON parse first
    const parsed = JSON.parse(responseText);
    if (parsed.summary && Array.isArray(parsed.highlights)) {
      return parsed;
    }
  } catch {
    // Try extracting JSON from the response text
    const jsonMatch = responseText.match(/\{[\s\S]*"summary"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.summary && Array.isArray(parsed.highlights)) {
          return parsed;
        }
      } catch {
        // fall through
      }
    }
  }

  // If we can't parse structured JSON, build insights from raw text
  if (responseText && responseText.length > 50) {
    return {
      summary: responseText.slice(0, 300),
      highlights: [
        {
          type: "neutral",
          title: "Análisis completado",
          detail: responseText.slice(0, 200),
        },
      ],
      thermalAnalysis:
        "Nova analizó el lote pero no pudo estructurar el perfil térmico en formato esperado.",
      recommendations: [
        "Revisar el análisis completo en la respuesta de Nova AI.",
      ],
    };
  }

  return null;
}

/* ── Main Export ── */
export async function generateBatchInsights(
  batch: BatchForAnalysis,
  historical: HistoricalStats,
  userName: string
): Promise<NovaInsights | null> {
  // Check cache
  const cached = getCached(batch.id, batch.status === "COMPLETED");
  if (cached) return cached;

  // Build the message with all batch data
  const message = buildBatchMessage(batch, historical, userName);

  // Use batch ID as conversation ID for consistent memory in Redis
  const conversationId = `novatrace-batch-${batch.id}`;

  // Call Nova AI Gateway
  const response = await callNovaGateway(message, conversationId);
  if (!response || !response.response) {
    return null;
  }

  // Parse the structured insights
  const insights = parseInsights(response.response);
  if (!insights) {
    console.error("[Nova AI] Could not parse insights from response");
    return null;
  }

  // Cache the result
  insightsCache.set(batch.id, { data: insights, timestamp: Date.now() });

  return insights;
}
