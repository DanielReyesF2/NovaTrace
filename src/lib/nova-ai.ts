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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // 2 min timeout

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
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.error(
        `[Nova AI] Gateway returned ${res.status}: ${await res.text()}`
      );
      return null;
    }

    const data = await res.json();
    return data as NovaRawResponse;
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      console.error("[Nova AI] Gateway request timed out (120s)");
    } else {
      console.error("[Nova AI] Gateway request failed:", error);
    }
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

/* ── Lab Analysis Types ── */
export interface NovaLabAnalysis {
  summary: string;
  findings: Array<{
    type: "positive" | "warning" | "critical" | "neutral";
    title: string;
    detail: string;
  }>;
  normalization: string;
  productCharacterization: string;
  safetyAssessment: string;
  proactiveInsights: Array<{
    question: string;
    answer: string;
    importance: "high" | "medium" | "low";
  }>;
  recommendations: string[];
}

/* ── Build Lab Comparison Message ── */
function buildLabComparisonMessage(
  labResults: Array<Record<string, unknown>>,
  batchCode: string
): string {
  const labSections = labResults.map((lr, i) => {
    const lines = [
      `=== MUESTRA ${i + 1}: ${lr.labName} ===`,
      `Folio: ${lr.sampleNumber}`,
      `Fecha: ${lr.reportDate}`,
      lr.productClassification ? `Clasificación del lab: ${lr.productClassification}` : null,
      lr.labCertification ? `Certificación: ${lr.labCertification}` : null,
      "",
      "Resultados:",
    ];

    // Lab 1 style
    if (lr.density15C != null) lines.push(`  Densidad @15°C: ${lr.density15C} g/mL (ASTM D4052)`);
    if (lr.viscosity40C != null) lines.push(`  Viscosidad cinemática @40°C: ${lr.viscosity40C} mm²/s (ASTM D7042)`);
    if (lr.flashPoint != null) lines.push(`  Punto de inflamación copa cerrada (Pensky-Martens): ${lr.flashPoint}°C (ASTM D93)`);
    if (lr.waterContent != null) lines.push(`  Contenido de agua: ${lr.waterContent} PPM (ASTM D6304)`);
    if (lr.sulfurPercent != null) lines.push(`  Azufre: ${lr.sulfurPercent}% m/m (ASTM D4951)`);
    if (lr.calorificMJ != null) lines.push(`  Poder calorífico: ${lr.calorificMJ} MJ/kg`);
    if (lr.carbonResidue != null) lines.push(`  Residuo carbón: ${lr.carbonResidue}% (ASTM D4530)`);
    if (lr.ashContent != null) lines.push(`  Cenizas: ${lr.ashContent}% (ASTM D482)`);
    if (lr.crepitation) lines.push(`  Crepitación: ${lr.crepitation}`);
    if (lr.appearance) lines.push(`  Apariencia: ${lr.appearance}`);
    if (lr.color) lines.push(`  Color: ${lr.color}`);

    // Lab 2 style
    if (lr.density20C != null) lines.push(`  Densidad @20°C: ${lr.density20C} Kg/L (ASTM D1298)`);
    if (lr.viscDynamic20C != null) lines.push(`  Viscosidad dinámica @20°C: ${lr.viscDynamic20C} cP (ASTM D2983)`);
    if (lr.flashPointOpen != null) lines.push(`  Punto de inflamación copa abierta (Cleveland): ${Number(lr.flashPointOpen) <= 5 ? "<5" : lr.flashPointOpen}°C (ASTM D92)`);
    if (lr.calorificCalG != null) lines.push(`  Poder calorífico: ${lr.calorificCalG} Cal/g (ASTM D240)`);
    if (lr.waterSedimentPct != null) lines.push(`  Agua y sedimento: ${lr.waterSedimentPct}% (ASTM D4007)`);
    if (lr.waterByKFPct != null) lines.push(`  Agua por Karl Fischer: ${lr.waterByKFPct}% (ASTM E203)`);

    if (lr.labNotes) lines.push(`  Notas del laboratorio: ${lr.labNotes}`);
    if (lr.verdict) lines.push(`  Dictamen: ${lr.verdict}`);

    return lines.filter(Boolean).join("\n");
  });

  return [
    `Analiza ${labResults.length} resultados de lab del lote ${batchCode} (pirólisis LDPE agrícola, EcoNova México).`,
    `Explica la química, normaliza métodos ASTM, evalúa seguridad, y haz preguntas proactivas.`,
    "",
    `IMPORTANTE: Responde SOLO con JSON puro, sin backticks, sin markdown, sin texto extra. Sé CONCISO en cada campo (máximo 2-3 oraciones por finding/insight).`,
    "",
    `{"summary":"3 oraciones panorama","findings":[{"type":"positive|warning|critical|neutral","title":"corto","detail":"explicación con contexto químico"}],"normalization":"diferencias ASTM y valores normalizados","productCharacterization":"tipo producto, fracción, usos comerciales","safetyAssessment":"NFPA/GHS, flash point, almacenamiento, EPP","proactiveInsights":[{"question":"pregunta crítica","answer":"respuesta técnica","importance":"high|medium|low"}],"recommendations":["acción específica"]}`,
    "",
    `Contexto: Densidad 15°C vs 20°C (-0.0007/°C), visc cinemática vs dinámica (ν=μ/ρ), flash cerrada vs abierta (+5-10°C), 1 Cal/g=4.184 kJ/kg, PPM vs %.`,
    `Flash <5°C=nafta C5-C10; Flash 68°C=diésel C10-C20.`,
    "",
    `Genera: 5 findings, 4 proactiveInsights (licencias, pruebas adicionales, normatividad NOM, fraccionamiento), 3 recommendations.`,
    "",
    ...labSections,
  ].join("\n");
}

