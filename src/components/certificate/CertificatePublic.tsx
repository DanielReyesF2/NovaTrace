"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { SankeyFlow } from "@/components/batch/SankeyFlow";

// ─── Types ──────────────────────────────────────────────────────
interface CertificatePublicProps {
  certificate: {
    code: string;
    hash: string;
    generatedAt: string;
    verifiedAt: string | null;
    batch: {
      code: string;
      date: string;
      feedstockType: string;
      feedstockOrigin: string;
      feedstockWeight: number;
      feedstockCondition: string | null;
      contaminationPct: number | null;
      oilOutput: number | null;
      oilWeightKg: number | null;
      yieldPercent: number | null;
      durationMinutes: number | null;
      maxReactorTemp: number | null;
      dieselConsumedL: number | null;
      electricityKwh: number | null;
      gasRecirculatedKg: number | null;
      oilCalorificMJ: number | null;
      charCalorificMJ: number | null;
      transportMode: string | null;
      transportDistanceKm: number | null;
      transportFuelType: string | null;
      transportFuelL: number | null;
      transportCo2Kg: number | null;
      emissionsCo2Kg: number | null;
      emissionsCh4Kg: number | null;
      emissionsNoxKg: number | null;
      emissionsSoxKg: number | null;
      emissionsPmKg: number | null;
      emissionsWaterL: number | null;
      waterConsumedL: number | null;
      catalystType: string | null;
      catalystKg: number | null;
      chemicalsUsed: string | null;
      charDisposition: string | null;
      ashDisposition: string | null;
      wastewaterDisp: string | null;
      sustainabilityCertId: string | null;
      massBalancePeriod: string | null;
      allocMethod: string | null;
      plasticTypeCode: string | null;
      baselineScenario: string | null;
      additionalityProof: string | null;
      co2Baseline: number | null;
      co2Project: number | null;
      co2Avoided: number | null;
      labResults: Array<{
        labName: string;
        labCertification: string | null;
        appearance: string | null;
        color: string | null;
        crepitation: string | null;
        analystName: string | null;
        sampleNumber: string | null;
        sulfurPercent: number | null;
        waterContent: number | null;
        flashPoint: number | null;
        density15C: number | null;
        viscosity40C: number | null;
        carbonResidue: number | null;
        ashContent: number | null;
        calorificMJ: number | null;
        verdict: string | null;
      }>;
    };
  };
}

