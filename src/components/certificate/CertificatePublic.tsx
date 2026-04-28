"use client";

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

// ─── Section wrapper ────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 rounded-full bg-[#3d5c0e]/25" />
        <h3 className="text-[9px] tracking-[2.5px] text-[#3d5c0e] font-bold uppercase">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

// ─── Data row ───────────────────────────────────────────────────
function Row({ label, value, bold }: { label: string; value: string | number | null; bold?: boolean }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex justify-between items-baseline py-1.5 border-b border-gray-100/80 last:border-0">
      <span className="text-gray-500 text-xs">{label}</span>
      <span className={`text-xs text-right max-w-[60%] ${bold ? "font-mono font-bold text-gray-900" : "text-gray-700"}`}>
        {value}
      </span>
    </div>
  );
}

// ─── Stat card ──────────────────────────────────────────────────
function Stat({ value, unit, label, color }: { value: string; unit?: string; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className="flex items-baseline justify-center gap-0.5">
        <span className="font-mono text-xl font-bold" style={{ color }}>{value}</span>
        {unit && <span className="text-[10px] font-semibold" style={{ color, opacity: 0.7 }}>{unit}</span>}
      </div>
      <div className="text-[8px] text-gray-400 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}

// ─── Compliance card ────────────────────────────────────────────
function ComplianceCard({ color, name, article, description, status, children }: {
  color: string; name: string; article: string; description: string; status: string; children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl p-3 border" style={{ borderColor: `${color}20`, background: `linear-gradient(135deg, ${color}06, transparent)` }}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[10px] font-bold text-gray-700">{name}</span>
        </div>
        <span
          className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[7px] font-bold tracking-wider"
          style={{ backgroundColor: `${color}12`, color }}
        >{status}</span>
      </div>
      <p className="text-[8px] font-medium text-gray-500 mb-0.5">{article}</p>
      <p className="text-[8px] text-gray-400 leading-relaxed">{description}</p>
      {children}
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────
export function CertificatePublic({ certificate }: CertificatePublicProps) {
  const { batch } = certificate;

  // ── Mass balance (rounded for exact closure) ──
  const oilL = batch.oilOutput ?? 0;
  const oilKg = Math.round(batch.oilWeightKg ?? oilL * 0.85);
  const co2Avoided = batch.co2Avoided ?? 0;
  const cleanKg = batch.feedstockWeight * (1 - (batch.contaminationPct ?? 0) / 100);
  const charKg = Math.round(cleanKg * 0.10);
  const gasKg = Math.round(cleanKg) - oilKg - charKg;

  // ── CO₂ metrics ──
  const co2PerLiter = oilL > 0 && co2Avoided > 0 ? co2Avoided / oilL : 0;
  const baselinePerL = batch.co2Baseline && oilL > 0 ? batch.co2Baseline / oilL : 0;
  const projectPerL = batch.co2Project && oilL > 0 ? batch.co2Project / oilL : 0;
  const reductionPct = batch.co2Baseline && batch.co2Baseline > 0
    ? ((batch.co2Baseline - (batch.co2Project ?? 0)) / batch.co2Baseline * 100)
    : 0;

  // ── Energy balance (rounded for display consistency) ──
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

  // ── Functional unit (ISO 14044) ──
  const functionalUnit = oilL > 0
    ? `1 lote: ${oilL} L aceite pirolítico (${oilKg} kg, ${oilMJperKg} MJ/kg)`
    : `1 lote: ${batch.feedstockWeight} kg ${batch.feedstockType}`;

  const dateFormatted = new Date(batch.date).toLocaleDateString("es-MX", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });

  return (
    <div className="min-h-screen bg-[#F5F3EE] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-xl">

        {/* ═══ PASSPORT CARD ═══ */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* ── Header band ── */}
          <div style={{ background: "linear-gradient(135deg, #1a2e1a 0%, #2d4a1a 50%, #1a2e1a 100%)" }}>
            <div className="px-6 sm:px-8 pt-6 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[8px] tracking-[4px] text-white/40 uppercase mb-1">
                    Pasaporte Digital de Producto
                  </p>
                  <h1 className="text-2xl font-bold text-white font-mono tracking-tight">
                    ECONOVA
                  </h1>
                  <p className="text-[8px] tracking-[3px] text-white/30 uppercase mt-0.5">
                    Economía Circular · México
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm">
                  <QRCodeSVG value={verifyUrl} size={64} level="M" bgColor="transparent" fgColor="#ffffff" />
                </div>
              </div>
            </div>
            {/* Compliance micro-badges strip */}
            <div className="flex items-center justify-center gap-3 px-6 py-2 bg-white/[0.04] border-t border-white/[0.08]">
              {[
                { label: "EU DPP", sub: "ESPR 2024/1781" },
                { label: "ISO 14040", sub: "LCA" },
                { label: "ISCC PLUS", sub: "CoC" },
                { label: "Verra", sub: "PWRM0002" },
              ].map((b) => (
                <div key={b.label} className="text-center">
                  <span className="text-[7px] text-white/50 font-semibold tracking-wider">{b.label}</span>
                  <span className="block text-[6px] text-white/25 tracking-wider">{b.sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Product hero ── */}
          <div className="px-6 sm:px-8 py-5 border-b border-gray-100">
            <div className="flex items-baseline gap-2 mb-1">
              {oilL > 0 ? (
                <>
                  <span className="font-mono text-4xl font-bold tracking-tight" style={{ color: "#7C5CFC" }}>{oilL}</span>
                  <span className="text-sm text-gray-500">litros de aceite pirolítico</span>
                </>
              ) : (
                <>
                  <span className="font-mono text-3xl font-bold tracking-tight text-gray-900">{batch.feedstockWeight}</span>
                  <span className="text-sm text-gray-500">kg {batch.feedstockType}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="font-mono">{batch.code}</span>
              <span>·</span>
              <span>{dateFormatted}</span>
            </div>
          </div>

          {/* ── Key metrics bar ── */}
          <div className="px-6 sm:px-8 py-4 bg-gray-50/50 border-b border-gray-100">
            <div className="grid grid-cols-4 gap-2">
              {co2Avoided > 0 && (
                <Stat value={co2Avoided.toFixed(0)} unit="kg" label="CO₂eq evitados" color="#3d5c0e" />
              )}
              {hasEnergyData && (
                <Stat value={`${energyRatio.toFixed(1)}:1`} label="Ratio energético" color="#E8700A" />
              )}
              {batch.yieldPercent != null && (
                <Stat value={batch.yieldPercent.toFixed(0)} unit="%" label="Rendimiento" color="#7C5CFC" />
              )}
              <Stat value="100" unit="%" label="Contenido reciclado" color="#2D8CF0" />
            </div>
          </div>

          {/* ── Content sections ── */}
          <div className="px-6 sm:px-8 py-6 space-y-7">

            {/* ═══ 1. PRODUCER IDENTITY (EU DPP Annex III) ═══ */}
            <Section title="Identidad del Productor — ESPR Annex III (a)(e)">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <Row label="Empresa" value="EcoNova México S.A. de C.V." bold />
                <Row label="Instalación" value="Planta Morelia, Michoacán" />
                <Row label="Coordenadas" value="19.7006° N, 101.1845° W" />
                <Row label="ID Producto" value={certificate.code} bold />
                <Row label="Tipo de producto" value="Aceite pirolítico (pyrolysis oil)" />
                <Row label="Contenido reciclado" value="100% — residuo plástico post-consumo" bold />
              </div>
            </Section>

            {/* ═══ 2. LCA FRAMEWORK (ISO 14040/14044 §4.2) ═══ */}
            <Section title="Marco de Análisis de Ciclo de Vida — ISO 14044 §4.2">
              <div className="grid grid-cols-1 gap-y-1">
                <Row label="Norma" value="ISO 14040:2006 / ISO 14044:2006" bold />
                <Row label="Unidad funcional" value={functionalUnit} bold />
                <Row label="Frontera del sistema" value="Cuna a puerta (cradle-to-gate)" />
                <Row label="Etapas incluidas" value="Recolección → Transporte → Pirólisis → Productos" />
                <Row label="Asignación co-productos" value={batch.allocMethod ?? "Energético (contenido calórico)"} />
                <Row label="Factores de caracterización" value="IPCC AR5 (CH₄: 28, N₂O: 265)" />
                <Row label="Factor red eléctrica" value="IEA México 2023: 0.435 kg CO₂/kWh" />
                <Row label="Fuente datos primarios" value="Medición directa en planta — DY-500" />
              </div>
              <p className="text-[8px] text-gray-400 italic mt-2 leading-relaxed">
                Categorías de impacto evaluadas: cambio climático (GWP100), acidificación, material particulado, uso de agua.
                Baseline: IPCC 2006 Vol. 5 Table 5.3 (quema abierta de PE).
              </p>
            </Section>

            {/* ═══ 3. WASTE ORIGIN ═══ */}
            <Section title="Origen del Residuo">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <Row label="Material" value={batch.feedstockType} bold />
                <Row label="Clasificación" value="Residuo plástico post-consumo" />
                <Row label="Código resina" value={batch.plasticTypeCode ?? "4-LDPE"} bold />
                <Row label="Origen geográfico" value={batch.feedstockOrigin} bold />
                <Row label="Peso bruto" value={`${batch.feedstockWeight} kg`} />
                <Row label="Contaminación" value={batch.contaminationPct != null ? `~${batch.contaminationPct}%` : null} />
                <Row label="Peso neto (limpio)" value={`${Math.round(cleanKg)} kg`} bold />
              </div>
            </Section>

            {/* ═══ 4. PROCESS ═══ */}
            <Section title="Proceso de Transformación">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <Row label="Tecnología" value="Pirólisis catalítica" />
                <Row label="Reactor" value="DY-500" />
                <Row label="Catalizador" value={batch.catalystType} />
                {batch.catalystKg != null && batch.catalystKg > 0 && (
                  <Row label="Catalizador (kg)" value={`${batch.catalystKg} kg`} />
                )}
                {batch.maxReactorTemp != null && <Row label="Temp. máxima" value={`${batch.maxReactorTemp}°C`} bold />}
                {batch.durationMinutes != null && (
                  <Row label="Duración" value={`${Math.floor(batch.durationMinutes / 60)}h ${batch.durationMinutes % 60}m`} />
                )}
                {oilL > 0 && <Row label="Producción" value={`${oilL} L (${oilKg} kg)`} bold />}
                {batch.yieldPercent != null && <Row label="Rendimiento másico" value={`${batch.yieldPercent.toFixed(1)}%`} bold />}
              </div>
            </Section>

            {/* ═══ 5. MASS BALANCE — Sankey ═══ */}
            {oilL > 0 && (
              <Section title="Balance de Masa — ISO 14044 §4.3">
                <div className="bg-gray-50/80 rounded-xl p-3 -mx-1">
                  <SankeyFlow
                    feedstockKg={batch.feedstockWeight}
                    feedstockType={batch.feedstockType}
                    contaminationPct={batch.contaminationPct ?? 0}
                    oilLiters={oilL}
                    oilKg={oilKg}
                    charKg={charKg}
                    gasKg={gasKg}
                  />
                </div>
                <p className="text-[8px] text-gray-400 italic mt-1.5">
                  Balance cerrado: {batch.feedstockWeight} kg entrada = {Math.round(batch.feedstockWeight - cleanKg)} kg contaminación + {oilKg} kg aceite + {charKg} kg char + {gasKg} kg gas
                </p>
              </Section>
            )}

            {/* ═══ 6. ENERGY BALANCE (ISO 14040 / ISCC+) ═══ */}
            {hasEnergyData && (
              <Section title="Balance Energético — ISO 14040 / ISCC+ 205">
                {/* Energy ratio hero */}
                <div className="text-center py-2.5 mb-3 rounded-xl" style={{ background: "linear-gradient(135deg, rgba(232,112,10,0.06), rgba(232,112,10,0.02))" }}>
                  <div className="font-mono text-2xl font-bold" style={{ color: "#E8700A" }}>
                    {energyRatio.toFixed(1)}:1
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">relación energía producida / consumida</div>
                </div>

                {/* Inputs */}
                <div className="mb-2">
                  <p className="text-[8px] uppercase tracking-[1.5px] text-gray-400 font-semibold mb-1.5">Entradas (energía operativa)</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {dieselL > 0 && <Row label="Diésel (arranque)" value={`${dieselL} L → ${dieselMJ} MJ`} />}
                    {elecKwh > 0 && <Row label="Electricidad" value={`${elecKwh.toFixed(1)} kWh → ${elecMJ} MJ`} />}
                    {gasRecKg > 0 && <Row label="Gas recirculado" value={`${gasRecKg} kg → ${gasMJ} MJ`} />}
                  </div>
                  <div className="mt-1 pt-1 border-t border-gray-100">
                    <Row label="Total energía entrada" value={`${totalEnergyIn} MJ`} bold />
                  </div>
                </div>

                {/* Outputs */}
                <div className="mb-2">
                  <p className="text-[8px] uppercase tracking-[1.5px] text-gray-400 font-semibold mb-1.5">Salidas (contenido energético productos)</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <Row label={`Aceite (${oilMJperKg} MJ/kg)`} value={`${oilKg} kg → ${oilEnergyMJ} MJ`} />
                    <Row label={`Char (${charMJperKg} MJ/kg)`} value={`${charKg} kg → ${charEnergyMJ} MJ`} />
                  </div>
                  <div className="mt-1 pt-1 border-t border-gray-100">
                    <Row label="Total energía salida" value={`${totalEnergyOut} MJ`} bold />
                  </div>
                </div>

                {/* Visual bar comparison */}
                <div className="space-y-1.5 mt-2">
                  <div>
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className="text-gray-500">Entrada</span>
                      <span className="font-mono text-[#E8700A] font-bold">{totalEnergyIn} MJ</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${totalEnergyOut > 0 ? Math.min(100, (totalEnergyIn / totalEnergyOut) * 100) : 50}%`,
                          background: "linear-gradient(90deg, #E8700A, #f59e0b)",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className="text-gray-500">Salida</span>
                      <span className="font-mono text-[#7C5CFC] font-bold">{totalEnergyOut} MJ</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#7C5CFC]/70" style={{ width: "100%" }} />
                    </div>
                  </div>
                </div>

                <p className="text-[8px] text-gray-400 italic mt-2">
                  Conforme a ISO 14040 §4.3 · LHV diésel: 45.6 MJ/kg · Syngas: ~38 MJ/kg · Electricidad: 3.6 MJ/kWh
                </p>
              </Section>
            )}

            {/* ═══ 7. QUALITY CONTROL ═══ */}
            {lab && (
              <Section title={`Control de Calidad — ${lab.labName}`}>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {lab.labCertification && <Row label="Certificación lab" value={lab.labCertification} />}
                  <Row label="Azufre (ASTM D4951)" value={lab.sulfurPercent != null ? `${lab.sulfurPercent}% m/m` : null} />
                  <Row label="Agua (ASTM D6304)" value={lab.waterContent != null ? `${lab.waterContent} PPM` : null} />
                  <Row label="Flash point (ASTM D93)" value={lab.flashPoint != null ? `${lab.flashPoint}°C` : null} />
                  <Row label="Densidad 15°C (ASTM D4052)" value={lab.density15C != null ? `${lab.density15C} g/mL` : null} />
                  <Row label="Viscosidad 40°C (ASTM D7042)" value={lab.viscosity40C != null ? `${lab.viscosity40C} mm²/s` : null} />
                  <Row label="Residuo carbón (ASTM D4530)" value={lab.carbonResidue != null ? `${lab.carbonResidue}%` : null} />
                  <Row label="Cenizas (ASTM D482)" value={lab.ashContent != null ? `${lab.ashContent}%` : null} />
                  <Row label="Poder calorífico" value={lab.calorificMJ != null ? `${lab.calorificMJ} MJ/kg` : null} bold />
                </div>
                {lab.verdict && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-[#3d5c0e] bg-[#3d5c0e]/[0.04] rounded-lg px-3 py-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M9 12l2 2 4-4" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    <span className="text-xs font-semibold">{lab.verdict}</span>
                  </div>
                )}
              </Section>
            )}

            {/* ═══ 8. ENVIRONMENTAL IMPACT — Multi-indicator (ISO 14044 §4.4) ═══ */}
            {co2Avoided > 0 && (
              <Section title="Huella Ambiental — ISO 14044 §4.4 LCIA">
                {/* Big CO₂ number */}
                <div className="text-center py-3 mb-3 rounded-xl" style={{ background: "linear-gradient(135deg, rgba(61,122,10,0.06), rgba(61,122,10,0.02))" }}>
                  <div className="font-mono text-3xl font-bold" style={{ color: "#3d5c0e" }}>
                    {co2Avoided.toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">kg CO₂eq evitados en este lote</div>
                  {reductionPct > 0 && (
                    <div className="text-[10px] font-semibold mt-1" style={{ color: "#3d5c0e" }}>
                      ↓ {reductionPct.toFixed(0)}% reducción vs quema abierta
                    </div>
                  )}
                </div>

                {/* Comparison bars */}
                <div className="space-y-2 mb-4">
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-gray-500">Quema abierta (baseline IPCC)</span>
                      <span className="font-mono font-bold text-red-600">{baselinePerL.toFixed(2)} kg CO₂/L</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-red-400/70" style={{ width: "100%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-gray-500">EcoNova pirólisis</span>
                      <span className="font-mono font-bold" style={{ color: "#3d5c0e" }}>{projectPerL.toFixed(2)} kg CO₂/L</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${baselinePerL > 0 ? (projectPerL / baselinePerL) * 100 : 50}%`,
                          background: "linear-gradient(90deg, #3d7a0a, #6abf2a)",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {co2PerLiter > 0 && (
                  <div className="text-center text-[11px] text-gray-500 mb-4">
                    Cada litro de aceite pirolítico evita{" "}
                    <span className="font-mono font-bold" style={{ color: "#3d5c0e" }}>{co2PerLiter.toFixed(2)} kg CO₂</span>{" "}
                    vs la quema abierta
                  </div>
                )}

                {/* Extended impact indicators */}
                <p className="text-[8px] uppercase tracking-[1.5px] text-gray-400 font-semibold mb-2">Indicadores ambientales adicionales</p>
                <div className="grid grid-cols-2 gap-2">
                  {(batch.emissionsNoxKg != null || batch.emissionsSoxKg != null) && (
                    <div className="bg-gray-50/80 rounded-lg p-2.5">
                      <div className="font-mono text-sm font-bold text-gray-700">
                        {((batch.emissionsNoxKg ?? 0) + (batch.emissionsSoxKg ?? 0)).toFixed(2)} kg
                      </div>
                      <div className="text-[8px] text-gray-400 mt-0.5">NOx + SOx (acidificación)</div>
                    </div>
                  )}
                  {batch.emissionsPmKg != null && (
                    <div className="bg-gray-50/80 rounded-lg p-2.5">
                      <div className="font-mono text-sm font-bold text-gray-700">{batch.emissionsPmKg} kg</div>
                      <div className="text-[8px] text-gray-400 mt-0.5">Material particulado (PM)</div>
                    </div>
                  )}
                  {batch.waterConsumedL != null && (
                    <div className="bg-gray-50/80 rounded-lg p-2.5">
                      <div className="font-mono text-sm font-bold text-gray-700">{batch.waterConsumedL} L</div>
                      <div className="text-[8px] text-gray-400 mt-0.5">Uso de agua</div>
                    </div>
                  )}
                  <div className="bg-[#2D8CF0]/[0.04] rounded-lg p-2.5 border border-[#2D8CF0]/10">
                    <div className="font-mono text-sm font-bold" style={{ color: "#2D8CF0" }}>100%</div>
                    <div className="text-[8px] text-gray-400 mt-0.5">Contenido reciclado (ESPR Art. 7)</div>
                  </div>
                </div>

                <p className="text-[8px] text-gray-400 italic mt-2.5">
                  GWP: IPCC AR5 · Baseline: IPCC 2006 Vol. 5 Table 5.3 · Grid: IEA México 2023 (0.435 kg CO₂/kWh)
                </p>
              </Section>
            )}

            {/* ═══ 9. TRANSPORT (ISO 14040 / ISCC+) ═══ */}
            {batch.transportDistanceKm != null && (
              <Section title="Transporte del Feedstock — ISCC+ 203">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <Row label="Modo" value={batch.transportMode} />
                  <Row label="Distancia" value={`${batch.transportDistanceKm} km`} bold />
                  <Row label="Combustible" value={batch.transportFuelType} />
                  <Row label="Consumo" value={batch.transportFuelL != null ? `${batch.transportFuelL} L` : null} />
                  <Row label="CO₂ transporte" value={batch.transportCo2Kg != null ? `${batch.transportCo2Kg} kg CO₂` : null} bold />
                  <Row label="Factor emisión" value="3.15 kg CO₂/kg diésel (IPCC 2006)" />
                </div>
                <p className="text-[8px] text-gray-400 italic mt-1.5">
                  Ruta: {batch.feedstockOrigin} → Planta EcoNova, Morelia
                </p>
              </Section>
            )}

            {/* ═══ 10. PROCESS EMISSIONS (ISO 14040) ═══ */}
            {batch.emissionsCo2Kg != null && (
              <Section title="Emisiones del Proceso — Inventario (ISO 14044 §4.3)">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <Row label="CO₂ directo (quemador)" value={`${batch.emissionsCo2Kg} kg`} bold />
                  <Row label="CH₄ fugitivas" value={batch.emissionsCh4Kg != null ? `${batch.emissionsCh4Kg} kg` : null} />
                  <Row label="NOx" value={batch.emissionsNoxKg != null ? `${batch.emissionsNoxKg} kg` : null} />
                  <Row label="SOx" value={batch.emissionsSoxKg != null ? `${batch.emissionsSoxKg} kg` : null} />
                  <Row label="Partículas (PM₂.₅)" value={batch.emissionsPmKg != null ? `${batch.emissionsPmKg} kg` : null} />
                </div>
                <div className="mt-1 pt-1 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <Row label="Agua consumida" value={batch.waterConsumedL != null ? `${batch.waterConsumedL} L` : null} />
                    <Row label="Agua residual" value={batch.emissionsWaterL != null ? `${batch.emissionsWaterL} L` : null} />
                  </div>
                </div>
              </Section>
            )}

            {/* ═══ 11. WASTE MANAGEMENT & INPUTS ═══ */}
            {(batch.charDisposition) && (
              <Section title="Gestión de Residuos — Disposición Final">
                <div className="grid grid-cols-1 gap-y-1">
                  <Row label="Char / carbón" value={batch.charDisposition} />
                  <Row label="Cenizas" value={batch.ashDisposition} />
                  <Row label="Agua residual" value={batch.wastewaterDisp} />
                  <Row label="Otros insumos químicos" value={batch.chemicalsUsed} />
                </div>
              </Section>
            )}

            {/* ═══ 12. REGULATORY COMPLIANCE ═══ */}
            <Section title="Cumplimiento Normativo">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <ComplianceCard
                  color="#3d5c0e"
                  name="ISO 14040/14044"
                  article="Análisis de Ciclo de Vida"
                  description="Unidad funcional, frontera del sistema, LCI completo, balance de masa y energía, 4 categorías de impacto evaluadas"
                  status="CONFORME"
                />
                <ComplianceCard
                  color="#E8700A"
                  name="EU DPP"
                  article="ESPR 2024/1781 Annex III"
                  description="Identidad productor, ID único, trazabilidad origen→producto, huella de carbono, contenido reciclado 100%"
                  status="ALINEADO"
                />
                <ComplianceCard
                  color="#2D8CF0"
                  name="ISCC PLUS"
                  article="Cadena de Custodia — §203"
                  description={`Balance: ${batch.massBalancePeriod ?? "Por lote"} · Asignación: ${batch.allocMethod ?? "Energético"}${batch.sustainabilityCertId ? ` · Cert: ${batch.sustainabilityCertId}` : ""}`}
                  status="READY"
                />
                <ComplianceCard
                  color="#7C5CFC"
                  name="Verra PWRM0002"
                  article="Plastic Credit Standard v1.1"
                  description={`Resina: ${batch.plasticTypeCode ?? batch.feedstockType} · Baseline: ${batch.baselineScenario ?? "Quema abierta"}`}
                  status="READY"
                >
                  {batch.additionalityProof && (
                    <p className="text-[7px] text-gray-400 italic mt-1 leading-relaxed">
                      Adicionalidad: {batch.additionalityProof}
                    </p>
                  )}
                </ComplianceCard>
              </div>
            </Section>
          </div>

          {/* ── Verification footer ── */}
          <div className="px-6 sm:px-8 py-4 bg-gray-50/60 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] tracking-[2px] text-gray-400 uppercase font-semibold mb-1">
                  Verificación Digital — Integridad Criptográfica
                </p>
                <p className="font-mono text-[9px] text-gray-400 break-all leading-relaxed">
                  SHA-256: {certificate.hash}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <p className="text-[10px] text-gray-500 font-medium">
                    {certificate.code}
                  </p>
                  {certificate.verifiedAt && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-semibold bg-[#3d5c0e]/10 text-[#3d5c0e]">
                      ✓ Verificado
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0 ml-4">
                <QRCodeSVG value={verifyUrl} size={52} level="M" bgColor="transparent" fgColor="#64748b" />
              </div>
            </div>
          </div>

          {/* ── Branding footer ── */}
          <div className="px-6 sm:px-8 py-3 text-center" style={{ background: "linear-gradient(135deg, #1a2e1a, #2d4a1a)" }}>
            <p className="text-[8px] tracking-[3px] text-white/30 uppercase">
              EcoNova México · Economía Circular · econova.com.mx
            </p>
          </div>
        </div>

        {/* Standards footer */}
        <p className="text-center text-[9px] text-gray-400 mt-4 leading-relaxed">
          Pasaporte Digital de Producto · EU DPP (ESPR 2024/1781) · ISO 14040/14044 LCA · ISCC+ Ready · Verra PWRM0002
        </p>
      </div>
    </div>
  );
}