/* ── Generate Lab Analysis ── */
export async function generateLabAnalysis(
  labResults: Array<Record<string, unknown>>,
  batchCode: string,
  skipCache = false
): Promise<NovaLabAnalysis | null> {
  // Check cache (unless explicitly skipping)
  const cacheKey = `lab-${labResults.map((l) => l.id).join("-")}`;
  if (!skipCache) {
    const cached = labInsightsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 60 * 60 * 1000) {
      // Validate cached data is a real analysis (not a fallback with raw markdown)
      const isRealAnalysis = cached.data.findings.length > 1 ||
        (cached.data.safetyAssessment && cached.data.safetyAssessment.length > 10) ||
        (cached.data.proactiveInsights && cached.data.proactiveInsights.length > 0);
      if (isRealAnalysis) {
        console.log("[Nova AI] Returning cached lab analysis");
        return cached.data;
      } else {
        console.log("[Nova AI] Cached result looks like a fallback, re-analyzing...");
        labInsightsCache.delete(cacheKey);
      }
    }
  } else {
    // Explicitly clear stale cache
    labInsightsCache.delete(cacheKey);
    console.log("[Nova AI] Cache skipped, forcing fresh analysis");
  }

  const message = buildLabComparisonMessage(labResults, batchCode);
  const conversationId = `novatrace-lab-${Date.now()}`; // Unique conversation each time

  console.log("[Nova AI] Calling gateway for lab analysis...");
  const response = await callNovaGateway(message, conversationId);
  if (!response || !response.response) {
    console.error("[Nova AI] No response from gateway");
    return null;
  }

  console.log("[Nova AI] Got response, length:", response.response.length, "First 100 chars:", response.response.substring(0, 100));

  // Parse
  const analysis = parseLabAnalysis(response.response);
  if (!analysis) {
    console.error("[Nova AI] Could not parse lab analysis from response. First 300 chars:", response.response?.substring(0, 300));
    return null;
  }

  // Only cache if it's a REAL analysis (not a fallback)
  const isRealAnalysis = analysis.findings.length > 1 ||
    (analysis.safetyAssessment && analysis.safetyAssessment.length > 10) ||
    (analysis.proactiveInsights && analysis.proactiveInsights.length > 0);

  if (isRealAnalysis) {
    labInsightsCache.set(cacheKey, { data: analysis, timestamp: Date.now() });
    console.log("[Nova AI] Lab analysis cached (real analysis)");
  } else {
    console.log("[Nova AI] Lab analysis NOT cached (looks like fallback)");
  }

  return analysis;
}