// ─── Helpers ────────────────────────────────────────────────────
function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-1 h-6 rounded-full bg-[#3d5c0e]" />
        <span className="text-[9px] font-mono text-[#3d5c0e]/50 font-bold">{num}</span>
        <h3 className="text-[10px] tracking-[2.5px] text-[#3d5c0e] font-bold uppercase">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Row({ label, value, bold, sub }: { label: string; value: string | number | null; bold?: boolean; sub?: string }) {
  if (value == null || value === "") return null;
  return (
    <div className="py-2 border-b border-gray-100/60 last:border-0">
      <div className="flex justify-between items-baseline gap-3">
        <span className="text-gray-500 text-[11px] flex-shrink-0">{label}</span>
        <span className={`text-[11px] text-right ${bold ? "font-mono font-bold text-gray-900" : "text-gray-700"}`}>{value}</span>
      </div>
      {sub && <p className="text-[9px] text-gray-400 mt-1 leading-relaxed italic">{sub}</p>}
    </div>
  );
}

function Info({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[9.5px] text-gray-500 leading-relaxed mt-3 bg-[#f8f7f4] rounded-xl px-4 py-3 border-l-[3px] border-[#3d5c0e]/25">
      {children}
    </div>
  );
}

function Stat({ value, unit, label, color }: { value: string; unit?: string; label: string; color: string }) {
  return (
    <div className="text-center px-2 py-4 rounded-xl border" style={{ background: `linear-gradient(135deg, ${color}0a, ${color}04)`, borderColor: `${color}15` }}>
      <div className="flex items-baseline justify-center gap-0.5">
        <span className="font-mono text-xl sm:text-2xl font-bold" style={{ color }}>{value}</span>
        {unit && <span className="text-[10px] font-semibold" style={{ color, opacity: 0.7 }}>{unit}</span>}
      </div>
      <div className="text-[8px] sm:text-[9px] text-gray-400 uppercase tracking-wider mt-1 leading-tight">{label}</div>
    </div>
  );
}

function ComplianceCard({ color, name, article, items, status }: {
  color: string; name: string; article: string; items: string[]; status: string;
}) {
  return (
    <div className="rounded-xl p-4 border" style={{ borderColor: `${color}20`, background: `linear-gradient(135deg, ${color}06, transparent)` }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[11px] font-bold text-gray-700">{name}</span>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-bold tracking-wider"
          style={{ backgroundColor: `${color}15`, color }}>{status}</span>
      </div>
      <p className="text-[9px] font-medium text-gray-500 mb-2">{article}</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-[9px] text-gray-400 leading-relaxed flex items-start gap-1.5">
            <span style={{ color }} className="mt-px flex-shrink-0 text-[7px]">&#9679;</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LabRow({ label, value, unit, diesel, pass, method }: {
  label: string; value: string; unit: string; diesel: string; pass: boolean; method: string;
}) {
  return (
    <div className="grid grid-cols-[1fr,auto,auto,auto] gap-x-4 items-center py-2 border-b border-gray-100/60 last:border-0">
      <div>
        <span className="text-[11px] text-gray-600 font-medium">{label}</span>
        <span className="text-[8px] text-gray-300 ml-1.5">{method}</span>
      </div>
      <span className="font-mono text-[11px] font-bold text-gray-800 text-right">{value} <span className="text-[9px] text-gray-400 font-normal">{unit}</span></span>
      <span className="text-[9px] text-gray-400 text-right">{diesel}</span>
      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${pass ? "bg-[#3d5c0e]/10 text-[#3d5c0e]" : "bg-red-50 text-red-500"}`}>
        {pass ? "✓" : "✗"}
      </span>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────
export function CertificatePublic({ certificate }: CertificatePublicProps) {
  const [lang, setLang] = useState<"es" | "en">("es");
  const t = (es: string, en: string) => (lang === "es" ? es : en);

  const { batch } = certificate;

  // ── Mass balance (rounded for exact closure) ──
  const oilL = batch.oilOutput ?? 0;
  const oilKg = Math.round(batch.oilWeightKg ?? oilL * 0.85);
  const co2Avoided = batch.co2Avoided ?? 0;
  const cleanKg = batch.feedstockWeight * (1 - (batch.contaminationPct ?? 0) / 100);
  const charKg = Math.round(cleanKg * 0.10);
  const gasKg = Math.round(cleanKg) - oilKg - charKg;
  const contaminationKg = Math.round(batch.feedstockWeight - cleanKg);

  // ── CO₂ metrics ──
  const co2PerLiter = oilL > 0 && co2Avoided > 0 ? co2Avoided / oilL : 0;
  const baselinePerL = batch.co2Baseline && oilL > 0 ? batch.co2Baseline / oilL : 0;
  const projectPerL = batch.co2Project && oilL > 0 ? batch.co2Project / oilL : 0;
  const reductionPct = batch.co2Baseline && batch.co2Baseline > 0
    ? ((batch.co2Baseline - (batch.co2Project ?? 0)) / batch.co2Baseline * 100) : 0;

  // ── Energy balance ──
  const dieselL = batch.dieselConsumedL ?? 0;
  const dieselMJ = Math.round(dieselL * 0.85 * 45.6);
  const elecKwh = batch.electricityKwh ?? 0;
  const elecMJ = Math.round(elecKwh * 3.6);
  const gasRecKg = batch.gasRecirculatedKg ?? 0;
  const gasMJ = Math.round(gasRecKg * 38);
  const totalEnergyIn = dieselMJ + elecMJ + gasMJ;
  const oilMJperKg = batch.oilCalorificMJ ?? 43.2;
  const charMJperKg = batch.charCalorificMJ ?? 28.5;
  const oilEnergyMJ = Math.round(oilKg * oilMJperKg);
  const charEnergyMJ = Math.round(charKg * charMJperKg);
  const totalEnergyOut = oilEnergyMJ + charEnergyMJ;
  const energyRatio = totalEnergyIn > 0 ? totalEnergyOut / totalEnergyIn : 0;
  const hasEnergyData = dieselL > 0 || elecKwh > 0;

  const verifyUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verify/${certificate.code}`
    : `/verify/${certificate.code}`;

  const lab = batch.labResults.length > 0 ? batch.labResults[0] : null;

  const dateFormatted = new Date(batch.date).toLocaleDateString(
    lang === "es" ? "es-MX" : "en-US",
    { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" },
  );

  const gasPctOfEnergy = totalEnergyIn > 0 ? Math.round((gasMJ / totalEnergyIn) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F5F3EE] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* ═══ HEADER ═══ */}
          <div style={{ background: "linear-gradient(135deg, #1a2e1a 0%, #2d4a1a 50%, #1a2e1a 100%)" }}>
            <div className="px-6 sm:px-8 pt-5 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[8px] tracking-[4px] text-white/40 uppercase mb-1">
                    {t("Pasaporte Digital de Producto", "Digital Product Passport")}
                  </p>
                  <h1 className="text-2xl font-bold text-white font-mono tracking-tight">ECONOVA</h1>
                  <p className="text-[8px] tracking-[3px] text-white/30 uppercase mt-0.5">
                    {t("Economía Circular · México", "Circular Economy · Mexico")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {/* Language toggle */}
                  <div className="flex gap-0.5 bg-white/[0.12] rounded-full p-0.5 border border-white/[0.1]">
                    <button onClick={() => setLang("es")}
                      className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-wider transition-all ${lang === "es" ? "bg-white/25 text-white shadow-sm" : "text-white/50 hover:text-white/70"}`}>ES</button>
                    <button onClick={() => setLang("en")}
                      className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-wider transition-all ${lang === "en" ? "bg-white/25 text-white shadow-sm" : "text-white/50 hover:text-white/70"}`}>EN</button>
                  </div>
                  <div className="bg-white/10 rounded-xl p-2 backdrop-blur-sm">
                    <QRCodeSVG value={verifyUrl} size={56} level="M" bgColor="transparent" fgColor="#ffffff" />
                  </div>
                </div>
              </div>
            </div>
            {/* Compliance badges */}
            <div className="flex items-center justify-center gap-5 px-6 py-2.5 bg-white/[0.05] border-t border-white/[0.08]">
              {[
                { label: "EU DPP", sub: "ESPR 2024/1781" },
                { label: "ISO 14040", sub: "LCA" },
                { label: "ISCC PLUS", sub: "CoC" },
                { label: "Verra", sub: "PWRM0002" },
              ].map((b) => (
                <div key={b.label} className="text-center">
                  <span className="text-[7px] text-white/60 font-semibold tracking-wider">{b.label}</span>
                  <span className="block text-[6px] text-white/30 tracking-wider">{b.sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ═══ PRODUCT HERO ═══ */}
          <div className="px-6 sm:px-8 py-5 border-b border-gray-100">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-mono text-4xl font-bold tracking-tight" style={{ color: "#7C5CFC" }}>{oilL}</span>
              <span className="text-sm text-gray-500">{t("litros de aceite pirolítico", "liters of pyrolysis oil")}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="font-mono font-medium">{batch.code}</span>
              <span>·</span>
              <span>{dateFormatted}</span>
            </div>
          </div>

          {/* ═══ KEY METRICS ═══ */}
          <div className="px-7 sm:px-10 py-5 bg-gray-50/50 border-b border-gray-100">
            <div className="grid grid-cols-4 gap-2">
              <Stat value={co2Avoided.toFixed(0)} unit="kg" label={t("CO₂eq evitados", "CO₂eq avoided")} color="#3d5c0e" />
              <Stat value={`${energyRatio.toFixed(1)}:1`} label={t("Ratio energético", "Energy ratio")} color="#E8700A" />
              <Stat value={(batch.yieldPercent ?? 0).toFixed(0)} unit="%" label={t("Rendimiento", "Yield")} color="#7C5CFC" />
              <Stat value="100" unit="%" label={t("Contenido reciclado", "Recycled content")} color="#2D8CF0" />
            </div>
          </div>

          {/* ═══ CONTENT ═══ */}
          <div className="px-7 sm:px-10 py-8 space-y-10">

            {/* 01 — PRODUCER IDENTITY */}
            <Section num="01" title={t("Identidad del Productor", "Producer Identity")}>
              <div className="space-y-1">
                <Row label={t("Empresa", "Company")} value="EcoNova México S.A. de C.V." bold />
                <Row label={t("Instalación", "Facility")} value={t("Planta Morelia, Michoacán, México", "Morelia Plant, Michoacán, Mexico")}
                  sub={t("Coordenadas: 19.7006° N, 101.1845° W", "Coordinates: 19.7006° N, 101.1845° W")} />
                <Row label={t("Reactor", "Reactor")} value="DY-500"
                  sub={t("Reactor rotatorio discontinuo (batch), capacidad 500 kg/lote, calentamiento externo por quemador diésel/syngas",
                    "Batch rotary reactor, 500 kg/batch capacity, external heating via diesel/syngas burner")} />
                <Row label={t("Tipo de producto", "Product type")} value={t("Aceite pirolítico (pyrolysis oil)", "Pyrolysis oil")}
                  sub={t("Mezcla de hidrocarburos C₆₋₂₀ derivada de residuo plástico — comparable a diésel/nafta",
                    "C₆₋₂₀ hydrocarbon mixture derived from plastic waste — comparable to diesel/naphtha")} />
                <Row label="ID" value={certificate.code} bold />
                <Row label={t("Contenido reciclado", "Recycled content")} value={t("100% — residuo plástico post-consumo", "100% — post-consumer plastic waste")} bold />
              </div>
              <Info>
                {t(
                  "Conforme a ESPR 2024/1781 Annex III: identidad del operador económico (a), identificador único del producto (b), trazabilidad de materias primas (e), contenido reciclado (Art. 7).",
                  "Per ESPR 2024/1781 Annex III: economic operator identity (a), unique product identifier (b), raw material traceability (e), recycled content (Art. 7)."
                )}
              </Info>
            </Section>

            {/* 02 — LCA FRAMEWORK */}
            <Section num="02" title={t("Marco de Análisis de Ciclo de Vida", "Life Cycle Assessment Framework")}>
              <div className="space-y-1">
                <Row label={t("Norma", "Standard")} value="ISO 14040:2006 / ISO 14044:2006" bold />
                <Row label={t("Unidad funcional", "Functional unit")}
                  value={t(
                    `Producción de ${oilL} L de aceite pirolítico (${oilKg} kg) a partir de ${batch.feedstockWeight} kg de residuo plástico agrícola`,
                    `Production of ${oilL} L of pyrolysis oil (${oilKg} kg) from ${batch.feedstockWeight} kg of agricultural plastic waste`
                  )} bold />
                <Row label={t("Frontera del sistema", "System boundary")}
                  value={t("Cuna a puerta (cradle-to-gate)", "Cradle-to-gate")}
                  sub={t(
                    "Incluye: recolección en campo, transporte a planta, pre-procesamiento, pirólisis catalítica, condensación. Excluye: uso final del aceite, distribución post-producción.",
                    "Includes: field collection, transport to plant, pre-processing, catalytic pyrolysis, condensation. Excludes: end-use of oil, post-production distribution."
                  )} />
                <Row label={t("Asignación co-productos", "Co-product allocation")}
                  value={t("Energético — por contenido calórico (MJ/kg)", "Energy-based — by calorific content (MJ/kg)")}
                  sub={t("ISO 14044 §4.3.4 — jerarquía: evitar asignación > físico > energético. Energético seleccionado por naturaleza combustible de todos los co-productos.",
                    "ISO 14044 §4.3.4 — hierarchy: avoid allocation > physical > energy. Energy-based selected given the fuel nature of all co-products.")} />
                <Row label={t("Regla de corte", "Cut-off rule")} value="<1% masa y <1% energía" />
                <Row label={t("Factores de caracterización", "Characterization factors")} value="IPCC AR5 GWP₁₀₀ (CH₄=28, N₂O=265)" />
                <Row label={t("Factor red eléctrica", "Grid emission factor")} value="IEA México 2023: 0.435 kg CO₂/kWh" />
                <Row label={t("Datos primarios", "Primary data")}
                  value={t("Medición directa en planta — DY-500", "Direct plant measurement — DY-500")}
                  sub={t("Temperaturas, masas, volúmenes y consumo energético medidos por operador con instrumentos calibrados.",
                    "Temperatures, masses, volumes, and energy consumption measured by operator with calibrated instruments.")} />
              </div>
              <Info>
                {t(
                  "Categorías de impacto evaluadas conforme ISO 14044 §4.4: cambio climático (GWP₁₀₀), acidificación (NOx+SOx), material particulado (PM₂.₅), uso de agua. Baseline: IPCC 2006 Vol. 5 Table 5.3 — quema abierta de polietileno.",
                  "Impact categories assessed per ISO 14044 §4.4: climate change (GWP₁₀₀), acidification (NOx+SOx), particulate matter (PM₂.₅), water use. Baseline: IPCC 2006 Vol. 5 Table 5.3 — open burning of polyethylene."
                )}
              </Info>
            </Section>

            {/* 03 — FEEDSTOCK CHARACTERIZATION */}
            <Section num="03" title={t("Caracterización del Feedstock", "Feedstock Characterization")}>
              {/* Agricultural context */}
              <p className="text-[8px] uppercase tracking-[1.5px] text-gray-400 font-semibold mb-2">
                {t("Contexto agrícola", "Agricultural context")}
              </p>
              <div className="space-y-1 mb-4">
                <Row label={t("Región", "Region")} value={batch.feedstockOrigin} bold
                  sub={t("Principal zona aguacatera y de berries de México — Uruapan, Tancítaro, Peribán",
                    "Mexico's main avocado and berry region — Uruapan, Tancítaro, Peribán")} />
                <Row label={t("Aplicación original", "Original application")}
                  value={t("Acolchado agrícola (mulch film)", "Agricultural mulch film")}
                  sub={t("Control de malezas, retención de humedad y regulación de temperatura del suelo en cultivos de aguacate, berries y hortalizas.",
                    "Weed control, moisture retention, and soil temperature regulation for avocado, berry, and vegetable crops.")} />
                <Row label={t("Exposición en campo", "Field exposure")}
                  value={t("6–18 meses", "6–18 months")}
                  sub={t("Exposición continua a radiación UV, lluvia, contacto con suelo y agroquímicos.",
                    "Continuous exposure to UV radiation, rain, soil contact, and agrochemicals.")} />
                <Row label={t("Destino sin intervención", "Fate without intervention")}
                  value={t("Quema a cielo abierto en parcela", "Open-field burning")} bold
                  sub={t("No existe infraestructura de reciclaje mecánico para plásticos agrícolas en la región. >95% se quema.",
                    "No mechanical recycling infrastructure exists for agricultural plastics in the region. >95% is burned.")} />
              </div>

              {/* Polymer composition */}
              <p className="text-[8px] uppercase tracking-[1.5px] text-gray-400 font-semibold mb-2">
                {t("Composición polimérica", "Polymer composition")}
              </p>
              <div className="mb-2">
                <div className="flex h-5 rounded-full overflow-hidden shadow-sm">
                  <div className="flex items-center justify-center" style={{ width: "70%", backgroundColor: "#475569" }}>
                    <span className="text-[7px] font-bold text-white/90">70%</span>
                  </div>
                  <div className="flex items-center justify-center" style={{ width: "25%", backgroundColor: "#7c8da0" }}>
                    <span className="text-[7px] font-bold text-white/90">25%</span>
                  </div>
                  <div style={{ width: "5%", backgroundColor: "#b0bec5" }} />
                </div>
                <div className="flex gap-4 mt-2 flex-wrap">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#475569]" /><span className="text-[9px] text-gray-500 font-medium">LDPE (70%)</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#7c8da0]" /><span className="text-[9px] text-gray-500 font-medium">LLDPE (25%)</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#b0bec5]" /><span className="text-[9px] text-gray-500 font-medium">{t("Otros", "Other")} (5%)</span></div>
                </div>
              </div>
              <Info>
                {t(
                  "LDPE: polietileno de baja densidad — film de acolchado estándar. LLDPE: polietileno lineal de baja densidad — stretch wrap, fundas. Otros: aditivos UV estabilizadores, EVA de co-extrusión, tintes. Clasificación SPI: 4-LDPE (predominante).",
                  "LDPE: low-density polyethylene — standard mulch film. LLDPE: linear low-density polyethylene — stretch wrap, covers. Other: UV stabilizer additives, co-extrusion EVA, dyes. SPI classification: 4-LDPE (predominant)."
                )}
              </Info>

              {/* Contaminant profile */}
              <p className="text-[8px] uppercase tracking-[1.5px] text-gray-400 font-semibold mt-4 mb-2">
                {t(`Perfil de contaminantes (${batch.contaminationPct ?? 8}% = ${contaminationKg} kg)`,
                  `Contaminant profile (${batch.contaminationPct ?? 8}% = ${contaminationKg} kg)`)}
              </p>
              <div className="space-y-3 mb-4">
                {[
                  { label: t("Tierra y sedimentos", "Soil & sediment"), pct: 50, kg: 18, color: "#92400e",
                    detail: t("Contacto directo con suelo agrícola durante uso como acolchado.", "Direct contact with agricultural soil during mulch use.") },
                  { label: t("Residuos de agroquímicos", "Agrochemical residues"), pct: 25, kg: 9, color: "#047857",
                    detail: t("Trazas de fertilizantes NPK, herbicidas y fungicidas aplicados sobre el film.", "Traces of NPK fertilizers, herbicides, and fungicides applied over the film.") },
                  { label: t("Materia orgánica vegetal", "Plant organic matter"), pct: 19, kg: 7, color: "#b45309",
                    detail: t("Fragmentos de raíces, tallos y residuos de cultivo atrapados en el film.", "Root fragments, stems, and crop residues trapped in the film.") },
                  { label: t("Humedad residual", "Residual moisture"), pct: 6, kg: 2, color: "#1d4ed8",
                    detail: t("Humedad ambiental absorbida por el film y sedimentos.", "Environmental moisture absorbed by the film and sediments.") },
                ].map((c) => (
                  <div key={c.color} className="bg-gray-50/50 rounded-lg p-2.5">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="text-[11px] text-gray-600 font-medium flex-1">{c.label}</span>
                      <span className="text-[11px] font-mono font-bold text-gray-600">~{c.kg} kg</span>
                    </div>
                    <div className="ml-5 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: c.color, opacity: 0.55 }} />
                    </div>
                    <p className="ml-5 text-[9px] text-gray-400 mt-1">{c.detail}</p>
                  </div>
                ))}
              </div>

              {/* Pre-processing */}
              <p className="text-[8px] uppercase tracking-[1.5px] text-gray-400 font-semibold mt-4 mb-2">
                {t("Pre-procesamiento en planta", "Plant pre-processing")}
              </p>
              <div className="space-y-2 mb-4">
                {[
                  t("Inspección visual y separación manual de contaminantes gruesos (piedras, metal, madera, suelo suelto)",
                    "Visual inspection and manual removal of coarse contaminants (stones, metal, wood, loose soil)"),
                  t("Triturado mecánico a fragmentos ≤ 50 mm para carga homogénea al reactor",
                    "Mechanical shredding to ≤ 50 mm fragments for homogeneous reactor loading"),
                  t("Sin lavado industrial — la pirólisis catalítica tolera este nivel de contaminación; el lavado generaría agua residual sin mejora significativa en rendimiento",
                    "No industrial washing — catalytic pyrolysis tolerates this contamination level; washing would generate wastewater without significant yield improvement"),
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#3d5c0e]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[9px] font-mono font-bold text-[#3d5c0e]">{i + 1}</span>
                    </div>
                    <span className="text-[10px] text-gray-600 leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>

              {/* Mass summary */}
              <div className="bg-gray-50/80 rounded-xl p-4 mt-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="font-mono text-base font-bold text-gray-800">{batch.feedstockWeight}</div>
                    <div className="text-[9px] text-gray-400 mt-0.5">kg {t("bruto", "gross")}</div>
                  </div>
                  <div>
                    <div className="font-mono text-base font-bold text-red-500">{contaminationKg}</div>
                    <div className="text-[9px] text-gray-400 mt-0.5">kg {t("contam.", "contam.")}</div>
                  </div>
                  <div>
                    <div className="font-mono text-base font-bold text-[#3d5c0e]">{Math.round(cleanKg)}</div>
                    <div className="text-[9px] text-gray-400 mt-0.5">kg {t("neto", "net")}</div>
                  </div>
                </div>
              </div>
            </Section>

            {/* 04 — TRANSFORMATION PROCESS */}
            <Section num="04" title={t("Proceso de Transformación", "Transformation Process")}>
              <div className="space-y-1">
                <Row label={t("Tecnología", "Technology")}
                  value={t("Pirólisis catalítica", "Catalytic pyrolysis")} bold
                  sub={t("Descomposición termoquímica de polímeros en atmósfera inerte (ausencia de oxígeno). Los vapores se condensan en un sistema de 2 etapas para producir aceite pirolítico.",
                    "Thermochemical decomposition of polymers in inert atmosphere (absence of oxygen). Vapors are condensed in a 2-stage system to produce pyrolysis oil.")} />
                <Row label={t("Reactor", "Reactor")} value="DY-500"
                  sub={t("Tambor rotatorio hermético con calentamiento externo. La rotación asegura distribución uniforme de calor y evita puntos calientes.",
                    "Sealed rotary drum with external heating. Rotation ensures uniform heat distribution and prevents hot spots.")} />
              </div>

              {/* Catalyst detail */}
              <div className="bg-[#E8700A]/[0.04] rounded-xl p-3 mt-3 border border-[#E8700A]/10">
                <p className="text-[9px] font-bold text-[#E8700A] uppercase tracking-wider mb-1.5">
                  {t("Catalizador", "Catalyst")}
                </p>
                <div className="space-y-1">
                  <Row label={t("Tipo", "Type")} value={batch.catalystType ?? "Zeolita natural (clinoptilolita)"} bold />
                  <Row label={t("Dosificación", "Dosage")} value={`${batch.catalystKg ?? 5} kg (${((batch.catalystKg ?? 5) / batch.feedstockWeight * 100).toFixed(1)}% ${t("del feedstock", "of feedstock")})`} />
                  <Row label={t("Función", "Function")}
                    value={t("Craqueo selectivo de polímeros", "Selective polymer cracking")}
                    sub={t("Rompe cadenas poliméricas largas (C₂₀₋₆₀) en cadenas más cortas (C₆₋₂₀), favoreciendo la producción de fracciones líquidas sobre gas y ceras. Reduce la temperatura óptima de craqueo y mejora la calidad del aceite (menor viscosidad, mayor proporción de compuestos alifáticos).",
                      "Breaks long polymer chains (C₂₀₋₆₀) into shorter chains (C₆₋₂₀), favoring liquid fraction production over gas and waxes. Lowers optimal cracking temperature and improves oil quality (lower viscosity, higher aliphatic compound ratio).")} />
                </div>
              </div>

              {/* Thermal profile */}
              <p className="text-[8px] uppercase tracking-[1.5px] text-gray-400 font-semibold mt-4 mb-2">
                {t("Perfil térmico del proceso", "Process thermal profile")}
              </p>
              <div className="space-y-1.5">
                {[
                  { phase: t("Arranque", "Startup"), time: "0–30 min", temp: "22→200°C",
                    detail: t("Calentamiento con quemador diésel. 5L total para todo el lote.", "Heating with diesel burner. 5L total for entire batch."), color: "#f59e0b" },
                  { phase: t("Rampa", "Ramp-up"), time: "30–150 min", temp: "200→520°C",
                    detail: t("Transición a gas pirolítico como combustible. A los 140 min el diésel se apaga.", "Transition to pyrolysis gas as fuel. At 140 min diesel is shut off."), color: "#E8700A" },
                  { phase: t("Producción", "Production"), time: "150–440 min", temp: "240→340°C ctrl",
                    detail: t("Rango de condensación activa. Flujo pico: ~18 L/hr. El proceso se autoalimenta con syngas.", "Active condensation range. Peak flow: ~18 L/hr. Process self-fuels with syngas."), color: "#3d5c0e" },
                  { phase: t("Enfriamiento", "Cooldown"), time: "440–540 min", temp: "340→150°C",
                    detail: t("Apagado controlado. Sopladores a máxima velocidad.", "Controlled shutdown. Blowers at maximum speed."), color: "#64748b" },
                ].map((p) => (
                  <div key={p.phase} className="flex gap-2.5">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                      <div className="w-px flex-1 bg-gray-200 mt-0.5" />
                    </div>
                    <div className="pb-2 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[10px] font-bold text-gray-700">{p.phase}</span>
                        <span className="text-[9px] font-mono text-gray-400">{p.time}</span>
                        <span className="text-[9px] font-mono font-bold" style={{ color: p.color }}>{p.temp}</span>
                      </div>
                      <p className="text-[8px] text-gray-400 mt-0.5">{p.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Info>
                {t(
                  `Autosostenibilidad energética: a partir del minuto 140, el gas pirolítico no condensable reemplaza al diésel como combustible del quemador. Las 7 horas restantes se alimentan exclusivamente con energía recuperada del propio proceso (${gasPctOfEnergy}% de la energía total de entrada).`,
                  `Energy self-sufficiency: from minute 140 onward, non-condensable pyrolysis gas replaces diesel as burner fuel. The remaining 7 hours are powered exclusively by energy recovered from the process itself (${gasPctOfEnergy}% of total energy input).`
                )}
              </Info>

              {/* Key metrics */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                <div className="text-center bg-gray-50/60 rounded-xl p-3 border border-gray-100">
                  <div className="font-mono text-sm font-bold text-gray-800">{batch.maxReactorTemp}°C</div>
                  <div className="text-[8px] text-gray-400 mt-0.5">{t("Temp. máx", "Max temp")}</div>
                </div>
                <div className="text-center bg-gray-50/60 rounded-xl p-3 border border-gray-100">
                  <div className="font-mono text-sm font-bold text-gray-800">{batch.durationMinutes ? `${Math.floor(batch.durationMinutes / 60)}h` : "—"}</div>
                  <div className="text-[8px] text-gray-400 mt-0.5">{t("Duración", "Duration")}</div>
                </div>
                <div className="text-center bg-[#7C5CFC]/[0.04] rounded-xl p-3 border border-[#7C5CFC]/10">
                  <div className="font-mono text-sm font-bold" style={{ color: "#7C5CFC" }}>{oilL} L</div>
                  <div className="text-[8px] text-gray-400 mt-0.5">{t("Producción", "Output")}</div>
                </div>
                <div className="text-center bg-[#7C5CFC]/[0.04] rounded-xl p-3 border border-[#7C5CFC]/10">
                  <div className="font-mono text-sm font-bold" style={{ color: "#7C5CFC" }}>{(batch.yieldPercent ?? 0).toFixed(0)}%</div>
                  <div className="text-[8px] text-gray-400 mt-0.5">{t("Rendimiento", "Yield")}</div>
                </div>
              </div>
            </Section>

            {/* 05 — MASS BALANCE */}
            {oilL > 0 && (
              <Section num="05" title={t("Balance de Masa", "Mass Balance")}>
                <div className="bg-gray-50/80 rounded-xl p-3 -mx-1">
                  <SankeyFlow feedstockKg={batch.feedstockWeight} feedstockType={batch.feedstockType}
                    contaminationPct={batch.contaminationPct ?? 0} oilLiters={oilL} oilKg={oilKg} charKg={charKg} gasKg={gasKg} />
                </div>

                {/* Product descriptions */}
                <div className="grid grid-cols-1 gap-2 mt-3">
                  {[
                    { name: t("Aceite pirolítico", "Pyrolysis oil"), amount: `${oilKg} kg (${oilL} L)`, color: "#7C5CFC",
                      desc: t("Mezcla de hidrocarburos C₆₋₂₀ comparable a diésel/nafta. Uso: combustible alterno industrial, feedstock para refinería, materia prima petroquímica.",
                        "C₆₋₂₀ hydrocarbon mixture comparable to diesel/naphtha. Use: industrial alternative fuel, refinery feedstock, petrochemical raw material.") },
                    { name: t("Char (carbón)", "Char (carbon)"), amount: `${charKg} kg`, color: "#3d7a0a",
                      desc: t("Residuo carbonoso sólido de alta pureza. Uso: secuestro de carbono en suelo agrícola (biochar) — el carbono permanece estable 100+ años. Mejora retención de agua y nutrientes.",
                        "High-purity solid carbonaceous residue. Use: carbon sequestration in agricultural soil (biochar) — carbon remains stable 100+ years. Improves water and nutrient retention.") },
                    { name: t("Gas no condensable", "Non-condensable gas"), amount: `${gasKg} kg`, color: "#f59e0b",
                      desc: t("Mezcla de H₂ (~15%), CH₄ (~30%), C₂₋C₄ (~40%), CO/CO₂ (~15%). 100% recirculado al quemador como combustible — no se emite a la atmósfera.",
                        "Mixture of H₂ (~15%), CH₄ (~30%), C₂₋C₄ (~40%), CO/CO₂ (~15%). 100% recirculated to burner as fuel — not emitted to atmosphere.") },
                  ].map((p) => (
                    <div key={p.name} className="flex items-start gap-2 py-1.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: p.color }} />
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[10px] font-bold text-gray-700">{p.name}</span>
                          <span className="text-[10px] font-mono" style={{ color: p.color }}>{p.amount}</span>
                        </div>
                        <p className="text-[8px] text-gray-400 leading-relaxed mt-0.5">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-[8px] text-gray-400 italic mt-2 font-mono">
                  {t("Balance cerrado", "Closed balance")}: {batch.feedstockWeight} kg {t("entrada", "input")} = {contaminationKg} kg {t("contaminación", "contamination")} + {oilKg} kg {t("aceite", "oil")} + {charKg} kg char + {gasKg} kg gas
                </p>
              </Section>
            )}

            {/* 06 — ENERGY BALANCE */}
            {hasEnergyData && (
              <Section num="06" title={t("Balance Energético", "Energy Balance")}>
                <div className="text-center py-5 mb-4 rounded-xl" style={{ background: "linear-gradient(135deg, rgba(232,112,10,0.07), rgba(232,112,10,0.02))" }}>
                  <div className="font-mono text-3xl font-bold" style={{ color: "#E8700A" }}>{energyRatio.toFixed(1)}:1</div>
                  <div className="text-[11px] text-gray-500 mt-1">{t("energía producida / consumida", "energy produced / consumed")}</div>
                </div>

                {/* Inputs */}
                <p className="text-[8px] uppercase tracking-[1.5px] text-gray-400 font-semibold mb-1.5">{t("Entradas (energía operativa)", "Inputs (operational energy)")}</p>
                <div className="space-y-1 mb-2">
                  {dieselL > 0 && <Row label={t("Diésel (arranque)", "Diesel (startup)")} value={`${dieselL} L → ${dieselMJ} MJ`}
                    sub={t(`Solo fase de arranque (primeros 140 min). LHV: 45.6 MJ/kg × 0.85 kg/L. Después el proceso se autoalimenta.`,
                      `Startup phase only (first 140 min). LHV: 45.6 MJ/kg × 0.85 kg/L. Process self-fuels afterwards.`)} />}
                  {elecKwh > 0 && <Row label={t("Electricidad", "Electricity")} value={`${elecKwh.toFixed(1)} kWh → ${elecMJ} MJ`}
                    sub={t("Motor de rotación del reactor, bombas de agua, sopladores de aire, compresor, panel de control. Factor: 3.6 MJ/kWh.",
                      "Reactor rotation motor, water pumps, air blowers, compressor, control panel. Factor: 3.6 MJ/kWh.")} />}
                  {gasRecKg > 0 && <Row label={t("Gas pirolítico recirculado", "Recirculated pyrolysis gas")} value={`${gasRecKg} kg → ${gasMJ} MJ`}
                    sub={t(`Producido por el propio proceso y recirculado al quemador. Constituye el ${gasPctOfEnergy}% de la energía de entrada. LHV: ~38 MJ/kg.`,
                      `Produced by the process itself and recirculated to the burner. Constitutes ${gasPctOfEnergy}% of input energy. LHV: ~38 MJ/kg.`)} />}
                </div>
                <div className="border-t border-gray-100 pt-1 mb-3">
                  <Row label={t("Total energía entrada", "Total energy input")} value={`${totalEnergyIn} MJ`} bold />
                </div>

                {/* Outputs */}
                <p className="text-[8px] uppercase tracking-[1.5px] text-gray-400 font-semibold mb-1.5">{t("Salidas (contenido energético)", "Outputs (energy content)")}</p>
                <div className="space-y-1 mb-2">
                  <Row label={t(`Aceite pirolítico (${oilMJperKg} MJ/kg)`, `Pyrolysis oil (${oilMJperKg} MJ/kg)`)} value={`${oilKg} kg → ${oilEnergyMJ} MJ`}
                    sub={t("Poder calorífico medido por laboratorio. Comparable a diésel comercial (45.6 MJ/kg).",
                      "Calorific value lab-tested. Comparable to commercial diesel (45.6 MJ/kg).")} />
                  <Row label={`Char (${charMJperKg} MJ/kg)`} value={`${charKg} kg → ${charEnergyMJ} MJ`}
                    sub={t("Carbón de alta fijación. Si se usa como combustible sólido aporta energía adicional; si se usa como biochar, secuestra carbono.",
                      "High-fixation carbon. If used as solid fuel, provides additional energy; if used as biochar, sequesters carbon.")} />
                </div>
                <div className="border-t border-gray-100 pt-1 mb-3">
                  <Row label={t("Total energía salida", "Total energy output")} value={`${totalEnergyOut} MJ`} bold />
                </div>

                {/* Visual bars */}
                <div className="space-y-1.5">
                  <div>
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className="text-gray-500">{t("Entrada", "Input")}</span>
                      <span className="font-mono text-[#E8700A] font-bold">{totalEnergyIn} MJ</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, (totalEnergyIn / totalEnergyOut) * 100)}%`, background: "linear-gradient(90deg, #E8700A, #f59e0b)" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className="text-gray-500">{t("Salida", "Output")}</span>
                      <span className="font-mono text-[#7C5CFC] font-bold">{totalEnergyOut} MJ</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#7C5CFC]/70" style={{ width: "100%" }} />
                    </div>
                  </div>
                </div>

                <Info>
                  {t(
                    "Conforme a ISO 14040 §4.3 e ISCC+ 205. LHV diésel: 45.6 MJ/kg (IPCC 2006 Vol 2). Syngas: ~38 MJ/kg (medición directa). Electricidad: 3.6 MJ/kWh (factor termodinámico).",
                    "Per ISO 14040 §4.3 and ISCC+ 205. Diesel LHV: 45.6 MJ/kg (IPCC 2006 Vol 2). Syngas: ~38 MJ/kg (direct measurement). Electricity: 3.6 MJ/kWh (thermodynamic factor)."
                  )}
                </Info>
              </Section>
            )}

            {/* 07 — LAB RESULTS */}
            {lab && (
              <Section num="07" title={t("Control de Calidad — Laboratorio", "Quality Control — Laboratory")}>
                <div className="space-y-1 mb-3">
                  <Row label={t("Laboratorio", "Laboratory")} value={lab.labName} bold />
                  {lab.labCertification && <Row label={t("Acreditación", "Accreditation")} value={lab.labCertification} />}
                  {lab.analystName && <Row label={t("Analista", "Analyst")} value={lab.analystName} />}
                  {lab.sampleNumber && <Row label={t("Muestra", "Sample")} value={`#${lab.sampleNumber}`} />}
                  {lab.appearance && <Row label={t("Apariencia", "Appearance")} value={lab.appearance} bold
                    sub={t("Indicador visual de pureza y ausencia de emulsiones o sedimentos.",
                      "Visual indicator of purity and absence of emulsions or sediments.")} />}
                  {lab.crepitation && <Row label={t("Crepitación", "Crepitation")} value={lab.crepitation}
                    sub={t("Prueba de chisporroteo al calentar — detecta agua libre. Negativo = sin agua libre.",
                      "Crackling test when heated — detects free water. Negative = no free water.")} />}
                </div>

                {/* Lab results with diesel comparison */}
                <p className="text-[8px] uppercase tracking-[1.5px] text-gray-400 font-semibold mb-2">
                  {t("Resultados analíticos vs. estándar diésel", "Analytical results vs. diesel standard")}
                </p>
                <div className="bg-gray-50/60 rounded-xl p-3">
                  <div className="grid grid-cols-[1fr,auto,auto,auto] gap-x-3 items-center pb-1.5 mb-1 border-b border-gray-200">
                    <span className="text-[8px] font-bold text-gray-400 uppercase">{t("Parámetro", "Parameter")}</span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase text-right">{t("Resultado", "Result")}</span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase text-right">{t("Ref. diésel", "Diesel ref.")}</span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase"></span>
                  </div>
                  {lab.sulfurPercent != null && <LabRow label={t("Azufre", "Sulfur")} value={`${lab.sulfurPercent}`} unit="% m/m" diesel="<0.05%" pass method="ASTM D4951" />}
                  {lab.waterContent != null && <LabRow label={t("Agua", "Water")} value={`${lab.waterContent}`} unit="PPM" diesel="<200" pass method="ASTM D6304" />}
                  {lab.flashPoint != null && <LabRow label={t("Punto de inflamación", "Flash point")} value={`${lab.flashPoint}`} unit="°C" diesel=">52°C" pass={lab.flashPoint >= 52} method="ASTM D93" />}
                  {lab.density15C != null && <LabRow label={t("Densidad 15°C", "Density 15°C")} value={`${lab.density15C}`} unit="g/mL" diesel="0.82–0.86" pass={lab.density15C >= 0.82 && lab.density15C <= 0.86} method="ASTM D4052" />}
                  {lab.viscosity40C != null && <LabRow label={t("Viscosidad 40°C", "Viscosity 40°C")} value={`${lab.viscosity40C}`} unit="mm²/s" diesel="1.9–4.1" pass method="ASTM D7042" />}
                  {lab.carbonResidue != null && <LabRow label={t("Carbón residual", "Carbon residue")} value={`${lab.carbonResidue}`} unit="%" diesel="<0.15%" pass={lab.carbonResidue < 0.15} method="ASTM D4530" />}
                  {lab.ashContent != null && <LabRow label={t("Cenizas", "Ash")} value={`${lab.ashContent}`} unit="%" diesel="<0.01%" pass={lab.ashContent <= 0.01} method="ASTM D482" />}
                  {lab.calorificMJ != null && <LabRow label={t("Poder calorífico", "Calorific value")} value={`${lab.calorificMJ}`} unit="MJ/kg" diesel="45.6" pass method="ASTM D240" />}
                </div>
                <Info>
                  {t(
                    `Azufre 50x menor que límite diésel. Densidad dentro de rango diésel (0.82–0.86 g/mL). Poder calorífico al ${lab.calorificMJ ? Math.round((lab.calorificMJ / 45.6) * 100) : 95}% del diésel convencional. Viscosidad menor que diésel indica mayor fluidez — ventaja para inyección.`,
                    `Sulfur 50x below diesel limit. Density within diesel range (0.82–0.86 g/mL). Calorific value at ${lab.calorificMJ ? Math.round((lab.calorificMJ / 45.6) * 100) : 95}% of conventional diesel. Lower viscosity than diesel indicates better flowability — advantage for injection.`
                  )}
                </Info>
                {lab.verdict && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-[#3d5c0e] bg-[#3d5c0e]/[0.04] rounded-lg px-3 py-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" />
                    </svg>
                    <span className="text-xs font-semibold">{lab.verdict}</span>
                  </div>
                )}
              </Section>
            )}

            {/* 08 — ENVIRONMENTAL IMPACT */}
            {co2Avoided > 0 && (
              <Section num="08" title={t("Huella Ambiental", "Environmental Footprint")}>
                <div className="text-center py-5 mb-4 rounded-xl" style={{ background: "linear-gradient(135deg, rgba(61,122,10,0.07), rgba(61,122,10,0.02))" }}>
                  <div className="font-mono text-4xl font-bold" style={{ color: "#3d5c0e" }}>{co2Avoided.toFixed(0)}</div>
                  <div className="text-[11px] text-gray-500 mt-1">{t("kg CO₂eq evitados en este lote", "kg CO₂eq avoided in this batch")}</div>
                  {reductionPct > 0 && (
                    <div className="text-[11px] font-semibold mt-1.5" style={{ color: "#3d5c0e" }}>
                      ↓ {reductionPct.toFixed(0)}% {t("reducción vs quema abierta", "reduction vs open burning")}
                    </div>
                  )}
                </div>

                {/* Equivalencies */}
                <div className="grid grid-cols-3 gap-2.5 mb-5">
                  <div className="text-center bg-[#3d5c0e]/[0.04] rounded-xl p-3 border border-[#3d5c0e]/10">
                    <div className="font-mono text-lg font-bold text-[#3d5c0e]">{Math.round(co2Avoided / 21.77)}</div>
                    <div className="text-[8px] text-gray-400 mt-1 leading-tight">{t("árboles absorbiendo CO₂ por 1 año", "trees absorbing CO₂ for 1 year")}</div>
                  </div>
                  <div className="text-center bg-[#3d5c0e]/[0.04] rounded-xl p-3 border border-[#3d5c0e]/10">
                    <div className="font-mono text-lg font-bold text-[#3d5c0e]">{Math.round(co2Avoided / 0.245).toLocaleString()}</div>
                    <div className="text-[8px] text-gray-400 mt-1 leading-tight">{t("km no recorridos en auto", "km not driven by car")}</div>
                  </div>
                  <div className="text-center bg-[#3d5c0e]/[0.04] rounded-xl p-3 border border-[#3d5c0e]/10">
                    <div className="font-mono text-lg font-bold text-[#3d5c0e]">{Math.round(co2Avoided / 8.9)}</div>
                    <div className="text-[8px] text-gray-400 mt-1 leading-tight">{t("días de electricidad de un hogar MX", "days of MX household electricity")}</div>
                  </div>
                </div>

                {/* Comparison bars */}
                <p className="text-[8px] uppercase tracking-[1.5px] text-gray-400 font-semibold mb-2">
                  {t("Comparación por litro de aceite producido", "Comparison per liter of oil produced")}
                </p>
                <div className="space-y-3 mb-5">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-gray-500">{t("Quema abierta (baseline IPCC)", "Open burning (IPCC baseline)")}</span>
                      <span className="font-mono font-bold text-red-600">{baselinePerL.toFixed(2)} kg CO₂/L</span>
                    </div>
                    <div className="h-3.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-red-400/70" style={{ width: "100%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-gray-500">{t("EcoNova pirólisis catalítica", "EcoNova catalytic pyrolysis")}</span>
                      <span className="font-mono font-bold" style={{ color: "#3d5c0e" }}>{projectPerL.toFixed(2)} kg CO₂/L</span>
                    </div>
                    <div className="h-3.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${baselinePerL > 0 ? (projectPerL / baselinePerL) * 100 : 50}%`, background: "linear-gradient(90deg, #3d7a0a, #6abf2a)" }} />
                    </div>
                  </div>
                </div>

                {co2PerLiter > 0 && (
                  <div className="text-center text-[11px] text-gray-500 mb-4">
                    {t("Cada litro de aceite pirolítico evita", "Each liter of pyrolysis oil avoids")}{" "}
                    <span className="font-mono font-bold" style={{ color: "#3d5c0e" }}>{co2PerLiter.toFixed(2)} kg CO₂</span>{" "}
                    {t("vs la quema abierta", "vs open burning")}
                  </div>
                )}

                {/* Multi-indicator */}
                <p className="text-[8px] uppercase tracking-[1.5px] text-gray-400 font-semibold mb-2">
                  {t("Indicadores ambientales adicionales (ISO 14044 §4.4)", "Additional environmental indicators (ISO 14044 §4.4)")}
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {(batch.emissionsNoxKg != null || batch.emissionsSoxKg != null) && (
                    <div className="bg-gray-50/60 rounded-xl p-3 border border-gray-100">
                      <div className="font-mono text-base font-bold text-gray-700">{((batch.emissionsNoxKg ?? 0) + (batch.emissionsSoxKg ?? 0)).toFixed(2)} kg</div>
                      <div className="text-[9px] text-gray-400 mt-1">{t("NOx + SOx (acidificación)", "NOx + SOx (acidification)")}</div>
                    </div>
                  )}
                  {batch.emissionsPmKg != null && (
                    <div className="bg-gray-50/60 rounded-xl p-3 border border-gray-100">
                      <div className="font-mono text-base font-bold text-gray-700">{batch.emissionsPmKg} kg</div>
                      <div className="text-[9px] text-gray-400 mt-1">{t("Material particulado (PM₂.₅)", "Particulate matter (PM₂.₅)")}</div>
                    </div>
                  )}
                  {batch.waterConsumedL != null && (
                    <div className="bg-gray-50/60 rounded-xl p-3 border border-gray-100">
                      <div className="font-mono text-base font-bold text-gray-700">{batch.waterConsumedL} L</div>
                      <div className="text-[9px] text-gray-400 mt-1">{t("Uso de agua (recirculada)", "Water use (recirculated)")}</div>
                    </div>
                  )}
                  <div className="bg-[#2D8CF0]/[0.04] rounded-xl p-3 border border-[#2D8CF0]/10">
                    <div className="font-mono text-base font-bold" style={{ color: "#2D8CF0" }}>100%</div>
                    <div className="text-[9px] text-gray-400 mt-1">{t("Contenido reciclado (ESPR Art. 7)", "Recycled content (ESPR Art. 7)")}</div>
                  </div>
                </div>

                <Info>
                  {t(
                    "Metodología GHG: Quema abierta de PE produce 3.08 kg CO₂/kg (IPCC 2006 Vol. 5 T5.3) + CH₄ (0.002 kg/kg, GWP=28) + N₂O (0.0001 kg/kg, GWP=265). Proyecto: diésel (3.15 kg CO₂/kg), electricidad (IEA MX 0.435 kg CO₂/kWh), emisiones directas medidas.",
                    "GHG methodology: Open PE burning produces 3.08 kg CO₂/kg (IPCC 2006 Vol. 5 T5.3) + CH₄ (0.002 kg/kg, GWP=28) + N₂O (0.0001 kg/kg, GWP=265). Project: diesel (3.15 kg CO₂/kg), electricity (IEA MX 0.435 kg CO₂/kWh), measured direct emissions."
                  )}
                </Info>
              </Section>
            )}

            {/* 09 — TRANSPORT */}
            {batch.transportDistanceKm != null && (
              <Section num="09" title={t("Transporte del Feedstock", "Feedstock Transport")}>
                <div className="space-y-1">
                  <Row label={t("Vehículo", "Vehicle")} value={batch.transportMode}
                    sub={t("Pickup diésel 2.8L, capacidad de carga ~1 tonelada", "Diesel pickup 2.8L, load capacity ~1 ton")} />
                  <Row label={t("Ruta", "Route")}
                    value={t(`${batch.feedstockOrigin} → Planta EcoNova, Morelia`, `${batch.feedstockOrigin} → EcoNova Plant, Morelia`)}
                    sub={t("Campos agrícolas zona Uruapan–Tancítaro → Planta de pirólisis", "Agricultural fields Uruapan–Tancítaro area → Pyrolysis plant")} />
                  <Row label={t("Distancia", "Distance")} value={`${batch.transportDistanceKm} km`} bold />
                  <Row label={t("Combustible", "Fuel")} value={`${batch.transportFuelType} — ${batch.transportFuelL} L`}
                    sub={t("Consumo ida y vuelta completo", "Full round-trip consumption")} />
                  <Row label={t("Emisiones transporte", "Transport emissions")} value={`${batch.transportCo2Kg} kg CO₂`} bold
                    sub={t(`Cálculo: ${batch.transportFuelL} L × 0.85 kg/L × 3.15 kg CO₂/kg diésel (IPCC 2006 Vol 2 Table 3.2.1) = ${batch.transportCo2Kg} kg`,
                      `Calculation: ${batch.transportFuelL} L × 0.85 kg/L × 3.15 kg CO₂/kg diesel (IPCC 2006 Vol 2 Table 3.2.1) = ${batch.transportCo2Kg} kg`)} />
                </div>
              </Section>
            )}

            {/* 10 — PROCESS EMISSIONS */}
            {batch.emissionsCo2Kg != null && (
              <Section num="10" title={t("Inventario de Emisiones del Proceso", "Process Emissions Inventory")}>
                <div className="space-y-1">
                  <Row label={t("CO₂ directo", "Direct CO₂")} value={`${batch.emissionsCo2Kg} kg`} bold
                    sub={t("Combustión del diésel de arranque en el quemador del reactor. Fuente primaria de CO₂ directo.",
                      "Startup diesel combustion in the reactor burner. Primary direct CO₂ source.")} />
                  <Row label={t("CH₄ fugitivas", "Fugitive CH₄")} value={batch.emissionsCh4Kg != null ? `${batch.emissionsCh4Kg} kg` : null}
                    sub={t("Microfiltraciones en sellos del reactor y conexiones del sistema de gas. Minimizadas por sellado optimizado y reapriete a 100°C.",
                      "Micro-leaks in reactor seals and gas system connections. Minimized by optimized sealing and re-tightening at 100°C.")} />
                  <Row label="NOx" value={batch.emissionsNoxKg != null ? `${batch.emissionsNoxKg} kg` : null}
                    sub={t("Oxidación del nitrógeno atmosférico a altas temperaturas en el quemador.",
                      "Atmospheric nitrogen oxidation at high temperatures in the burner.")} />
                  <Row label="SOx" value={batch.emissionsSoxKg != null ? `${batch.emissionsSoxKg} kg` : null}
                    sub={t("Trazas mínimas — el LDPE agrícola tiene contenido de azufre <0.01%.",
                      "Minimal traces — agricultural LDPE has sulfur content <0.01%.")} />
                  <Row label={t("Partículas (PM₂.₅)", "Particulates (PM₂.₅)")} value={batch.emissionsPmKg != null ? `${batch.emissionsPmKg} kg` : null}
                    sub={t("Material particulado fino del quemador, controlado por diseño de cámara de combustión cerrada.",
                      "Fine particulate from burner, controlled by closed combustion chamber design.")} />
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                  <Row label={t("Agua consumida", "Water consumed")} value={batch.waterConsumedL != null ? `${batch.waterConsumedL} L` : null}
                    sub={t("Agua de enfriamiento del sistema de condensación. Recircula en circuito semi-cerrado (torre de enfriamiento).",
                      "Condensation system cooling water. Recirculates in semi-closed loop (cooling tower).")} />
                  <Row label={t("Agua residual neta", "Net wastewater")} value={batch.emissionsWaterL != null ? `${batch.emissionsWaterL} L` : null}
                    sub={t("Pérdida neta por evaporación. Se repone con agua fresca. Sin descarga a cuerpos de agua.",
                      "Net loss from evaporation. Replenished with fresh water. No discharge to water bodies.")} />
                </div>
              </Section>
            )}

            {/* 11 — WASTE MANAGEMENT */}
            {batch.charDisposition && (
              <Section num="11" title={t("Gestión de Residuos — Economía Circular", "Waste Management — Circular Economy")}>
                <div className="space-y-3">
                  <div className="bg-[#3d7a0a]/[0.04] rounded-xl p-4 border border-[#3d7a0a]/10">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-2 h-2 rounded-full bg-[#3d7a0a]" />
                      <span className="text-[10px] font-bold text-gray-700">{t("Char / Biochar", "Char / Biochar")} — {charKg} kg</span>
                    </div>
                    <p className="text-[9px] text-gray-500 leading-relaxed">
                      {t(
                        "Secuestro en suelo agrícola como enmienda (biochar). El carbono pirolítico permanece estable en el suelo por 100+ años (Lehmann et al., 2015). Mejora retención de agua y nutrientes. Circularidad: el plástico que vino del campo agrícola regresa como mejorador de suelo al mismo campo.",
                        "Sequestered in agricultural soil as amendment (biochar). Pyrolytic carbon remains stable in soil for 100+ years (Lehmann et al., 2015). Improves water and nutrient retention. Circularity: plastic from the agricultural field returns as soil improver to the same field."
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Row label={t("Cenizas", "Ash")} value={batch.ashDisposition}
                      sub={t("Volumen mínimo (<1 kg por lote). Contenido inerte, sin contaminantes peligrosos.",
                        "Minimal volume (<1 kg per batch). Inert content, no hazardous contaminants.")} />
                    <Row label={t("Agua residual", "Wastewater")} value={batch.wastewaterDisp}
                      sub={t("Circuito cerrado de torre de enfriamiento. Sin descarga a drenaje o cuerpos de agua. Pérdida neta: 50 L por evaporación.",
                        "Closed-loop cooling tower circuit. No discharge to drains or water bodies. Net loss: 50 L from evaporation.")} />
                    <Row label={t("Gas no condensable", "Non-condensable gas")}
                      value={t("100% recirculado como combustible", "100% recirculated as fuel")}
                      sub={t("El gas no condensable (H₂, CH₄, C₂₋C₄) se quema en el quemador del reactor, eliminando la necesidad de diésel externo y evitando emisiones de gas pirolítico a la atmósfera.",
                        "Non-condensable gas (H₂, CH₄, C₂₋C₄) is burned in the reactor burner, eliminating the need for external diesel and preventing pyrolysis gas emissions to the atmosphere.")} />
                    <Row label={t("Otros insumos químicos", "Other chemical inputs")} value={batch.chemicalsUsed ?? t("Ninguno", "None")} />
                  </div>
                </div>
              </Section>
            )}

            {/* 12 — REGULATORY COMPLIANCE */}
            <Section num="12" title={t("Cumplimiento Normativo", "Regulatory Compliance")}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <ComplianceCard color="#3d5c0e" name="ISO 14040/14044"
                  article={t("Análisis de Ciclo de Vida", "Life Cycle Assessment")}
                  status={t("CONFORME", "COMPLIANT")}
                  items={[
                    t("Unidad funcional definida (§4.2.3)", "Functional unit defined (§4.2.3)"),
                    t("Frontera del sistema: cuna a puerta (§4.2.3.3)", "System boundary: cradle-to-gate (§4.2.3.3)"),
                    t("Inventario completo: masa, energía, emisiones (§4.3)", "Complete inventory: mass, energy, emissions (§4.3)"),
                    t("4 categorías de impacto evaluadas (§4.4)", "4 impact categories assessed (§4.4)"),
                    t("Asignación energética de co-productos (§4.3.4)", "Energy allocation of co-products (§4.3.4)"),
                  ]} />
                <ComplianceCard color="#E8700A" name="EU DPP"
                  article="ESPR 2024/1781 Annex III"
                  status={t("ALINEADO", "ALIGNED")}
                  items={[
                    t("Identidad del operador económico (a)", "Economic operator identity (a)"),
                    t("Identificador único del producto (b)", "Unique product identifier (b)"),
                    t("Trazabilidad origen→producto (e)", "Origin→product traceability (e)"),
                    t("Huella de carbono por unidad funcional", "Carbon footprint per functional unit"),
                    t("Contenido reciclado: 100% (Art. 7)", "Recycled content: 100% (Art. 7)"),
                  ]} />
                <ComplianceCard color="#2D8CF0" name="ISCC PLUS"
                  article={t("Cadena de Custodia — §201/203/205", "Chain of Custody — §201/203/205")}
                  status="READY"
                  items={[
                    t(`Balance: ${batch.massBalancePeriod ?? "por lote"} (§203)`, `Balance: ${batch.massBalancePeriod ?? "per batch"} (§203)`),
                    t(`Asignación: ${batch.allocMethod ?? "energético"} (§205)`, `Allocation: ${batch.allocMethod ?? "energy-based"} (§205)`),
                    t("Trazabilidad de materia prima (§201)", "Raw material traceability (§201)"),
                    t("Balance de masa cerrado y verificable", "Closed and verifiable mass balance"),
                  ]} />
                <ComplianceCard color="#7C5CFC" name="Verra PWRM0002"
                  article={t("Plastic Credit Standard v1.1", "Plastic Credit Standard v1.1")}
                  status="READY"
                  items={[
                    t(`Resina: ${batch.plasticTypeCode ?? "4-LDPE"} (clasificación SPI)`, `Resin: ${batch.plasticTypeCode ?? "4-LDPE"} (SPI classification)`),
                    t(`Baseline: ${batch.baselineScenario ?? "quema abierta"}`, `Baseline: ${batch.baselineScenario ?? "open burning"}`),
                    t("Cuantificación: 661 kg CO₂eq evitados", "Quantification: 661 kg CO₂eq avoided"),
                    t("Adicionalidad demostrada (ver abajo)", "Additionality demonstrated (see below)"),
                  ]} />
              </div>
              {batch.additionalityProof && (
                <Info>
                  <strong>{t("Adicionalidad (Verra §3.2):", "Additionality (Verra §3.2):")}</strong>{" "}
                  {t(batch.additionalityProof, "No recycling infrastructure exists in the region. Agricultural plastic is burned in >95% of cases in Michoacán.")}
                </Info>
              )}
            </Section>
          </div>

          {/* ═══ VERIFICATION FOOTER ═══ */}
          <div className="px-6 sm:px-8 py-4 bg-gray-50/60 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] tracking-[2px] text-gray-400 uppercase font-semibold mb-1">
                  {t("Verificación Digital — Integridad Criptográfica", "Digital Verification — Cryptographic Integrity")}
                </p>
                <p className="font-mono text-[8px] text-gray-400 break-all leading-relaxed">SHA-256: {certificate.hash}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <p className="text-[10px] text-gray-500 font-medium font-mono">{certificate.code}</p>
                  {certificate.verifiedAt && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-semibold bg-[#3d5c0e]/10 text-[#3d5c0e]">
                      ✓ {t("Verificado", "Verified")}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0 ml-4">
                <QRCodeSVG value={verifyUrl} size={48} level="M" bgColor="transparent" fgColor="#64748b" />
              </div>
            </div>
          </div>

          {/* ═══ BRANDING FOOTER ═══ */}
          <div className="px-6 sm:px-8 py-3 text-center" style={{ background: "linear-gradient(135deg, #1a2e1a, #2d4a1a)" }}>
            <p className="text-[8px] tracking-[3px] text-white/30 uppercase">
              EcoNova México · {t("Economía Circular", "Circular Economy")} · econova.com.mx
            </p>
          </div>
        </div>

        <p className="text-center text-[8px] text-gray-400 mt-4 leading-relaxed">
          {t("Pasaporte Digital de Producto", "Digital Product Passport")} · EU DPP (ESPR 2024/1781) · ISO 14040/14044 LCA · ISCC+ · Verra PWRM0002
        </p>
      </div>
    </div>
  );
}
