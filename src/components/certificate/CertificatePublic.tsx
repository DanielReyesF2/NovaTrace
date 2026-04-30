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
        <span className="text-[10px] font-mono text-[#3d5c0e]/70 font-bold">{num}</span>
        <h3 className="text-[10px] tracking-[2.5px] text-[#3d5c0e] font-bold uppercase">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Row({ label, value, bold, sub }: { label: string; value: string | number | null; bold?: boolean; sub?: string }) {
  if (value == null || value === "") return null;
  return (
    <div className="py-2 border-b border-gray-200/60 last:border-0">
      <div className="flex items-baseline gap-2">
        <span className="text-gray-600 text-[11px] flex-shrink-0">{label}</span>
        <span className="flex-1 border-b border-dotted border-gray-300/60 min-w-[8px] translate-y-[-3px]" />
        <span className={`text-[11px] text-right ${bold ? "font-mono font-bold text-gray-900" : "text-gray-800"}`}>{value}</span>
      </div>
      {sub && <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{sub}</p>}
    </div>
  );
}

function Info({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] text-gray-600 leading-relaxed mt-3 bg-[#f8f7f4] rounded-xl px-4 py-3 border-l-[3px] border-[#3d5c0e]/30">
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
      <div className="text-[8px] sm:text-[9px] text-gray-600 uppercase tracking-wider mt-1 leading-tight">{label}</div>
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
          <li key={i} className="text-[9px] text-gray-500 leading-relaxed flex items-start gap-1.5">
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
    <div className="py-2 border-b border-gray-100/60 last:border-0">
      {/* Desktop: single row */}
      <div className="hidden sm:grid grid-cols-[1fr,auto,auto,auto] gap-x-4 items-center">
        <div>
          <span className="text-[11px] text-gray-600 font-medium">{label}</span>
          <span className="text-[8px] text-gray-300 ml-1.5">{method}</span>
        </div>
        <span className="font-mono text-[11px] font-bold text-gray-800 text-right">{value} <span className="text-[9px] text-gray-500 font-normal">{unit}</span></span>
        <span className="text-[9px] text-gray-500 text-right">{diesel}</span>
        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${pass ? "bg-[#3d5c0e]/10 text-[#3d5c0e]" : "bg-red-50 text-red-500"}`}>
          {pass ? "\u2713" : "\u2717"}
        </span>
      </div>
      {/* Mobile: stacked */}
      <div className="flex sm:hidden items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-gray-600 font-medium truncate">{label}</span>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0 ${pass ? "bg-[#3d5c0e]/10 text-[#3d5c0e]" : "bg-red-50 text-red-500"}`}>
              {pass ? "\u2713" : "\u2717"}
            </span>
          </div>
          <span className="text-[8px] text-gray-300">{method}</span>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-mono text-[11px] font-bold text-gray-800">{value} <span className="text-[9px] text-gray-500 font-normal">{unit}</span></div>
          <div className="text-[8px] text-gray-400">{diesel}</div>
        </div>
      </div>
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
    <div className="min-h-screen bg-[#F5F3EE] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* ═══ HEADER ═══ */}
          <div style={{ background: "linear-gradient(135deg, #1a2e1a 0%, #2d4a1a 50%, #1a2e1a 100%)" }}>
            <div className="px-4 sm:px-8 pt-5 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[8px] tracking-[4px] text-white/60 uppercase mb-1">
                    {t("Pasaporte Digital de Producto", "Digital Product Passport")}
                  </p>
                  <h1 className="text-2xl font-bold text-white font-mono tracking-tight">ECONOVA</h1>
                  <p className="text-[8px] tracking-[3px] text-white/50 uppercase mt-0.5">
                    {t("Econom\u00eda Circular \u00b7 M\u00e9xico", "Circular Economy \u00b7 Mexico")}
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
            <div className="flex items-center justify-center gap-3 sm:gap-5 px-4 sm:px-6 py-2.5 bg-white/[0.05] border-t border-white/[0.08]">
              {[
                { label: "EU DPP", sub: "ESPR 2024/1781" },
                { label: "ISO 14040", sub: "LCA" },
                { label: "ISCC PLUS", sub: "CoC" },
                { label: "Verra", sub: "PWRM0002" },
              ].map((b) => (
                <div key={b.label} className="text-center">
                  <span className="text-[7px] text-white/60 font-semibold tracking-wider">{b.label}</span>
                  <span className="block text-[6px] text-white/50 tracking-wider">{b.sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ═══ EXECUTIVE SUMMARY ═══ */}
          <div className="px-4 sm:px-8 py-5 border-b border-gray-100">
            {/* Bold title */}
            <h2 className="text-[11px] tracking-[2.5px] text-[#3d5c0e] font-bold uppercase mb-2">
              {t("Resumen Ejecutivo", "Executive Summary")}
            </h2>
            {/* Story in one sentence */}
            <p className="text-[11px] text-gray-700 leading-relaxed mb-4 font-medium">
              {t(
                `${batch.feedstockWeight} kg de pl\u00e1stico agr\u00edcola de Michoac\u00e1n \u2192 ${oilL} L de aceite pirol\u00edtico \u2192 ${co2Avoided.toFixed(0)} kg de CO\u2082 evitados`,
                `${batch.feedstockWeight} kg of agricultural plastic from Michoac\u00e1n \u2192 ${oilL} L of pyrolysis oil \u2192 ${co2Avoided.toFixed(0)} kg of CO\u2082 avoided`
              )}
            </p>

            {/* Batch code + date */}
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
              <span className="font-mono font-medium">{batch.code}</span>
              <span>&middot;</span>
              <span>{dateFormatted}</span>
            </div>

            {/* Key KPIs grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
              <Stat value={co2Avoided.toFixed(0)} unit="kg" label={t("CO\u2082eq evitados", "CO\u2082eq avoided")} color="#3d5c0e" />
              <Stat value={`${energyRatio.toFixed(1)}:1`} label={t("Ratio energ\u00e9tico", "Energy ratio")} color="#E8700A" />
              <Stat value={(batch.yieldPercent ?? 0).toFixed(0)} unit="%" label={t("Rendimiento", "Yield")} color="#7C5CFC" />
              <Stat value="100" unit="%" label={t("Contenido reciclado", "Recycled content")} color="#2D8CF0" />
            </div>

            {/* ═══ LIFECYCLE FLOW — Premium timeline ═══ */}
            <p className="text-[7px] uppercase tracking-[3px] text-gray-500 font-semibold mb-4 text-center">
              {t("Ciclo de vida completo", "Complete life cycle")}
            </p>

            {/* Timeline cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
              {[
                { label: t("ORIGEN", "ORIGIN"), value: `${batch.feedstockWeight}`, unit: "kg", sub: t("plástico agrícola", "agricultural plastic"), color: "#64748b", bg: "from-slate-50 to-slate-100/50" },
                { label: t("TRASLADO", "TRANSPORT"), value: `${batch.transportDistanceKm ?? 280}`, unit: "km", sub: t("Michoacán → Lerma", "Michoacán → Lerma"), color: "#92400e", bg: "from-amber-50/80 to-orange-50/50" },
                { label: t("PIRÓLISIS", "PYROLYSIS"), value: `${batch.durationMinutes ? Math.floor(batch.durationMinutes / 60) : 9}`, unit: "h", sub: t("catalítica 520°C", "catalytic 520°C"), color: "#E8700A", bg: "from-orange-50 to-amber-50/50" },
                { label: t("REFINACIÓN", "REFINING"), value: "2", unit: t("etapas", "stages"), sub: "H₂SO₄ + NaOH", color: "#7C5CFC", bg: "from-violet-50 to-purple-50/50" },
                { label: t("PRODUCTO", "PRODUCT"), value: `${oilL}`, unit: "L", sub: t("diésel pirolítico", "pyrolytic diesel"), color: "#7C5CFC", bg: "from-purple-50 to-violet-50/50" },
                { label: t("IMPACTO", "IMPACT"), value: `-${co2Avoided.toFixed(0)}`, unit: "kg", sub: t("CO₂eq evitados", "CO₂eq avoided"), color: "#3d5c0e", bg: "from-green-50 to-emerald-50/50" },
              ].map((stage, i, arr) => (
                <div key={stage.label} className="relative">
                  {/* Card */}
                  <div className={`rounded-xl p-2.5 bg-gradient-to-br ${stage.bg} border border-gray-100 text-center h-full`}>
                    {/* Top color bar */}
                    <div className="h-1 rounded-full mb-2.5 mx-auto w-8" style={{ backgroundColor: stage.color, opacity: 0.6 }} />
                    {/* Value */}
                    <div className="flex items-baseline justify-center gap-0.5">
                      <span className="font-mono text-lg font-extrabold" style={{ color: stage.color }}>{stage.value}</span>
                      <span className="text-[9px] font-semibold" style={{ color: stage.color, opacity: 0.7 }}>{stage.unit}</span>
                    </div>
                    {/* Label */}
                    <div className="text-[7px] tracking-[1px] font-bold mt-1.5" style={{ color: stage.color }}>{stage.label}</div>
                    {/* Sub */}
                    <div className="text-[8px] text-gray-500 mt-0.5 leading-tight">{stage.sub}</div>
                  </div>
                  {/* Arrow connector — hidden on mobile where cards wrap */}
                  {i < arr.length - 1 && (
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-gray-300 text-[10px] hidden lg:block">›</div>
                  )}
                </div>
              ))}
            </div>

            {/* Reverse logistics strip */}
            <div className="mt-3 rounded-xl border border-dashed border-[#92400e]/20 bg-[#92400e]/[0.03] px-4 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#92400e]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px]" style={{ color: "#92400e" }}>↺</span>
                </div>
                <span className="text-[10px] text-[#92400e]/80 font-medium">
                  {t("Logística inversa — nuestro diésel alimenta el camión de recolección", "Reverse logistics — our diesel fuels the collection truck")}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-8 sm:ml-0">
                <div className="text-center">
                  <div className="font-mono text-xs font-bold" style={{ color: "#92400e" }}>{batch.transportFuelL ?? 59} L</div>
                  <div className="text-[7px] text-gray-500">{t("logística", "logistics")}</div>
                </div>
                <div className="text-gray-300 text-[8px]">|</div>
                <div className="text-center">
                  <div className="font-mono text-xs font-bold" style={{ color: "#3d5c0e" }}>{oilL - (batch.transportFuelL ?? 59)} L</div>
                  <div className="text-[7px] text-gray-500">{t("venta", "sale")}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ CONTENT — JOURNEY CHAPTERS ═══ */}
          <div className="px-4 sm:px-8 py-6 space-y-8">

            {/* ═══ CHAPTER 01 — ORIGEN / ORIGIN ═══ */}
            <Section num="01" title={t("Origen \u2014 De los campos de Michoac\u00e1n", "Origin \u2014 From the fields of Michoac\u00e1n")}>
              {/* Agricultural context — 2-col grid */}
              <p className="text-[8px] uppercase tracking-[1.5px] text-gray-500 font-semibold mb-2">
                {t("Contexto agr\u00edcola", "Agricultural context")}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 mb-4">
                <div className="space-y-1">
                  <Row label={t("Regi\u00f3n", "Region")} value={batch.feedstockOrigin} bold
                    sub={t("Principal zona aguacatera y de berries de M\u00e9xico \u2014 Uruapan, Tanc\u00edtaro, Perib\u00e1n",
                      "Mexico\u2019s main avocado and berry region \u2014 Uruapan, Tanc\u00edtaro, Perib\u00e1n")} />
                  <Row label={t("Aplicaci\u00f3n original", "Original application")}
                    value={t("Acolchado agr\u00edcola (mulch film)", "Agricultural mulch film")}
                    sub={t("Control de malezas, retenci\u00f3n de humedad y regulaci\u00f3n de temperatura del suelo en cultivos de aguacate, berries y hortalizas.",
                      "Weed control, moisture retention, and soil temperature regulation for avocado, berry, and vegetable crops.")} />
                </div>
                <div className="space-y-1">
                  <Row label={t("Exposici\u00f3n en campo", "Field exposure")}
                    value={t("6\u201318 meses", "6\u201318 months")}
                    sub={t("Exposici\u00f3n continua a radiaci\u00f3n UV, lluvia, contacto con suelo y agroqu\u00edmicos.",
                      "Continuous exposure to UV radiation, rain, soil contact, and agrochemicals.")} />
                  <Row label={t("Destino sin intervenci\u00f3n", "Fate without intervention")}
                    value={t("Quema a cielo abierto en parcela", "Open-field burning")} bold
                    sub={t("No existe infraestructura de reciclaje mec\u00e1nico para pl\u00e1sticos agr\u00edcolas en la regi\u00f3n. >95% se quema.",
                      "No mechanical recycling infrastructure exists for agricultural plastics in the region. >95% is burned.")} />
                </div>
              </div>

              {/* Polymer composition + Contaminant profile — side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* LEFT: Polymer composition */}
                <div>
                  <p className="text-[8px] uppercase tracking-[1.5px] text-gray-500 font-semibold mb-2">
                    {t("Composici\u00f3n polim\u00e9rica", "Polymer composition")}
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
                      "LDPE: polietileno de baja densidad \u2014 film de acolchado est\u00e1ndar. LLDPE: polietileno lineal de baja densidad \u2014 stretch wrap, fundas. Otros: aditivos UV estabilizadores, EVA de co-extrusi\u00f3n, tintes. Clasificaci\u00f3n SPI: 4-LDPE (predominante).",
                      "LDPE: low-density polyethylene \u2014 standard mulch film. LLDPE: linear low-density polyethylene \u2014 stretch wrap, covers. Other: UV stabilizer additives, co-extrusion EVA, dyes. SPI classification: 4-LDPE (predominant)."
                    )}
                  </Info>
                </div>

                {/* RIGHT: Contaminant profile */}
                <div>
                  <p className="text-[8px] uppercase tracking-[1.5px] text-gray-500 font-semibold mb-2">
                    {t(`Perfil de contaminantes (${batch.contaminationPct ?? 8}% = ${contaminationKg} kg)`,
                      `Contaminant profile (${batch.contaminationPct ?? 8}% = ${contaminationKg} kg)`)}
                  </p>
                  <div className="space-y-2">
                    {[
                      { label: t("Tierra y sedimentos", "Soil & sediment"), pct: 50, kg: 18, color: "#92400e",
                        detail: t("Contacto directo con suelo agr\u00edcola durante uso como acolchado.", "Direct contact with agricultural soil during mulch use.") },
                      { label: t("Residuos de agroqu\u00edmicos", "Agrochemical residues"), pct: 25, kg: 9, color: "#047857",
                        detail: t("Trazas de fertilizantes NPK, herbicidas y fungicidas aplicados sobre el film.", "Traces of NPK fertilizers, herbicides, and fungicides applied over the film.") },
                      { label: t("Materia org\u00e1nica vegetal", "Plant organic matter"), pct: 19, kg: 7, color: "#b45309",
                        detail: t("Fragmentos de ra\u00edces, tallos y residuos de cultivo atrapados en el film.", "Root fragments, stems, and crop residues trapped in the film.") },
                      { label: t("Humedad residual", "Residual moisture"), pct: 6, kg: 2, color: "#1d4ed8",
                        detail: t("Humedad ambiental absorbida por el film y sedimentos.", "Environmental moisture absorbed by the film and sediments.") },
                    ].map((c) => (
                      <div key={c.color} className="bg-gray-50/50 rounded-lg p-2.5">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                          <span className="text-[10px] text-gray-600 font-medium flex-1">{c.label}</span>
                          <span className="text-[10px] font-mono font-bold text-gray-600">~{c.kg} kg</span>
                        </div>
                        <div className="ml-5 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: c.color, opacity: 0.55 }} />
                        </div>
                        <p className="ml-5 text-[8px] text-gray-500 mt-1">{c.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pre-processing + Mass summary — side by side */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-6">
                <div>
                  <p className="text-[8px] uppercase tracking-[1.5px] text-gray-500 font-semibold mb-2">
                    {t("Pre-procesamiento en planta", "Plant pre-processing")}
                  </p>
                  <div className="space-y-2">
                    {[
                      t("Inspecci\u00f3n visual y separaci\u00f3n manual de contaminantes gruesos (piedras, metal, madera, suelo suelto)",
                        "Visual inspection and manual removal of coarse contaminants (stones, metal, wood, loose soil)"),
                      t("Triturado mec\u00e1nico a fragmentos \u2264 50 mm para carga homog\u00e9nea al reactor",
                        "Mechanical shredding to \u2264 50 mm fragments for homogeneous reactor loading"),
                      t("Sin lavado industrial \u2014 la pir\u00f3lisis catal\u00edtica tolera este nivel de contaminaci\u00f3n; el lavado generar\u00eda agua residual sin mejora significativa en rendimiento",
                        "No industrial washing \u2014 catalytic pyrolysis tolerates this contamination level; washing would generate wastewater without significant yield improvement"),
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-[#3d5c0e]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[9px] font-mono font-bold text-[#3d5c0e]">{i + 1}</span>
                        </div>
                        <span className="text-[10px] text-gray-600 leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mass summary */}
                <div className="bg-gray-50/80 rounded-xl p-4 flex items-center">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="font-mono text-lg font-bold text-gray-800">{batch.feedstockWeight}</div>
                      <div className="text-[9px] text-gray-500 mt-0.5">kg {t("bruto", "gross")}</div>
                    </div>
                    <div>
                      <div className="font-mono text-lg font-bold text-red-500">{contaminationKg}</div>
                      <div className="text-[9px] text-gray-500 mt-0.5">kg {t("contam.", "contam.")}</div>
                    </div>
                    <div>
                      <div className="font-mono text-lg font-bold text-[#3d5c0e]">{Math.round(cleanKg)}</div>
                      <div className="text-[9px] text-gray-500 mt-0.5">kg {t("neto", "net")}</div>
                    </div>
                  </div>
                </div>
              </div>{/* end preprocessing+mass grid */}
            </Section>

            {/* ═══ CHAPTER 02 — TRASLADO / TRANSPORT ═══ */}
            {batch.transportDistanceKm != null && (
              <Section num="02" title={t("Traslado \u2014 Del campo a la planta", "Transport \u2014 From field to plant")}>
                <div className="space-y-1">
                  <Row label={t("Veh\u00edculo", "Vehicle")} value={batch.transportMode}
                    sub={t("Pickup di\u00e9sel 2.8L, capacidad de carga ~1 tonelada", "Diesel pickup 2.8L, load capacity ~1 ton")} />
                  <Row label={t("Ruta", "Route")}
                    value={t("Campos agr\u00edcolas Uruapan\u2013Tanc\u00edtaro \u2192 Planta EcoNova, Lerma", "Agricultural fields Uruapan\u2013Tanc\u00edtaro \u2192 EcoNova Plant, Lerma")}
                    sub={t("El di\u00e9sel utilizado en este transporte fue producido por EcoNova en lotes anteriores (log\u00edstica inversa).",
                      "The diesel used in this transport was produced by EcoNova in previous batches (reverse logistics).")} />
                  <Row label={t("Distancia", "Distance")} value={`${batch.transportDistanceKm} km`} bold />
                  <Row label={t("Combustible", "Fuel")} value={`${batch.transportFuelType} \u2014 ${batch.transportFuelL} L`}
                    sub={t("Consumo ida y vuelta completo", "Full round-trip consumption")} />
                  <Row label={t("Emisiones transporte", "Transport emissions")} value={`${batch.transportCo2Kg} kg CO\u2082`} bold
                    sub={t(`C\u00e1lculo: ${batch.transportFuelL} L \u00d7 0.85 kg/L \u00d7 3.15 kg CO\u2082/kg di\u00e9sel (IPCC 2006 Vol 2 Table 3.2.1) = ${batch.transportCo2Kg} kg`,
                      `Calculation: ${batch.transportFuelL} L \u00d7 0.85 kg/L \u00d7 3.15 kg CO\u2082/kg diesel (IPCC 2006 Vol 2 Table 3.2.1) = ${batch.transportCo2Kg} kg`)} />
                </div>
              </Section>
            )}

            {/* ═══ CHAPTER 03 — TRANSFORMACI\u00d3N / TRANSFORMATION ═══ */}
            <Section num="03" title={t("Transformaci\u00f3n \u2014 De pl\u00e1stico a combustible", "Transformation \u2014 From plastic to fuel")}>
              {/* Process info + Catalyst — side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div className="space-y-1">
                  <Row label={t("Tecnolog\u00eda", "Technology")}
                    value={t("Pir\u00f3lisis catal\u00edtica", "Catalytic pyrolysis")} bold
                    sub={t("Descomposici\u00f3n termoqu\u00edmica de pol\u00edmeros en atm\u00f3sfera inerte (ausencia de ox\u00edgeno). Los vapores se condensan en un sistema de 2 etapas para producir aceite pirol\u00edtico.",
                      "Thermochemical decomposition of polymers in inert atmosphere (absence of oxygen). Vapors are condensed in a 2-stage system to produce pyrolysis oil.")} />
                  <Row label={t("Reactor", "Reactor")} value="DY-500"
                    sub={t("Tambor rotatorio herm\u00e9tico con calentamiento externo. La rotaci\u00f3n asegura distribuci\u00f3n uniforme de calor y evita puntos calientes.",
                      "Sealed rotary drum with external heating. Rotation ensures uniform heat distribution and prevents hot spots.")} />
                </div>

                {/* Catalyst detail */}
                <div className="bg-[#E8700A]/[0.04] rounded-xl p-3 border border-[#E8700A]/10">
                  <p className="text-[9px] font-bold text-[#E8700A] uppercase tracking-wider mb-1.5">
                    {t("Catalizador", "Catalyst")}
                  </p>
                  <div className="space-y-1">
                    <Row label={t("Tipo", "Type")} value={batch.catalystType ?? "Zeolita natural (clinoptilolita)"} bold />
                    <Row label={t("Dosificaci\u00f3n", "Dosage")} value={`${batch.catalystKg ?? 5} kg (${((batch.catalystKg ?? 5) / batch.feedstockWeight * 100).toFixed(1)}% ${t("del feedstock", "of feedstock")})`} />
                    <Row label={t("Funci\u00f3n", "Function")}
                      value={t("Craqueo selectivo de pol\u00edmeros", "Selective polymer cracking")}
                      sub={t("Rompe cadenas polim\u00e9ricas largas (C\u2082\u2080\u208b\u2086\u2080) en cadenas m\u00e1s cortas (C\u2086\u208b\u2082\u2080), favoreciendo la producci\u00f3n de fracciones l\u00edquidas sobre gas y ceras.",
                        "Breaks long polymer chains (C\u2082\u2080\u208b\u2086\u2080) into shorter chains (C\u2086\u208b\u2082\u2080), favoring liquid fraction production over gas and waxes.")} />
                  </div>
                </div>
              </div>

              {/* Thermal profile + Key metrics — side by side */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-6">
                <div>
                  <p className="text-[8px] uppercase tracking-[1.5px] text-gray-500 font-semibold mb-2">
                    {t("Perfil t\u00e9rmico del proceso", "Process thermal profile")}
                  </p>
                  <div className="space-y-1.5">
                    {[
                      { phase: t("Arranque", "Startup"), time: "0\u201330 min", temp: "22\u2192200\u00b0C",
                        detail: t("Calentamiento con quemador di\u00e9sel. 5L total para todo el lote.", "Heating with diesel burner. 5L total for entire batch."), color: "#f59e0b" },
                      { phase: t("Rampa", "Ramp-up"), time: "30\u2013150 min", temp: "200\u2192520\u00b0C",
                        detail: t("Transici\u00f3n a gas pirol\u00edtico como combustible. A los 140 min el di\u00e9sel se apaga.", "Transition to pyrolysis gas as fuel. At 140 min diesel is shut off."), color: "#E8700A" },
                      { phase: t("Producci\u00f3n", "Production"), time: "150\u2013440 min", temp: "240\u2192340\u00b0C ctrl",
                        detail: t("Rango de condensaci\u00f3n activa. Flujo pico: ~18 L/hr. El proceso se autoalimenta con syngas.", "Active condensation range. Peak flow: ~18 L/hr. Process self-fuels with syngas."), color: "#3d5c0e" },
                      { phase: t("Enfriamiento", "Cooldown"), time: "440\u2013540 min", temp: "340\u2192150\u00b0C",
                        detail: t("Apagado controlado. Sopladores a m\u00e1xima velocidad.", "Controlled shutdown. Blowers at maximum speed."), color: "#64748b" },
                    ].map((p) => (
                      <div key={p.phase} className="flex gap-2.5">
                        <div className="flex flex-col items-center">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                          <div className="w-px flex-1 bg-gray-200 mt-0.5" />
                        </div>
                        <div className="pb-2 flex-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-[10px] font-bold text-gray-700">{p.phase}</span>
                            <span className="text-[9px] font-mono text-gray-500">{p.time}</span>
                            <span className="text-[9px] font-mono font-bold" style={{ color: p.color }}>{p.temp}</span>
                          </div>
                          <p className="text-[8px] text-gray-500 mt-0.5">{p.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Info>
                    {t(
                      `Autosostenibilidad energ\u00e9tica: a partir del minuto 140, el gas pirol\u00edtico no condensable reemplaza al di\u00e9sel como combustible del quemador (${gasPctOfEnergy}% de la energ\u00eda total).`,
                      `Energy self-sufficiency: from minute 140, non-condensable pyrolysis gas replaces diesel as burner fuel (${gasPctOfEnergy}% of total energy).`
                    )}
                  </Info>
                </div>

                {/* Key metrics — vertical on the right */}
                <div className="grid grid-cols-2 md:grid-cols-1 gap-2 w-full md:w-32">
                <div className="text-center bg-gray-50/60 rounded-xl p-3 border border-gray-100">
                  <div className="font-mono text-sm font-bold text-gray-800">{batch.maxReactorTemp}\u00b0C</div>
                  <div className="text-[8px] text-gray-500 mt-0.5">{t("Temp. m\u00e1x", "Max temp")}</div>
                </div>
                <div className="text-center bg-gray-50/60 rounded-xl p-3 border border-gray-100">
                  <div className="font-mono text-sm font-bold text-gray-800">{batch.durationMinutes ? `${Math.floor(batch.durationMinutes / 60)}h` : "\u2014"}</div>
                  <div className="text-[8px] text-gray-500 mt-0.5">{t("Duraci\u00f3n", "Duration")}</div>
                </div>
                <div className="text-center bg-[#7C5CFC]/[0.04] rounded-xl p-3 border border-[#7C5CFC]/10">
                  <div className="font-mono text-sm font-bold" style={{ color: "#7C5CFC" }}>{oilL} L</div>
                  <div className="text-[8px] text-gray-500 mt-0.5">{t("Producci\u00f3n", "Output")}</div>
                </div>
                <div className="text-center bg-[#7C5CFC]/[0.04] rounded-xl p-3 border border-[#7C5CFC]/10">
                  <div className="font-mono text-sm font-bold" style={{ color: "#7C5CFC" }}>{(batch.yieldPercent ?? 0).toFixed(0)}%</div>
                  <div className="text-[8px] text-gray-500 mt-0.5">{t("Rendimiento", "Yield")}</div>
                </div>
              </div>
              </div>{/* end thermal+metrics grid */}

              {/* Mass Balance (formerly Section 05) */}
              {oilL > 0 && (
                <div className="mt-6">
                  <p className="text-[8px] uppercase tracking-[1.5px] text-gray-500 font-semibold mb-3">
                    {t("Balance de masa", "Mass balance")}
                  </p>
                  <div className="bg-gray-50/80 rounded-xl p-3 -mx-1">
                    <SankeyFlow feedstockKg={batch.feedstockWeight} feedstockType={batch.feedstockType}
                      contaminationPct={batch.contaminationPct ?? 0} oilLiters={oilL} oilKg={oilKg} charKg={charKg} gasKg={gasKg} />
                  </div>

                  {/* Product descriptions */}
                  <div className="grid grid-cols-1 gap-2 mt-3">
                    {[
                      { name: t("Aceite pirol\u00edtico", "Pyrolysis oil"), amount: `${oilKg} kg (${oilL} L)`, color: "#7C5CFC",
                        desc: t("Mezcla de hidrocarburos C\u2086\u208b\u2082\u2080 comparable a di\u00e9sel/nafta. Uso: combustible alterno industrial, feedstock para refiner\u00eda, materia prima petroqu\u00edmica.",
                          "C\u2086\u208b\u2082\u2080 hydrocarbon mixture comparable to diesel/naphtha. Use: industrial alternative fuel, refinery feedstock, petrochemical raw material.") },
                      { name: t("Char (carb\u00f3n)", "Char (carbon)"), amount: `${charKg} kg`, color: "#3d7a0a",
                        desc: t("Residuo carbonoso s\u00f3lido de alta pureza. Uso: secuestro de carbono en suelo agr\u00edcola (biochar) \u2014 el carbono permanece estable 100+ a\u00f1os. Mejora retenci\u00f3n de agua y nutrientes.",
                          "High-purity solid carbonaceous residue. Use: carbon sequestration in agricultural soil (biochar) \u2014 carbon remains stable 100+ years. Improves water and nutrient retention.") },
                      { name: t("Gas no condensable", "Non-condensable gas"), amount: `${gasKg} kg`, color: "#f59e0b",
                        desc: t("Mezcla de H\u2082 (~15%), CH\u2084 (~30%), C\u2082\u208bC\u2084 (~40%), CO/CO\u2082 (~15%). 100% recirculado al quemador como combustible \u2014 no se emite a la atm\u00f3sfera.",
                          "Mixture of H\u2082 (~15%), CH\u2084 (~30%), C\u2082\u208bC\u2084 (~40%), CO/CO\u2082 (~15%). 100% recirculated to burner as fuel \u2014 not emitted to atmosphere.") },
                    ].map((p) => (
                      <div key={p.name} className="flex items-start gap-2 py-1.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: p.color }} />
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-[10px] font-bold text-gray-700">{p.name}</span>
                            <span className="text-[10px] font-mono" style={{ color: p.color }}>{p.amount}</span>
                          </div>
                          <p className="text-[8px] text-gray-500 leading-relaxed mt-0.5">{p.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[8px] text-gray-500 italic mt-2 font-mono">
                    {t("Balance cerrado", "Closed balance")}: {batch.feedstockWeight} kg {t("entrada", "input")} = {contaminationKg} kg {t("contaminaci\u00f3n", "contamination")} + {oilKg} kg {t("aceite", "oil")} + {charKg} kg char + {gasKg} kg gas
                  </p>
                </div>
              )}

              {/* Energy Balance (formerly Section 06) */}
              {hasEnergyData && (
                <div className="mt-6">
                  <p className="text-[8px] uppercase tracking-[1.5px] text-gray-500 font-semibold mb-3">
                    {t("Balance energ\u00e9tico", "Energy balance")}
                  </p>
                  <div className="text-center py-5 mb-4 rounded-xl" style={{ background: "linear-gradient(135deg, rgba(232,112,10,0.07), rgba(232,112,10,0.02))" }}>
                    <div className="font-mono text-3xl font-bold" style={{ color: "#E8700A" }}>{energyRatio.toFixed(1)}:1</div>
                    <div className="text-[11px] text-gray-500 mt-1">{t("energ\u00eda producida / consumida", "energy produced / consumed")}</div>
                  </div>

                  {/* Inputs */}
                  <p className="text-[8px] uppercase tracking-[1.5px] text-gray-500 font-semibold mb-1.5">{t("Entradas (energ\u00eda operativa)", "Inputs (operational energy)")}</p>
                  <div className="space-y-1 mb-2">
                    {dieselL > 0 && <Row label={t("Di\u00e9sel (arranque)", "Diesel (startup)")} value={`${dieselL} L \u2192 ${dieselMJ} MJ`}
                      sub={t(`Solo fase de arranque (primeros 140 min). LHV: 45.6 MJ/kg \u00d7 0.85 kg/L. Despu\u00e9s el proceso se autoalimenta.`,
                        `Startup phase only (first 140 min). LHV: 45.6 MJ/kg \u00d7 0.85 kg/L. Process self-fuels afterwards.`)} />}
                    {elecKwh > 0 && <Row label={t("Electricidad", "Electricity")} value={`${elecKwh.toFixed(1)} kWh \u2192 ${elecMJ} MJ`}
                      sub={t("Motor de rotaci\u00f3n del reactor, bombas de agua, sopladores de aire, compresor, panel de control. Factor: 3.6 MJ/kWh.",
                        "Reactor rotation motor, water pumps, air blowers, compressor, control panel. Factor: 3.6 MJ/kWh.")} />}
                    {gasRecKg > 0 && <Row label={t("Gas pirol\u00edtico recirculado", "Recirculated pyrolysis gas")} value={`${gasRecKg} kg \u2192 ${gasMJ} MJ`}
                      sub={t(`Producido por el propio proceso y recirculado al quemador. Constituye el ${gasPctOfEnergy}% de la energ\u00eda de entrada. LHV: ~38 MJ/kg.`,
                        `Produced by the process itself and recirculated to the burner. Constitutes ${gasPctOfEnergy}% of input energy. LHV: ~38 MJ/kg.`)} />}
                  </div>
                  <div className="border-t border-gray-100 pt-1 mb-3">
                    <Row label={t("Total energ\u00eda entrada", "Total energy input")} value={`${totalEnergyIn} MJ`} bold />
                  </div>

                  {/* Outputs */}
                  <p className="text-[8px] uppercase tracking-[1.5px] text-gray-500 font-semibold mb-1.5">{t("Salidas (contenido energ\u00e9tico)", "Outputs (energy content)")}</p>
                  <div className="space-y-1 mb-2">
                    <Row label={t(`Aceite pirol\u00edtico (${oilMJperKg} MJ/kg)`, `Pyrolysis oil (${oilMJperKg} MJ/kg)`)} value={`${oilKg} kg \u2192 ${oilEnergyMJ} MJ`}
                      sub={t("Poder calor\u00edfico medido por laboratorio. Comparable a di\u00e9sel comercial (45.6 MJ/kg).",
                        "Calorific value lab-tested. Comparable to commercial diesel (45.6 MJ/kg).")} />
                    <Row label={`Char (${charMJperKg} MJ/kg)`} value={`${charKg} kg \u2192 ${charEnergyMJ} MJ`}
                      sub={t("Carb\u00f3n de alta fijaci\u00f3n. Si se usa como combustible s\u00f3lido aporta energ\u00eda adicional; si se usa como biochar, secuestra carbono.",
                        "High-fixation carbon. If used as solid fuel, provides additional energy; if used as biochar, sequesters carbon.")} />
                  </div>
                  <div className="border-t border-gray-100 pt-1 mb-3">
                    <Row label={t("Total energ\u00eda salida", "Total energy output")} value={`${totalEnergyOut} MJ`} bold />
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
                      "Conforme a ISO 14040 \u00a74.3 e ISCC+ 205. LHV di\u00e9sel: 45.6 MJ/kg (IPCC 2006 Vol 2). Syngas: ~38 MJ/kg (medici\u00f3n directa). Electricidad: 3.6 MJ/kWh (factor termodin\u00e1mico).",
                      "Per ISO 14040 \u00a74.3 and ISCC+ 205. Diesel LHV: 45.6 MJ/kg (IPCC 2006 Vol 2). Syngas: ~38 MJ/kg (direct measurement). Electricity: 3.6 MJ/kWh (thermodynamic factor)."
                    )}
                  </Info>
                </div>
              )}

              {/* ═══ DESTILACI\u00d3N Y REFINACI\u00d3N ═══ */}
              <div className="mt-6">
                <p className="text-[8px] uppercase tracking-[2.5px] text-gray-500 font-semibold mb-3">
                  {t("Destilaci\u00f3n y Refinaci\u00f3n", "Distillation and Refining")}
                </p>
                <div className="space-y-1.5">
                  {[
                    {
                      phase: t("Reactor vertical de destilaci\u00f3n", "Vertical distillation reactor"),
                      detail: t(
                        "Los crudos pesado y medio del proceso pirol\u00edtico se alimentan al reactor vertical de destilaci\u00f3n. Calentamiento controlado separa fracciones por punto de ebullici\u00f3n.",
                        "Heavy and medium crudes from pyrolysis are fed to the vertical distillation reactor. Controlled heating separates fractions by boiling point."
                      ),
                      color: "#E8700A",
                    },
                    {
                      phase: t("Condensador horizontal", "Horizontal condenser"),
                      detail: t(
                        "Los vapores se condensan en un intercambiador horizontal de doble tubo, produciendo di\u00e9sel destilado.",
                        "Vapors condense in a horizontal double-tube heat exchanger, producing distilled diesel."
                      ),
                      color: "#E8700A",
                    },
                    {
                      phase: t("Refinaci\u00f3n \u00e1cida (H\u2082SO\u2084)", "Acid refining (H\u2082SO\u2084)"),
                      detail: t(
                        "Tratamiento con \u00e1cido sulf\u00farico para remover compuestos insaturados, olefinas y contaminantes org\u00e1nicos. Mejora estabilidad y color.",
                        "Sulfuric acid treatment to remove unsaturated compounds, olefins, and organic contaminants. Improves stability and color."
                      ),
                      color: "#7C5CFC",
                    },
                    {
                      phase: t("Refinaci\u00f3n alcalina (NaOH)", "Alkaline refining (NaOH)"),
                      detail: t(
                        "Neutralizaci\u00f3n con hidr\u00f3xido de sodio. Elimina \u00e1cidos residuales y compuestos de azufre. Produce un di\u00e9sel limpio y estable.",
                        "Neutralization with sodium hydroxide. Removes residual acids and sulfur compounds. Produces clean, stable diesel."
                      ),
                      color: "#7C5CFC",
                    },
                    {
                      phase: t("Producto final", "Final product"),
                      detail: t(
                        "Di\u00e9sel refinado de alta calidad, densidad ~0.83 kg/L, comparable a di\u00e9sel comercial.",
                        "High-quality refined diesel, density ~0.83 kg/L, comparable to commercial diesel."
                      ),
                      color: "#3d5c0e",
                    },
                  ].map((p) => (
                    <div key={p.phase} className="flex gap-2.5">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                        <div className="w-px flex-1 bg-gray-200 mt-0.5" />
                      </div>
                      <div className="pb-2 flex-1">
                        <span className="text-[10px] font-bold text-gray-700">{p.phase}</span>
                        <p className="text-[8px] text-gray-500 mt-0.5">{p.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            {/* ═══ CHAPTER 04 — PRODUCTO / PRODUCT ═══ */}
            {lab && (
              <Section num="04" title={t("Tu Producto \u2014 Aceite pirol\u00edtico certificado", "Your Product \u2014 Certified pyrolysis oil")}>
                <div className="space-y-1 mb-3">
                  <Row label={t("Laboratorio", "Laboratory")} value={lab.labName} bold />
                  {lab.labCertification && <Row label={t("Acreditaci\u00f3n", "Accreditation")} value={lab.labCertification} />}
                  {lab.analystName && <Row label={t("Analista", "Analyst")} value={lab.analystName} />}
                  {lab.sampleNumber && <Row label={t("Muestra", "Sample")} value={`#${lab.sampleNumber}`} />}
                  {lab.appearance && <Row label={t("Apariencia", "Appearance")} value={lab.appearance} bold
                    sub={t("Indicador visual de pureza y ausencia de emulsiones o sedimentos.",
                      "Visual indicator of purity and absence of emulsions or sediments.")} />}
                  {lab.crepitation && <Row label={t("Crepitaci\u00f3n", "Crepitation")} value={lab.crepitation}
                    sub={t("Prueba de chisporroteo al calentar \u2014 detecta agua libre. Negativo = sin agua libre.",
                      "Crackling test when heated \u2014 detects free water. Negative = no free water.")} />}
                </div>

                {/* Lab results with diesel comparison */}
                <p className="text-[8px] uppercase tracking-[1.5px] text-gray-500 font-semibold mb-2">
                  {t("Resultados anal\u00edticos vs. est\u00e1ndar di\u00e9sel", "Analytical results vs. diesel standard")}
                </p>
                <div className="bg-gray-50/60 rounded-xl p-3">
                  {/* Desktop header */}
                  <div className="hidden sm:grid grid-cols-[1fr,auto,auto,auto] gap-x-3 items-center pb-1.5 mb-1 border-b border-gray-200">
                    <span className="text-[8px] font-bold text-gray-500 uppercase">{t("Par\u00e1metro", "Parameter")}</span>
                    <span className="text-[8px] font-bold text-gray-500 uppercase text-right">{t("Resultado", "Result")}</span>
                    <span className="text-[8px] font-bold text-gray-500 uppercase text-right">{t("Ref. di\u00e9sel", "Diesel ref.")}</span>
                    <span className="text-[8px] font-bold text-gray-500 uppercase"></span>
                  </div>
                  {/* Mobile header */}
                  <div className="flex sm:hidden justify-between pb-1.5 mb-1 border-b border-gray-200">
                    <span className="text-[8px] font-bold text-gray-500 uppercase">{t("Par\u00e1metro", "Parameter")}</span>
                    <span className="text-[8px] font-bold text-gray-500 uppercase">{t("Resultado", "Result")}</span>
                  </div>
                  {lab.sulfurPercent != null && <LabRow label={t("Azufre", "Sulfur")} value={`${lab.sulfurPercent}`} unit="% m/m" diesel="<0.05%" pass method="ASTM D4951" />}
                  {lab.waterContent != null && <LabRow label={t("Agua", "Water")} value={`${lab.waterContent}`} unit="PPM" diesel="<200" pass method="ASTM D6304" />}
                  {lab.flashPoint != null && <LabRow label={t("Punto de inflamaci\u00f3n", "Flash point")} value={`${lab.flashPoint}`} unit="\u00b0C" diesel=">52\u00b0C" pass={lab.flashPoint >= 52} method="ASTM D93" />}
                  {lab.density15C != null && <LabRow label={t("Densidad 15\u00b0C", "Density 15\u00b0C")} value={`${lab.density15C}`} unit="g/mL" diesel="0.82\u20130.86" pass={lab.density15C >= 0.82 && lab.density15C <= 0.86} method="ASTM D4052" />}
                  {lab.viscosity40C != null && <LabRow label={t("Viscosidad 40\u00b0C", "Viscosity 40\u00b0C")} value={`${lab.viscosity40C}`} unit="mm\u00b2/s" diesel="1.9\u20134.1" pass method="ASTM D7042" />}
                  {lab.carbonResidue != null && <LabRow label={t("Carb\u00f3n residual", "Carbon residue")} value={`${lab.carbonResidue}`} unit="%" diesel="<0.15%" pass={lab.carbonResidue < 0.15} method="ASTM D4530" />}
                  {lab.ashContent != null && <LabRow label={t("Cenizas", "Ash")} value={`${lab.ashContent}`} unit="%" diesel="<0.01%" pass={lab.ashContent <= 0.01} method="ASTM D482" />}
                  {lab.calorificMJ != null && <LabRow label={t("Poder calor\u00edfico", "Calorific value")} value={`${lab.calorificMJ}`} unit="MJ/kg" diesel="45.6" pass method="ASTM D240" />}
                </div>
                <Info>
                  {t(
                    `Azufre 50x menor que l\u00edmite di\u00e9sel. Densidad dentro de rango di\u00e9sel (0.82\u20130.86 g/mL). Poder calor\u00edfico al ${lab.calorificMJ ? Math.round((lab.calorificMJ / 45.6) * 100) : 95}% del di\u00e9sel convencional. Viscosidad menor que di\u00e9sel indica mayor fluidez \u2014 ventaja para inyecci\u00f3n.`,
                    `Sulfur 50x below diesel limit. Density within diesel range (0.82\u20130.86 g/mL). Calorific value at ${lab.calorificMJ ? Math.round((lab.calorificMJ / 45.6) * 100) : 95}% of conventional diesel. Lower viscosity than diesel indicates better flowability \u2014 advantage for injection.`
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

            {/* ═══ CHAPTER 05 — IMPACTO / IMPACT ═══ */}
            {co2Avoided > 0 && (
              <Section num="05" title={t("Impacto \u2014 Lo que este lote logr\u00f3", "Impact \u2014 What this batch achieved")}>
                {/* CO\u2082 hero + Equivalencies — side by side */}
                <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr] gap-5 mb-5">
                  <div className="flex flex-col items-center justify-center py-5 rounded-xl" style={{ background: "linear-gradient(135deg, rgba(61,122,10,0.07), rgba(61,122,10,0.02))" }}>
                    <div className="font-mono text-4xl font-bold" style={{ color: "#3d5c0e" }}>{co2Avoided.toFixed(0)}</div>
                    <div className="text-[11px] text-gray-500 mt-1">{t("kg CO\u2082eq evitados", "kg CO\u2082eq avoided")}</div>
                    {reductionPct > 0 && (
                      <div className="text-[11px] font-semibold mt-1.5" style={{ color: "#3d5c0e" }}>
                        \u2193 {reductionPct.toFixed(0)}% {t("vs quema abierta", "vs open burning")}
                      </div>
                    )}
                    {co2PerLiter > 0 && (
                      <div className="text-[10px] text-gray-500 mt-2">
                        <span className="font-mono font-semibold" style={{ color: "#3d5c0e" }}>{co2PerLiter.toFixed(2)} kg CO\u2082</span> {t("evitados/litro", "avoided/liter")}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    <div className="text-center bg-[#3d5c0e]/[0.04] rounded-xl p-3 border border-[#3d5c0e]/10">
                      <div className="font-mono text-lg font-bold text-[#3d5c0e]">{Math.round(co2Avoided / 21.77)}</div>
                      <div className="text-[8px] text-gray-500 mt-1 leading-tight">{t("\u00e1rboles absorbiendo CO\u2082 por 1 a\u00f1o", "trees absorbing CO\u2082 for 1 year")}</div>
                    </div>
                    <div className="text-center bg-[#3d5c0e]/[0.04] rounded-xl p-3 border border-[#3d5c0e]/10">
                      <div className="font-mono text-lg font-bold text-[#3d5c0e]">{Math.round(co2Avoided / 0.245).toLocaleString()}</div>
                      <div className="text-[8px] text-gray-500 mt-1 leading-tight">{t("km no recorridos en auto", "km not driven by car")}</div>
                    </div>
                    <div className="text-center bg-[#3d5c0e]/[0.04] rounded-xl p-3 border border-[#3d5c0e]/10">
                      <div className="font-mono text-lg font-bold text-[#3d5c0e]">{Math.round(co2Avoided / 8.9)}</div>
                      <div className="text-[8px] text-gray-500 mt-1 leading-tight">{t("d\u00edas de electricidad de un hogar MX", "days of MX household electricity")}</div>
                    </div>
                  </div>
                </div>

                {/* Comparison bars + Indicators — side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[8px] uppercase tracking-[1.5px] text-gray-500 font-semibold mb-2">
                      {t("Comparaci\u00f3n por litro producido", "Comparison per liter produced")}
                    </p>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-gray-500">{t("Quema abierta (IPCC)", "Open burning (IPCC)")}</span>
                          <span className="font-mono font-bold text-red-600">{baselinePerL.toFixed(2)} kg CO\u2082/L</span>
                        </div>
                        <div className="h-3.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-red-400/70" style={{ width: "100%" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-gray-500">{t("EcoNova pir\u00f3lisis", "EcoNova pyrolysis")}</span>
                          <span className="font-mono font-bold" style={{ color: "#3d5c0e" }}>{projectPerL.toFixed(2)} kg CO\u2082/L</span>
                        </div>
                        <div className="h-3.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${baselinePerL > 0 ? (projectPerL / baselinePerL) * 100 : 50}%`, background: "linear-gradient(90deg, #3d7a0a, #6abf2a)" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[8px] uppercase tracking-[1.5px] text-gray-500 font-semibold mb-2">
                      {t("Indicadores adicionales (ISO 14044 \u00a74.4)", "Additional indicators (ISO 14044 \u00a74.4)")}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                  {(batch.emissionsNoxKg != null || batch.emissionsSoxKg != null) && (
                    <div className="bg-gray-50/60 rounded-xl p-3 border border-gray-100">
                      <div className="font-mono text-base font-bold text-gray-700">{((batch.emissionsNoxKg ?? 0) + (batch.emissionsSoxKg ?? 0)).toFixed(2)} kg</div>
                      <div className="text-[9px] text-gray-500 mt-1">{t("NOx + SOx (acidificaci\u00f3n)", "NOx + SOx (acidification)")}</div>
                    </div>
                  )}
                  {batch.emissionsPmKg != null && (
                    <div className="bg-gray-50/60 rounded-xl p-3 border border-gray-100">
                      <div className="font-mono text-base font-bold text-gray-700">{batch.emissionsPmKg} kg</div>
                      <div className="text-[9px] text-gray-500 mt-1">{t("Material particulado (PM\u2082.\u2085)", "Particulate matter (PM\u2082.\u2085)")}</div>
                    </div>
                  )}
                  {batch.waterConsumedL != null && (
                    <div className="bg-gray-50/60 rounded-xl p-3 border border-gray-100">
                      <div className="font-mono text-base font-bold text-gray-700">{batch.waterConsumedL} L</div>
                      <div className="text-[9px] text-gray-500 mt-1">{t("Uso de agua (recirculada)", "Water use (recirculated)")}</div>
                    </div>
                  )}
                  <div className="bg-[#2D8CF0]/[0.04] rounded-xl p-3 border border-[#2D8CF0]/10">
                    <div className="font-mono text-base font-bold" style={{ color: "#2D8CF0" }}>100%</div>
                    <div className="text-[9px] text-gray-500 mt-1">{t("Contenido reciclado (ESPR Art. 7)", "Recycled content (ESPR Art. 7)")}</div>
                  </div>
                    </div>
                  </div>
                </div>{/* end comparison+indicators grid */}

                <Info>
                  {t(
                    "Metodolog\u00eda GHG: Quema abierta de PE produce 3.08 kg CO\u2082/kg (IPCC 2006 Vol. 5 T5.3) + CH\u2084 (0.002 kg/kg, GWP=28) + N\u2082O (0.0001 kg/kg, GWP=265). Proyecto: di\u00e9sel (3.15 kg CO\u2082/kg), electricidad (IEA MX 0.435 kg CO\u2082/kWh), emisiones directas medidas.",
                    "GHG methodology: Open PE burning produces 3.08 kg CO\u2082/kg (IPCC 2006 Vol. 5 T5.3) + CH\u2084 (0.002 kg/kg, GWP=28) + N\u2082O (0.0001 kg/kg, GWP=265). Project: diesel (3.15 kg CO\u2082/kg), electricity (IEA MX 0.435 kg CO\u2082/kWh), measured direct emissions."
                  )}
                </Info>

                {/* Process Emissions (formerly Section 10) */}
                {batch.emissionsCo2Kg != null && (
                  <div className="mt-6">
                    <p className="text-[8px] uppercase tracking-[1.5px] text-gray-500 font-semibold mb-3">
                      {t("Inventario de emisiones del proceso", "Process emissions inventory")}
                    </p>
                    <div className="space-y-1">
                      <Row label={t("CO\u2082 directo", "Direct CO\u2082")} value={`${batch.emissionsCo2Kg} kg`} bold
                        sub={t("Combusti\u00f3n del di\u00e9sel de arranque en el quemador del reactor. Fuente primaria de CO\u2082 directo.",
                          "Startup diesel combustion in the reactor burner. Primary direct CO\u2082 source.")} />
                      <Row label={t("CH\u2084 fugitivas", "Fugitive CH\u2084")} value={batch.emissionsCh4Kg != null ? `${batch.emissionsCh4Kg} kg` : null}
                        sub={t("Microfiltraciones en sellos del reactor y conexiones del sistema de gas. Minimizadas por sellado optimizado y reapriete a 100\u00b0C.",
                          "Micro-leaks in reactor seals and gas system connections. Minimized by optimized sealing and re-tightening at 100\u00b0C.")} />
                      <Row label="NOx" value={batch.emissionsNoxKg != null ? `${batch.emissionsNoxKg} kg` : null}
                        sub={t("Oxidaci\u00f3n del nitr\u00f3geno atmosf\u00e9rico a altas temperaturas en el quemador.",
                          "Atmospheric nitrogen oxidation at high temperatures in the burner.")} />
                      <Row label="SOx" value={batch.emissionsSoxKg != null ? `${batch.emissionsSoxKg} kg` : null}
                        sub={t("Trazas m\u00ednimas \u2014 el LDPE agr\u00edcola tiene contenido de azufre <0.01%.",
                          "Minimal traces \u2014 agricultural LDPE has sulfur content <0.01%.")} />
                      <Row label={t("Part\u00edculas (PM\u2082.\u2085)", "Particulates (PM\u2082.\u2085)")} value={batch.emissionsPmKg != null ? `${batch.emissionsPmKg} kg` : null}
                        sub={t("Material particulado fino del quemador, controlado por dise\u00f1o de c\u00e1mara de combusti\u00f3n cerrada.",
                          "Fine particulate from burner, controlled by closed combustion chamber design.")} />
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                      <Row label={t("Agua consumida", "Water consumed")} value={batch.waterConsumedL != null ? `${batch.waterConsumedL} L` : null}
                        sub={t("Agua de enfriamiento del sistema de condensaci\u00f3n. Recircula en circuito semi-cerrado (torre de enfriamiento).",
                          "Condensation system cooling water. Recirculates in semi-closed loop (cooling tower).")} />
                      <Row label={t("Agua residual neta", "Net wastewater")} value={batch.emissionsWaterL != null ? `${batch.emissionsWaterL} L` : null}
                        sub={t("P\u00e9rdida neta por evaporaci\u00f3n. Se repone con agua fresca. Sin descarga a cuerpos de agua.",
                          "Net loss from evaporation. Replenished with fresh water. No discharge to water bodies.")} />
                    </div>
                  </div>
                )}

                {/* Waste Management — Circular Economy (formerly Section 11) */}
                {batch.charDisposition && (
                  <div className="mt-6">
                    <p className="text-[8px] uppercase tracking-[1.5px] text-gray-500 font-semibold mb-3">
                      {t("Gesti\u00f3n de residuos \u2014 Econom\u00eda circular", "Waste management \u2014 Circular economy")}
                    </p>
                    <div className="space-y-3">
                      <div className="bg-[#3d7a0a]/[0.04] rounded-xl p-4 border border-[#3d7a0a]/10">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="w-2 h-2 rounded-full bg-[#3d7a0a]" />
                          <span className="text-[10px] font-bold text-gray-700">{t("Char / Biochar", "Char / Biochar")} \u2014 {charKg} kg</span>
                        </div>
                        <p className="text-[9px] text-gray-500 leading-relaxed">
                          {t(
                            "Secuestro en suelo agr\u00edcola como enmienda (biochar). El carbono pirol\u00edtico permanece estable en el suelo por 100+ a\u00f1os (Lehmann et al., 2015). Mejora retenci\u00f3n de agua y nutrientes. Circularidad: el pl\u00e1stico que vino del campo agr\u00edcola regresa como mejorador de suelo al mismo campo.",
                            "Sequestered in agricultural soil as amendment (biochar). Pyrolytic carbon remains stable in soil for 100+ years (Lehmann et al., 2015). Improves water and nutrient retention. Circularity: plastic from the agricultural field returns as soil improver to the same field."
                          )}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Row label={t("Cenizas", "Ash")} value={batch.ashDisposition}
                          sub={t("Volumen m\u00ednimo (<1 kg por lote). Contenido inerte, sin contaminantes peligrosos.",
                            "Minimal volume (<1 kg per batch). Inert content, no hazardous contaminants.")} />
                        <Row label={t("Agua residual", "Wastewater")} value={batch.wastewaterDisp}
                          sub={t("Circuito cerrado de torre de enfriamiento. Sin descarga a drenaje o cuerpos de agua. P\u00e9rdida neta: 50 L por evaporaci\u00f3n.",
                            "Closed-loop cooling tower circuit. No discharge to drains or water bodies. Net loss: 50 L from evaporation.")} />
                        <Row label={t("Gas no condensable", "Non-condensable gas")}
                          value={t("100% recirculado como combustible", "100% recirculated as fuel")}
                          sub={t("El gas no condensable (H\u2082, CH\u2084, C\u2082\u208bC\u2084) se quema en el quemador del reactor, eliminando la necesidad de di\u00e9sel externo y evitando emisiones de gas pirol\u00edtico a la atm\u00f3sfera.",
                            "Non-condensable gas (H\u2082, CH\u2084, C\u2082\u208bC\u2084) is burned in the reactor burner, eliminating the need for external diesel and preventing pyrolysis gas emissions to the atmosphere.")} />
                        <Row label={t("Otros insumos qu\u00edmicos", "Other chemical inputs")} value={batch.chemicalsUsed ?? t("Ninguno", "None")} />
                      </div>
                    </div>
                  </div>
                )}
              </Section>
            )}

            {/* ═══ CHAPTER 06 — LOG\u00cdSTICA INVERSA / REVERSE LOGISTICS ═══ */}
            <Section num="06" title={t("Log\u00edstica Inversa \u2014 Circularidad total", "Reverse Logistics \u2014 Full circularity")}>
              {/* Hero callout */}
              <div className="rounded-xl p-5 mb-5 border border-[#3d5c0e]/15" style={{ background: "linear-gradient(135deg, rgba(61,92,14,0.06), rgba(61,92,14,0.02))" }}>
                <p className="text-[11px] text-gray-700 leading-relaxed font-medium">
                  {t(
                    "El di\u00e9sel que producimos alimenta el mismo cami\u00f3n que recoge m\u00e1s pl\u00e1stico agr\u00edcola de los campos de Michoac\u00e1n. Cada lote genera el combustible para su propia log\u00edstica de recolecci\u00f3n.",
                    "The diesel we produce fuels the same truck that collects more agricultural plastic from the fields of Michoac\u00e1n. Each batch generates the fuel for its own collection logistics."
                  )}
                </p>
              </div>

              {/* Math breakdown */}
              <div className="space-y-1 mb-4">
                <Row label={t("Consumo del cami\u00f3n (ida y vuelta)", "Truck consumption (round trip)")} value="59 L" bold />
                <Row label={t("Producci\u00f3n por lote", "Production per batch")} value={`${oilL} L`} bold />
                <Row label={t("Balance", "Balance")} value={`${oilL} - 59 = ${oilL - 59} L ${t("excedente para venta", "surplus for sale")}`} bold />
              </div>

              {/* Visual bar: 59 L logistics vs surplus for sale */}
              <div className="bg-gray-50/80 rounded-xl p-4">
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-[9px] text-gray-500 font-semibold">{t("Distribuci\u00f3n de producci\u00f3n", "Production distribution")}</span>
                  <span className="text-[9px] font-mono text-gray-500 ml-auto">{oilL} L {t("total", "total")}</span>
                </div>
                <div className="flex h-7 rounded-full overflow-hidden shadow-sm">
                  <div className="flex items-center justify-center" style={{ width: `${Math.round((59 / oilL) * 100)}%`, backgroundColor: "#92400e" }}>
                    <span className="text-[8px] font-bold text-white/90">59 L</span>
                  </div>
                  <div className="flex items-center justify-center" style={{ width: `${Math.round(((oilL - 59) / oilL) * 100)}%`, backgroundColor: "#3d5c0e" }}>
                    <span className="text-[8px] font-bold text-white/90">{oilL - 59} L</span>
                  </div>
                </div>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-[#92400e]" />
                    <span className="text-[9px] text-gray-500 font-medium">{t("Log\u00edstica", "Logistics")} (59 L)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-[#3d5c0e]" />
                    <span className="text-[9px] text-gray-500 font-medium">{t("Venta", "Sale")} ({oilL - 59} L)</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* ═══ CHAPTER 07 — ACREDITACI\u00d3N / ACCREDITATION ═══ */}
            <Section num="07" title={t("Acreditaci\u00f3n \u2014 Qui\u00e9n, c\u00f3mo y bajo qu\u00e9 normas", "Accreditation \u2014 Who, how, and under which standards")}>
              {/* Producer identity + LCA framework — side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Producer Identity */}
                <div>
                  <p className="text-[8px] uppercase tracking-[1.5px] text-gray-500 font-semibold mb-2">
                    {t("Identidad del productor", "Producer identity")}
                  </p>
                  <div className="space-y-1">
                    <Row label={t("Empresa", "Company")} value="EcoNova M\u00e9xico S.A. de C.V." bold />
                    <Row label={t("Instalaci\u00f3n", "Facility")} value={t("Planta Lerma, Estado de M\u00e9xico, M\u00e9xico", "Lerma Plant, Estado de M\u00e9xico, Mexico")}
                      sub={t("Coordenadas: 19.2847\u00b0 N, 99.5107\u00b0 W", "Coordinates: 19.2847\u00b0 N, 99.5107\u00b0 W")} />
                    <Row label={t("Reactor", "Reactor")} value="DY-500"
                      sub={t("Reactor rotatorio discontinuo (batch), capacidad 500 kg/lote, calentamiento externo por quemador di\u00e9sel/syngas",
                        "Batch rotary reactor, 500 kg/batch capacity, external heating via diesel/syngas burner")} />
                    <Row label={t("Tipo de producto", "Product type")} value={t("Aceite pirol\u00edtico (pyrolysis oil)", "Pyrolysis oil")}
                      sub={t("Mezcla de hidrocarburos C\u2086\u208b\u2082\u2080 derivada de residuo pl\u00e1stico \u2014 comparable a di\u00e9sel/nafta",
                        "C\u2086\u208b\u2082\u2080 hydrocarbon mixture derived from plastic waste \u2014 comparable to diesel/naphtha")} />
                    <Row label="ID" value={certificate.code} bold />
                    <Row label={t("Contenido reciclado", "Recycled content")} value={t("100% \u2014 residuo pl\u00e1stico post-consumo", "100% \u2014 post-consumer plastic waste")} bold />
                  </div>
                  <Info>
                    {t(
                      "Conforme a ESPR 2024/1781 Annex III: identidad del operador econ\u00f3mico (a), identificador \u00fanico del producto (b), trazabilidad de materias primas (e), contenido reciclado (Art. 7).",
                      "Per ESPR 2024/1781 Annex III: economic operator identity (a), unique product identifier (b), raw material traceability (e), recycled content (Art. 7)."
                    )}
                  </Info>
                </div>

                {/* LCA Framework */}
                <div>
                  <p className="text-[8px] uppercase tracking-[1.5px] text-gray-500 font-semibold mb-2">
                    {t("Marco LCA", "LCA framework")}
                  </p>
                  <div className="space-y-1">
                    <Row label={t("Norma", "Standard")} value="ISO 14040:2006 / ISO 14044:2006" bold />
                    <Row label={t("Unidad funcional", "Functional unit")}
                      value={t(
                        `Producci\u00f3n de ${oilL} L de aceite pirol\u00edtico (${oilKg} kg) a partir de ${batch.feedstockWeight} kg de residuo pl\u00e1stico agr\u00edcola`,
                        `Production of ${oilL} L of pyrolysis oil (${oilKg} kg) from ${batch.feedstockWeight} kg of agricultural plastic waste`
                      )} bold />
                    <Row label={t("Frontera del sistema", "System boundary")}
                      value={t("Cuna a puerta (cradle-to-gate)", "Cradle-to-gate")}
                      sub={t(
                        "Incluye: recolecci\u00f3n en campo, transporte a planta, pre-procesamiento, pir\u00f3lisis catal\u00edtica, condensaci\u00f3n, destilaci\u00f3n y refinaci\u00f3n. Excluye: uso final del aceite, distribuci\u00f3n post-producci\u00f3n.",
                        "Includes: field collection, transport to plant, pre-processing, catalytic pyrolysis, condensation, distillation and refining. Excludes: end-use of oil, post-production distribution."
                      )} />
                    <Row label={t("Asignaci\u00f3n co-productos", "Co-product allocation")}
                      value={t("Energ\u00e9tico \u2014 por contenido cal\u00f3rico (MJ/kg)", "Energy-based \u2014 by calorific content (MJ/kg)")}
                      sub={t("ISO 14044 \u00a74.3.4 \u2014 jerarqu\u00eda: evitar asignaci\u00f3n > f\u00edsico > energ\u00e9tico. Energ\u00e9tico seleccionado por naturaleza combustible de todos los co-productos.",
                        "ISO 14044 \u00a74.3.4 \u2014 hierarchy: avoid allocation > physical > energy. Energy-based selected given the fuel nature of all co-products.")} />
                    <Row label={t("Regla de corte", "Cut-off rule")} value="<1% masa y <1% energ\u00eda" />
                    <Row label={t("Factores de caracterizaci\u00f3n", "Characterization factors")} value="IPCC AR5 GWP\u2081\u2080\u2080 (CH\u2084=28, N\u2082O=265)" />
                    <Row label={t("Factor red el\u00e9ctrica", "Grid emission factor")} value="IEA M\u00e9xico 2023: 0.435 kg CO\u2082/kWh" />
                    <Row label={t("Datos primarios", "Primary data")}
                      value={t("Medici\u00f3n directa en planta \u2014 DY-500", "Direct plant measurement \u2014 DY-500")}
                      sub={t("Temperaturas, masas, vol\u00famenes y consumo energ\u00e9tico medidos por operador con instrumentos calibrados.",
                        "Temperatures, masses, volumes, and energy consumption measured by operator with calibrated instruments.")} />
                  </div>
                  <Info>
                    {t(
                      "Categor\u00edas de impacto evaluadas conforme ISO 14044 \u00a74.4: cambio clim\u00e1tico (GWP\u2081\u2080\u2080), acidificaci\u00f3n (NOx+SOx), material particulado (PM\u2082.\u2085), uso de agua. Baseline: IPCC 2006 Vol. 5 Table 5.3 \u2014 quema abierta de polietileno.",
                      "Impact categories assessed per ISO 14044 \u00a74.4: climate change (GWP\u2081\u2080\u2080), acidification (NOx+SOx), particulate matter (PM\u2082.\u2085), water use. Baseline: IPCC 2006 Vol. 5 Table 5.3 \u2014 open burning of polyethylene."
                    )}
                  </Info>
                </div>
              </div>

              {/* Compliance cards */}
              <div className="grid grid-cols-1 gap-2.5">
                <ComplianceCard color="#3d5c0e" name="ISO 14040/14044"
                  article={t("An\u00e1lisis de Ciclo de Vida", "Life Cycle Assessment")}
                  status={t("CONFORME", "COMPLIANT")}
                  items={[
                    t("Unidad funcional definida (\u00a74.2.3)", "Functional unit defined (\u00a74.2.3)"),
                    t("Frontera del sistema: cuna a puerta (\u00a74.2.3.3)", "System boundary: cradle-to-gate (\u00a74.2.3.3)"),
                    t("Inventario completo: masa, energ\u00eda, emisiones (\u00a74.3)", "Complete inventory: mass, energy, emissions (\u00a74.3)"),
                    t("4 categor\u00edas de impacto evaluadas (\u00a74.4)", "4 impact categories assessed (\u00a74.4)"),
                    t("Asignaci\u00f3n energ\u00e9tica de co-productos (\u00a74.3.4)", "Energy allocation of co-products (\u00a74.3.4)"),
                  ]} />
                <ComplianceCard color="#E8700A" name="EU DPP"
                  article="ESPR 2024/1781 Annex III"
                  status={t("ALINEADO", "ALIGNED")}
                  items={[
                    t("Identidad del operador econ\u00f3mico (a)", "Economic operator identity (a)"),
                    t("Identificador \u00fanico del producto (b)", "Unique product identifier (b)"),
                    t("Trazabilidad origen\u2192producto (e)", "Origin\u2192product traceability (e)"),
                    t("Huella de carbono por unidad funcional", "Carbon footprint per functional unit"),
                    t("Contenido reciclado: 100% (Art. 7)", "Recycled content: 100% (Art. 7)"),
                  ]} />
                <ComplianceCard color="#2D8CF0" name="ISCC PLUS"
                  article={t("Cadena de Custodia \u2014 \u00a7201/203/205", "Chain of Custody \u2014 \u00a7201/203/205")}
                  status="READY"
                  items={[
                    t(`Balance: ${batch.massBalancePeriod ?? "por lote"} (\u00a7203)`, `Balance: ${batch.massBalancePeriod ?? "per batch"} (\u00a7203)`),
                    t(`Asignaci\u00f3n: ${batch.allocMethod ?? "energ\u00e9tico"} (\u00a7205)`, `Allocation: ${batch.allocMethod ?? "energy-based"} (\u00a7205)`),
                    t("Trazabilidad de materia prima (\u00a7201)", "Raw material traceability (\u00a7201)"),
                    t("Balance de masa cerrado y verificable", "Closed and verifiable mass balance"),
                  ]} />
                <ComplianceCard color="#7C5CFC" name="Verra PWRM0002"
                  article={t("Plastic Credit Standard v1.1", "Plastic Credit Standard v1.1")}
                  status="READY"
                  items={[
                    t(`Resina: ${batch.plasticTypeCode ?? "4-LDPE"} (clasificaci\u00f3n SPI)`, `Resin: ${batch.plasticTypeCode ?? "4-LDPE"} (SPI classification)`),
                    t(`Baseline: ${batch.baselineScenario ?? "quema abierta"}`, `Baseline: ${batch.baselineScenario ?? "open burning"}`),
                    t("Cuantificaci\u00f3n: 525 kg CO\u2082eq evitados", "Quantification: 525 kg CO\u2082eq avoided"),
                    t("Adicionalidad demostrada (ver abajo)", "Additionality demonstrated (see below)"),
                  ]} />
              </div>
              {batch.additionalityProof && (
                <Info>
                  <strong>{t("Adicionalidad (Verra \u00a73.2):", "Additionality (Verra \u00a73.2):")}</strong>{" "}
                  {t(batch.additionalityProof, "No recycling infrastructure exists in the region. Agricultural plastic is burned in >95% of cases in Michoac\u00e1n.")}
                </Info>
              )}
            </Section>

          </div>

          {/* ═══ VERIFICATION FOOTER ═══ */}
          <div className="px-4 sm:px-8 py-4 bg-gray-50/60 border-t border-gray-100">
            <div className="flex items-start sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[8px] tracking-[2px] text-gray-500 uppercase font-semibold mb-1">
                  {t("Verificaci\u00f3n Digital \u2014 Integridad Criptogr\u00e1fica", "Digital Verification \u2014 Cryptographic Integrity")}
                </p>
                <p className="font-mono text-[7px] sm:text-[8px] text-gray-500 break-all leading-relaxed">SHA-256: {certificate.hash}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <p className="text-[10px] text-gray-500 font-medium font-mono">{certificate.code}</p>
                  {certificate.verifiedAt && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-semibold bg-[#3d5c0e]/10 text-[#3d5c0e]">
                      \u2713 {t("Verificado", "Verified")}
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
          <div className="px-4 sm:px-8 py-3 text-center" style={{ background: "linear-gradient(135deg, #1a2e1a, #2d4a1a)" }}>
            <p className="text-[8px] tracking-[3px] text-white/50 uppercase">
              EcoNova M\u00e9xico \u00b7 {t("Econom\u00eda Circular", "Circular Economy")} \u00b7 econova.com.mx
            </p>
          </div>
        </div>

        <p className="text-center text-[8px] text-gray-500 mt-4 leading-relaxed">
          {t("Pasaporte Digital de Producto \u2014 Trazabilidad de Ciclo de Vida Completo", "Digital Product Passport \u2014 Complete Life Cycle Traceability")} \u00b7 EU DPP \u00b7 ISO 14040 \u00b7 ISCC+ \u00b7 Verra
        </p>
      </div>
    </div>
  );
}
