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
      // Transporte
      transportMode: string | null;
      transportDistanceKm: number | null;
      transportFuelType: string | null;
      transportFuelL: number | null;
      transportCo2Kg: number | null;
      // Emisiones
      emissionsCo2Kg: number | null;
      emissionsCh4Kg: number | null;
      emissionsNoxKg: number | null;
      emissionsSoxKg: number | null;
      emissionsPmKg: number | null;
      emissionsWaterL: number | null;
      waterConsumedL: number | null;
      // Insumos
      catalystType: string | null;
      catalystKg: number | null;
      chemicalsUsed: string | null;
      // Residuos
      charDisposition: string | null;
      ashDisposition: string | null;
      wastewaterDisp: string | null;
      // ISCC+
      sustainabilityCertId: string | null;
      massBalancePeriod: string | null;
      allocMethod: string | null;
      // Verra
      plasticTypeCode: string | null;
      baselineScenario: string | null;
      additionalityProof: string | null;
      // GHG
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
      <h3 className="text-[9px] tracking-[2.5px] text-[#3d5c0e] font-bold uppercase mb-2.5">
        {title}
      </h3>
      {children}
    </section>
  );
}

// ─── Data row ───────────────────────────────────────────────────
function Row({ label, value, bold }: { label: string; value: string | number | null; bold?: boolean }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex justify-between items-baseline py-1 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 text-xs">{label}</span>
      <span className={`text-xs text-right ${bold ? "font-mono font-bold text-gray-900" : "text-gray-700"}`}>
        {value}
      </span>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────
export function CertificatePublic({ certificate }: CertificatePublicProps) {
  const { batch } = certificate;
  const oilL = batch.oilOutput ?? 0;
  const oilKg = batch.oilWeightKg ?? oilL * 0.85;
  const co2Avoided = batch.co2Avoided ?? 0;
  const cleanKg = batch.feedstockWeight * (1 - (batch.contaminationPct ?? 0) / 100);
  const charKg = Math.round(cleanKg * 0.10);
  const gasKg = Math.round(cleanKg - oilKg - charKg);
  const co2PerLiter = oilL > 0 && co2Avoided > 0 ? co2Avoided / oilL : 0;
  const baselinePerL = batch.co2Baseline && oilL > 0 ? batch.co2Baseline / oilL : 0;
  const projectPerL = batch.co2Project && oilL > 0 ? batch.co2Project / oilL : 0;
  const reductionPct = batch.co2Baseline && batch.co2Baseline > 0
    ? ((batch.co2Baseline - (batch.co2Project ?? 0)) / batch.co2Baseline * 100)
    : 0;

  // Energy balance calculations
  const dieselL = batch.dieselConsumedL ?? 0;
  const dieselMJ = dieselL * 0.85 * 45.6; // kg × MJ/kg (diesel LHV)
  const elecKwh = batch.electricityKwh ?? 0;
  const elecMJ = elecKwh * 3.6; // kWh → MJ
  const gasRecKg = batch.gasRecirculatedKg ?? 0;
  const gasMJ = gasRecKg * 38; // syngas ~38 MJ/kg
  const totalEnergyIn = dieselMJ + elecMJ + gasMJ;

  const oilMJperKg = batch.oilCalorificMJ ?? 43.2;
  const charMJperKg = batch.charCalorificMJ ?? 28.5;
  const oilEnergyMJ = oilKg * oilMJperKg;
  const charEnergyMJ = charKg * charMJperKg;
  const totalEnergyOut = oilEnergyMJ + charEnergyMJ;
  const energyRatio = totalEnergyIn > 0 ? totalEnergyOut / totalEnergyIn : 0;
  const hasEnergyData = dieselL > 0 || elecKwh > 0;

  const verifyUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verify/${certificate.code}`
    : `/verify/${certificate.code}`;

  const lab = batch.labResults.length > 0 ? batch.labResults[0] : null;

  return (
    <div className="min-h-screen bg-[#F5F3EE] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-xl">

        {/* ═══ PASSPORT CARD ═══ */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* ── Header band ── */}
          <div className="px-6 sm:px-8 pt-6 pb-4" style={{ background: "linear-gradient(135deg, #1a2e1a 0%, #2d4a1a 50%, #1a2e1a 100%)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] tracking-[4px] text-white/40 uppercase mb-1">
                  Pasaporte Digital de Producto
                </p>
                <h1 className="text-2xl font-bold text-white font-mono tracking-tight">
                  ECONOVA
                </h1>
                <p className="text-[8px] tracking-[3px] text-white/35 uppercase mt-0.5">
                  Economía Circular · México
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm">
                <QRCodeSVG value={verifyUrl} size={64} level="M" bgColor="transparent" fgColor="#ffffff" />
              </div>
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
              <span>
                {new Date(batch.date).toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* ── Content sections ── */}
          <div className="px-6 sm:px-8 py-6 space-y-6">

            {/* 1. Origen del Residuo */}
            <Section title="Origen del Residuo">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <Row label="Material" value={batch.feedstockType} bold />
                <Row label="Origen" value={batch.feedstockOrigin} bold />
                <Row label="Peso bruto" value={`${batch.feedstockWeight} kg`} />
                <Row label="Contaminación" value={batch.contaminationPct != null ? `~${batch.contaminationPct}%` : null} />
              </div>
            </Section>

            {/* 2. Proceso */}
            <Section title="Proceso de Transformación">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <Row label="Tecnología" value="Pirólisis catalítica" />
                <Row label="Reactor" value="DY-500" />
                {batch.maxReactorTemp != null && <Row label="Temp. máxima" value={`${batch.maxReactorTemp}°C`} bold />}
                {batch.durationMinutes != null && (
                  <Row label="Duración" value={`${Math.floor(batch.durationMinutes / 60)}h ${batch.durationMinutes % 60}m`} />
                )}
                {oilL > 0 && <Row label="Producción" value={`${oilL} litros`} bold />}
                {batch.yieldPercent != null && <Row label="Rendimiento" value={`${batch.yieldPercent.toFixed(1)}%`} bold />}
              </div>
            </Section>

            {/* 3. Balance de masa — Sankey */}
            {oilL > 0 && (
              <Section title="Balance de Masa">
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
              </Section>
            )}

            {/* 4. Balance Energético (ISO 14040 / ISCC+) */}
            {hasEnergyData && (
              <Section title="Balance Energético">
                {/* Energy ratio hero */}
                <div className="text-center py-2.5 mb-3 rounded-xl" style={{ background: "linear-gradient(135deg, rgba(232,112,10,0.06), rgba(232,112,10,0.02))" }}>
                  <div className="font-mono text-2xl font-bold" style={{ color: "#E8700A" }}>
                    {energyRatio.toFixed(1)}:1
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">relación energía producida / consumida</div>
                </div>

                {/* Inputs */}
                <div className="mb-2">
                  <p className="text-[8px] uppercase tracking-[1.5px] text-gray-400 font-semibold mb-1.5">Entradas</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {dieselL > 0 && <Row label="Diésel (arranque)" value={`${dieselL} L → ${dieselMJ.toFixed(0)} MJ`} />}
                    {elecKwh > 0 && <Row label="Electricidad" value={`${elecKwh.toFixed(1)} kWh → ${elecMJ.toFixed(0)} MJ`} />}
                    {gasRecKg > 0 && <Row label="Gas recirculado" value={`${gasRecKg} kg → ${gasMJ.toFixed(0)} MJ`} />}
                  </div>
                  <div className="mt-1 pt-1 border-t border-gray-100">
                    <Row label="Total energía entrada" value={`${totalEnergyIn.toFixed(0)} MJ`} bold />
                  </div>
                </div>

                {/* Outputs */}
                <div className="mb-2">
                  <p className="text-[8px] uppercase tracking-[1.5px] text-gray-400 font-semibold mb-1.5">Salidas (contenido energético)</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <Row label={`Aceite (${oilMJperKg} MJ/kg)`} value={`${Math.round(oilKg)} kg → ${oilEnergyMJ.toFixed(0)} MJ`} />
                    <Row label={`Char (${charMJperKg} MJ/kg)`} value={`${charKg} kg → ${charEnergyMJ.toFixed(0)} MJ`} />
                  </div>
                  <div className="mt-1 pt-1 border-t border-gray-100">
                    <Row label="Total energía salida" value={`${totalEnergyOut.toFixed(0)} MJ`} bold />
                  </div>
                </div>

                {/* Visual bar comparison */}
                <div className="space-y-1.5 mt-2">
                  <div>
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className="text-gray-500">Entrada</span>
                      <span className="font-mono text-[#E8700A] font-bold">{totalEnergyIn.toFixed(0)} MJ</span>
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
                      <span className="font-mono text-[#7C5CFC] font-bold">{totalEnergyOut.toFixed(0)} MJ</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#7C5CFC]/70" style={{ width: "100%" }} />
                    </div>
                  </div>
                </div>

                <p className="text-[8px] text-gray-400 italic mt-2">
                  Balance conforme a ISO 14040 · Entradas: combustible + electricidad · Salidas: contenido energético productos
                </p>
              </Section>
            )}

            {/* 5. Control de Calidad */}
            {lab && (
              <Section title={`Control de Calidad — ${lab.labName}`}>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {lab.labCertification && <Row label="Certificación" value={lab.labCertification} />}
                  <Row label="Azufre" value={lab.sulfurPercent != null ? `${lab.sulfurPercent}%` : null} />
                  <Row label="Contenido de agua" value={lab.waterContent != null ? `${lab.waterContent} PPM` : null} />
                  <Row label="Punto de inflamación" value={lab.flashPoint != null ? `${lab.flashPoint}°C` : null} />
                  <Row label="Densidad" value={lab.density15C != null ? `${lab.density15C} g/mL` : null} />
                  <Row label="Viscosidad" value={lab.viscosity40C != null ? `${lab.viscosity40C} mm²/s` : null} />
                  <Row label="Residuo carbón" value={lab.carbonResidue != null ? `${lab.carbonResidue}%` : null} />
                  <Row label="Cenizas" value={lab.ashContent != null ? `${lab.ashContent}%` : null} />
                  <Row label="Poder calorífico" value={lab.calorificMJ != null ? `${lab.calorificMJ} MJ/kg` : null} />
                </div>
                {lab.verdict && (
                  <div className="mt-2 flex items-center gap-1.5 text-[#3d5c0e]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M9 12l2 2 4-4" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    <span className="text-xs font-semibold">{lab.verdict}</span>
                  </div>
                )}
              </Section>
            )}

            {/* 6. Impacto Ambiental */}
            {co2Avoided > 0 && (
              <Section title="Impacto Ambiental — Ciclo de Vida">
                {/* Big number */}
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
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-gray-500">Quema abierta (baseline)</span>
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

                {/* Per-liter metric */}
                {co2PerLiter > 0 && (
                  <div className="mt-3 text-center text-[11px] text-gray-500">
                    Cada litro de aceite pirolítico evita{" "}
                    <span className="font-mono font-bold" style={{ color: "#3d5c0e" }}>{co2PerLiter.toFixed(2)} kg CO₂</span>{" "}
                    vs la quema abierta
                  </div>
                )}

                <p className="text-[8px] text-gray-400 italic mt-2">
                  Metodología: IPCC 2006 Vol. 2 &amp; 5 · IEA México 2023 · GWP: IPCC AR5
                </p>
              </Section>
            )}

            {/* 7. Transporte & Logística (ISO 14040 / ISCC+) */}
            {batch.transportDistanceKm != null && (
              <Section title="Transporte del Feedstock">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <Row label="Modo" value={batch.transportMode} />
                  <Row label="Distancia" value={`${batch.transportDistanceKm} km`} bold />
                  <Row label="Combustible" value={batch.transportFuelType} />
                  <Row label="Consumo" value={batch.transportFuelL != null ? `${batch.transportFuelL} L` : null} />
                  <Row label="CO₂ transporte" value={batch.transportCo2Kg != null ? `${batch.transportCo2Kg} kg` : null} bold />
                </div>
                <p className="text-[8px] text-gray-400 italic mt-1.5">
                  Ruta: {batch.feedstockOrigin} → Planta EcoNova
                </p>
              </Section>
            )}

            {/* 8. Emisiones de Proceso (ISO 14040) */}
            {batch.emissionsCo2Kg != null && (
              <Section title="Emisiones del Proceso">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <Row label="CO₂ directo" value={`${batch.emissionsCo2Kg} kg`} bold />
                  <Row label="CH₄ fugitivas" value={batch.emissionsCh4Kg != null ? `${batch.emissionsCh4Kg} kg` : null} />
                  <Row label="NOx" value={batch.emissionsNoxKg != null ? `${batch.emissionsNoxKg} kg` : null} />
                  <Row label="SOx" value={batch.emissionsSoxKg != null ? `${batch.emissionsSoxKg} kg` : null} />
                  <Row label="Partículas (PM)" value={batch.emissionsPmKg != null ? `${batch.emissionsPmKg} kg` : null} />
                </div>
                <div className="mt-1 pt-1 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <Row label="Agua consumida" value={batch.waterConsumedL != null ? `${batch.waterConsumedL} L` : null} />
                    <Row label="Agua residual" value={batch.emissionsWaterL != null ? `${batch.emissionsWaterL} L` : null} />
                  </div>
                </div>
              </Section>
            )}

            {/* 9. Gestión de Residuos & Insumos */}
            {(batch.catalystType || batch.charDisposition) && (
              <Section title="Insumos & Gestión de Residuos">
                <div className="grid grid-cols-1 gap-y-1">
                  <Row label="Catalizador" value={batch.catalystType} />
                  {batch.catalystKg != null && batch.catalystKg > 0 && (
                    <Row label="Cantidad catalizador" value={`${batch.catalystKg} kg`} />
                  )}
                  <Row label="Otros insumos" value={batch.chemicalsUsed} />
                </div>
                <div className="mt-2 pt-1.5 border-t border-gray-100">
                  <p className="text-[8px] uppercase tracking-[1.5px] text-gray-400 font-semibold mb-1">Disposición</p>
                  <div className="grid grid-cols-1 gap-y-1">
                    <Row label="Char / carbón" value={batch.charDisposition} />
                    <Row label="Cenizas" value={batch.ashDisposition} />
                    <Row label="Agua residual" value={batch.wastewaterDisp} />
                  </div>
                </div>
              </Section>
            )}

            {/* 10. Cumplimiento Normativo */}
            <Section title="Cumplimiento Normativo">
              <div className="space-y-2">
                {/* ISO 14040 */}
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#3d5c0e] mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-gray-700">ISO 14040/14044 — Análisis de Ciclo de Vida</p>
                    <p className="text-[8px] text-gray-400">Balance de masa, energético, emisiones, transporte, disposición de residuos</p>
                  </div>
                </div>
                {/* ISCC+ */}
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#2D8CF0] mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-gray-700">ISCC PLUS — Cadena de Custodia</p>
                    <p className="text-[8px] text-gray-400">
                      Balance: {batch.massBalancePeriod ?? "Por lote"} · Asignación: {batch.allocMethod ?? "Energético"}
                      {batch.sustainabilityCertId && ` · Cert: ${batch.sustainabilityCertId}`}
                    </p>
                  </div>
                </div>
                {/* Verra */}
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#7C5CFC] mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-gray-700">Verra Plastic Credit Standard (PWRM0002)</p>
                    <p className="text-[8px] text-gray-400">
                      Resina: {batch.plasticTypeCode ?? batch.feedstockType} · Baseline: {batch.baselineScenario ?? "Quema abierta"}
                    </p>
                    {batch.additionalityProof && (
                      <p className="text-[8px] text-gray-400 italic mt-0.5">
                        Adicionalidad: {batch.additionalityProof}
                      </p>
                    )}
                  </div>
                </div>
                {/* EU DPP */}
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#E8700A] mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-gray-700">EU Digital Product Passport (ESPR 2024/1781)</p>
                    <p className="text-[8px] text-gray-400">Trazabilidad completa: origen → proceso → producto → impacto</p>
                  </div>
                </div>
              </div>
            </Section>
          </div>

          {/* ── Verification footer ── */}
          <div className="px-6 sm:px-8 py-4 bg-gray-50/60 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] tracking-[2px] text-gray-400 uppercase font-semibold mb-1">
                  Verificación Digital
                </p>
                <p className="font-mono text-[9px] text-gray-400 break-all leading-relaxed">
                  SHA-256: {certificate.hash}
                </p>
                <p className="text-[9px] text-gray-400 mt-1">
                  Certificado: {certificate.code}
                  {certificate.verifiedAt && (
                    <span className="ml-2 text-[#3d5c0e]">
                      ✓ Verificado
                    </span>
                  )}
                </p>
              </div>
              <div className="flex-shrink-0 ml-4">
                <QRCodeSVG value={verifyUrl} size={48} level="M" bgColor="transparent" fgColor="#64748b" />
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
          Pasaporte Digital de Producto · EU DPP (ESPR) · ISO 14040/14044 LCA · ISCC+ Ready
        </p>
      </div>
    </div>
  );
}
