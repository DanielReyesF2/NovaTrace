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
    `Soy ingeniero de EcoNova. Necesito un ANÁLISIS PROFUNDO de estos ${labResults.length} resultados de laboratorio del lote ${batchCode} de pirólisis de plástico agrícola.`,
    "",
    `NO quiero solo una comparación — quiero que me EXPLIQUES qué significan estos números. Imagina que soy un ingeniero que necesita tomar decisiones comerciales y de seguridad basadas en estos resultados. Necesito entender la QUÍMICA detrás de cada valor.`,
    "",
    `Responde con un JSON válido (sin markdown, sin backticks) con esta estructura:`,
    `{`,
    `  "summary": "3-4 oraciones de panorama general: qué productos son, cómo se comparan entre sí, y qué implicaciones tienen para EcoNova",`,
    `  "findings": [{"type":"positive|warning|critical|neutral","title":"título corto","detail":"explicación técnica DETALLADA con contexto químico — por qué importa este hallazgo, qué significa para el uso del producto, cómo se compara con productos petroleros convencionales"}],`,
    `  "normalization": "Párrafo explicando las diferencias de métodos entre laboratorios (temperatura de medición, tipo de copa, unidades) y LOS VALORES NORMALIZADOS CALCULADOS para poder comparar manzanas con manzanas. Incluye los cálculos específicos.",`,
    `  "productCharacterization": "Párrafo técnico sobre qué tipo de producto es cada muestra: fracción pesada vs ligera, rango de destilación estimado (C5-C12 vs C12-C20 etc), comparación con productos petroleros convencionales (gasolina, diésel, queroseno, nafta), posibles usos comerciales ESPECÍFICOS y mercados potenciales.",`,
    `  "safetyAssessment": "Párrafo sobre las implicaciones de SEGURIDAD: clasificación de peligrosidad (NFPA, GHS), requerimientos de almacenamiento, transporte, manipulación, EPP necesario, incompatibilidades químicas. Si hay punto de inflamación <23°C, ENFATIZAR que es un líquido inflamable Categoría 1-2 y las precauciones específicas.",`,
    `  "proactiveInsights": [{"question":"Una pregunta que el usuario NO sabe que debería hacer pero que es CRÍTICA para su operación","answer":"La respuesta detallada con contexto técnico","importance":"high|medium|low"}],`,
    `  "recommendations": ["recomendación accionable y específica"]`,
    `}`,
    "",
    `CONTEXTO TÉCNICO PARA TU ANÁLISIS:`,
    `- EcoNova hace pirólisis de plástico agrícola (LDPE/HDPE) para producir combustibles alternativos`,
    `- Los laboratorios usan DIFERENTES métodos ASTM — necesitas normalizar antes de comparar:`,
    `  * Densidad a 15°C vs 20°C: disminuye ~0.0007 g/mL por °C. 0.838 g/mL @15°C ≈ 0.8345 @20°C`,
    `  * Viscosidad cinemática (mm²/s, @40°C) vs dinámica (cP, @20°C): ν = μ/ρ. A 20°C el fluido es más viscoso que a 40°C`,
    `  * Flash point copa cerrada (D93) vs copa abierta (D92): copa abierta da valores MÁS BAJOS (±5-10°C)`,
    `  * Poder calorífico: 1 Cal/g × 4.184 = kJ/kg; 10830 Cal/g = 45.31 MJ/kg`,
    `  * Agua: PPM vs % — 133 PPM = 0.0133%; 0.1399% = 1399 PPM`,
    "",
    `- Si flash point <5°C → fracción MUY ligera tipo nafta/gasolina (C5-C10, ~70°C-170°C range de destilación)`,
    `- Si flash point 68°C → fracción media tipo diésel/queroseno (C10-C20, ~170°C-370°C)`,
    `- La pirólisis de LDPE típicamente produce: ~60-70% líquidos, 15-25% gases, 10-15% char`,
    `- Los líquidos de pirólisis pueden contener olefinas, parafinas, nafténicos y aromáticos`,
    "",
    `GENERA:`,
    `- 5 a 7 findings (hallazgos con peso técnico real, no observaciones obvias)`,
    `- 4 a 6 proactiveInsights — estas son las PREGUNTAS QUE EL USUARIO NO SABE QUE DEBE HACER. Ejemplos:`,
    `  * ¿Necesitan una licencia especial para almacenar un líquido con flash point <5°C?`,
    `  * ¿Qué pruebas adicionales deberían solicitar (destilación ASTM D86, corrosión al cobre, estabilidad oxidativa)?`,
    `  * ¿Cómo afecta la presencia de olefinas a la estabilidad del producto en almacenamiento?`,
    `  * ¿Es necesario hacer una cromatografía de gases para verificar composición?`,
    `  * ¿Qué normatividad mexicana aplica (NOM-016-CRE, NOM-005-STPS)?`,
    `  * ¿Deberían considerar fraccionamiento/destilación para separar las fracciones y obtener más valor?`,
    `  * ¿Cómo se compara el contenido energético con el costo de producción?`,
    `  * ¿Qué implicaciones tiene para la certificación ISCC+ que están buscando?`,
    `- 3 a 5 recomendaciones técnicas accionables y ESPECÍFICAS para EcoNova`,
    "",
    ...labSections,
  ].join("\n");
}

/* ── Generate Lab Analysis ── */
export async function generateLabAnalysis(
  labResults: Array<Record<string, unknown>>,
  batchCode: string
): Promise<NovaLabAnalysis | null> {
  // Check cache
  const cacheKey = `lab-${labResults.map((l) => l.id).join("-")}`;
  const cached = labInsightsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 60 * 60 * 1000) {
    return cached.data;
  }

  const message = buildLabComparisonMessage(labResults, batchCode);
  const conversationId = `novatrace-lab-${cacheKey}`;

  const response = await callNovaGateway(message, conversationId);
  if (!response || !response.response) {
    return null;
  }

  // Parse
  const analysis = parseLabAnalysis(response.response);
  if (!analysis) {
    console.error("[Nova AI] Could not parse lab analysis from response");
    return null;
  }

  // Cache
  labInsightsCache.set(cacheKey, { data: analysis, timestamp: Date.now() });

  return analysis;
}

function parseLabAnalysis(responseText: string): NovaLabAnalysis | null {
  try {
    const parsed = JSON.parse(responseText);
    if (parsed.summary && Array.isArray(parsed.findings)) {
      return parsed;
    }
  } catch {
    const jsonMatch = responseText.match(/\{[\s\S]*"summary"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.summary && Array.isArray(parsed.findings)) {
          return parsed;
        }
      } catch {
        // fall through
      }
    }
  }

  if (responseText && responseText.length > 50) {
    return {
      summary: responseText.slice(0, 400),
      findings: [
        {
          type: "neutral",
          title: "Análisis completado",
          detail: responseText.slice(0, 300),
        },
      ],
      normalization: "No se pudo estructurar el análisis de normalización.",
      productCharacterization: "No se pudo estructurar la caracterización.",
      safetyAssessment: "",
      proactiveInsights: [],
      recommendations: ["Revisar el análisis completo."],
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