function parseLabAnalysis(responseText: string): NovaLabAnalysis | null {
  console.log("[Nova AI Parser] Input length:", responseText.length);

  // Helper: validate parsed object has required fields
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isValid = (obj: any): obj is NovaLabAnalysis =>
    obj && typeof obj.summary === "string" && Array.isArray(obj.findings);

  // Strategy 1 (PRIMARY): String-aware balanced braces — most robust
  // Finds the first { and its matching }, correctly handling braces inside JSON strings
  const firstBrace = responseText.indexOf("{");
  if (firstBrace !== -1) {
    let depth = 0;
    let inString = false;
    let escape = false;
    let end = -1;

    for (let i = firstBrace; i < responseText.length; i++) {
      const ch = responseText[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        if (inString) { escape = true; }
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;
      if (ch === "{") depth++;
      if (ch === "}") {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }

    if (end > firstBrace) {
      const extracted = responseText.substring(firstBrace, end + 1);
      console.log("[Nova AI Parser] Balanced extraction, length:", extracted.length, "firstBrace:", firstBrace, "end:", end);
      try {
        const parsed = JSON.parse(extracted);
        if (isValid(parsed)) {
          console.log("[Nova AI Parser] ✅ Parsed via balanced braces, findings:", parsed.findings?.length, "safety:", (parsed.safetyAssessment as string)?.length || 0);
          return parsed;
        }
      } catch (e) {
        const err = e as SyntaxError & { message: string };
        console.log("[Nova AI Parser] Balanced parse failed:", err.message);
        // Log area around error for debugging
        const posMatch = err.message.match(/position (\d+)/);
        if (posMatch) {
          const pos = parseInt(posMatch[1]);
          console.log("[Nova AI Parser] Error context:", JSON.stringify(extracted.substring(Math.max(0, pos - 50), pos + 50)));
        }
      }
    } else {
      console.log("[Nova AI Parser] Balanced braces: no closing found, depth:", depth, "scanned:", responseText.length - firstBrace, "chars");
    }
  }

  // Strategy 2: Strip outermost ``` fences and try JSON.parse
  // Handles ```json\n{...}\n``` wrapping, using lastIndexOf for the closing fence
  const trimmed = responseText.trim();
  if (trimmed.startsWith("```")) {
    const openEnd = trimmed.indexOf("\n");
    const closingFence = trimmed.lastIndexOf("```", trimmed.length - 1);
    if (openEnd > 0 && closingFence > openEnd) {
      const inner = trimmed.substring(openEnd + 1, closingFence).trim();
      console.log("[Nova AI Parser] Fence-stripped content length:", inner.length);
      try {
        const parsed = JSON.parse(inner);
        if (isValid(parsed)) {
          console.log("[Nova AI Parser] ✅ Parsed from fence-stripped content");
          return parsed;
        }
      } catch (e) {
        console.log("[Nova AI Parser] Fence-stripped parse failed:", (e as Error).message);
      }
    }
  }

  // Strategy 3: Direct JSON parse (response is raw JSON)
  try {
    const parsed = JSON.parse(trimmed);
    if (isValid(parsed)) {
      console.log("[Nova AI Parser] ✅ Parsed directly");
      return parsed;
    }
  } catch {
    // continue
  }

  console.error("[Nova AI Parser] ❌ All strategies failed. First 500 chars:", responseText.substring(0, 500));

  // Fallback: return degraded analysis
  if (responseText && responseText.length > 50) {
    // Try to extract just the summary value from the raw text
    const summaryMatch = responseText.match(/"summary"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    const displaySummary = summaryMatch
      ? summaryMatch[1].replace(/\\"/g, '"').replace(/\\n/g, " ").slice(0, 400)
      : responseText.replace(/```(?:json)?/g, "").replace(/[{}[\]]/g, " ").trim().slice(0, 400);

    return {
      summary: displaySummary,
      findings: [
        {
          type: "neutral",
          title: "Análisis completado",
          detail: "Nova generó un análisis pero no se pudo estructurar completamente. Los resultados principales se muestran arriba.",
        },
      ],
      normalization: "No se pudo estructurar el análisis de normalización.",
      productCharacterization: "No se pudo estructurar la caracterización.",
      safetyAssessment: "",
      proactiveInsights: [],
      recommendations: ["Intentar regenerar el análisis para obtener resultados completos."],
    };
  }
  return null;
}

const labInsightsCache = new Map<string, { data: NovaLabAnalysis; timestamp: number }>();

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
