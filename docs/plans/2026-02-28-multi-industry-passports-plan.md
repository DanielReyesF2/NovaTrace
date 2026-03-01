# Multi-Industry Traceability Passports — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create 6 demo traceability passports for different industries as public pages in NovaTrace, using a generic configurable component with co-branding.

**Architecture:** A single `<IndustryPassport>` React client component renders passports from a typed config object. Each industry has a data file exporting its config. Pages at `/demo/[industry]` are public Server Components that import the config and render the component. Sections are modular sub-components rendered from the config's `sections[]` array.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, qrcode.react (already installed)

**Design Doc:** `docs/plans/2026-02-28-multi-industry-passports-design.md`

---

## Task 1: Types and middleware

**Files:**
- Create: `src/lib/demo/types.ts`
- Modify: `src/middleware.ts:6-11`

**Step 1: Create the TypeScript types file**

Create `src/lib/demo/types.ts`:

```typescript
// Types for multi-industry demo passports

export interface PassportBranding {
  companyName: string;
  tagline: string;
  primaryColor: string;   // hex, e.g. "#2E7D32"
  accentColor: string;    // hex, e.g. "#66BB6A"
}

export interface PassportProduct {
  name: string;
  code: string;
  date: string;           // ISO date string
  heroValue: number | string;
  heroUnit: string;
  heroLabel: string;
}

export interface PassportImpact {
  co2Avoided: number;       // kg CO2eq
  materialDiverted: number; // kg
  circularityIndex: number; // 0-100
  comparisonLabel: string;  // e.g. "vs envases desechables"
  comparisonBaseline: number; // kg CO2 of baseline
}

export interface OriginData {
  materials: Array<{ name: string; percentage: number; source: string }>;
  location: string;
  supplier?: string;
}

export interface ProcessStep {
  name: string;
  detail?: string;
}

export interface ProcessData {
  technology: string;
  facility: string;
  steps: ProcessStep[];
}

export interface MaterialFlowData {
  inputs: Array<{ label: string; kg: number; color: string }>;
  outputs: Array<{ label: string; kg: number; color: string }>;
}

export interface QualityData {
  metrics: Array<{ label: string; value: string }>;
  certifications: string[];
  verdict?: string;
}

export interface CircularityData {
  type: "returnable" | "recycled-content" | "end-of-life" | "composite";
  metrics: Array<{ label: string; value: string; highlight?: boolean }>;
  description?: string;
}

export interface ComplianceItem {
  standard: string;
  description: string;
  color: string;          // dot color hex
}

export type SectionConfig =
  | { type: "origin"; title: string; data: OriginData }
  | { type: "process"; title: string; data: ProcessData }
  | { type: "material-flow"; title: string; data: MaterialFlowData }
  | { type: "quality"; title: string; data: QualityData }
  | { type: "impact"; title: string; data: PassportImpact }
  | { type: "circularity"; title: string; data: CircularityData }
  | { type: "compliance"; title: string; data: { items: ComplianceItem[] } };

export interface IndustryPassportConfig {
  industry: string;
  slug: string;
  branding: PassportBranding;
  product: PassportProduct;
  sections: SectionConfig[];
  impact: PassportImpact;
  compliance: ComplianceItem[];
  hash: string;            // pre-computed SHA-256 for demo display
}
```

**Step 2: Add `/demo/` to PUBLIC_ROUTES in middleware**

In `src/middleware.ts`, add `"/demo/"` to the `PUBLIC_ROUTES` array (line 10, before the closing bracket):

```typescript
const PUBLIC_ROUTES = [
  "/api/auth/login",
  "/api/certificates/",
  "/api/stats",
  "/verify/",
  "/login",
  "/demo/",      // ← add this line
];
```

**Step 3: Commit**

```bash
git add src/lib/demo/types.ts src/middleware.ts
git commit -m "feat(demo): add passport config types and public route"
```

---

## Task 2: Passport shell components (Header, Footer, Section wrapper)

**Files:**
- Create: `src/components/demo/PassportHeader.tsx`
- Create: `src/components/demo/PassportFooter.tsx`

**Step 1: Create PassportHeader**

Create `src/components/demo/PassportHeader.tsx`. This is the co-branded header with gradient using the company's `primaryColor`. Mirror the visual style from `CertificatePublic.tsx:153-169` but with configurable colors and company name:

```tsx
"use client";

import { QRCodeSVG } from "qrcode.react";
import type { PassportBranding } from "@/lib/demo/types";

interface PassportHeaderProps {
  branding: PassportBranding;
  qrUrl: string;
}

export function PassportHeader({ branding, qrUrl }: PassportHeaderProps) {
  return (
    <div
      className="px-6 sm:px-8 pt-6 pb-4"
      style={{
        background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.accentColor} 50%, ${branding.primaryColor} 100%)`,
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] tracking-[4px] text-white/40 uppercase mb-1">
            Pasaporte Digital de Producto
          </p>
          <h1 className="text-2xl font-bold text-white font-mono tracking-tight uppercase">
            {branding.companyName}
          </h1>
          <p className="text-[8px] tracking-[3px] text-white/35 uppercase mt-0.5">
            {branding.tagline}
          </p>
        </div>
        <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm">
          <QRCodeSVG value={qrUrl} size={64} level="M" bgColor="transparent" fgColor="#ffffff" />
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Create PassportFooter**

Create `src/components/demo/PassportFooter.tsx`. Has verification section + "Powered by EcoNova" band. Mirror style from `CertificatePublic.tsx:504-540`:

```tsx
"use client";

import { QRCodeSVG } from "qrcode.react";

interface PassportFooterProps {
  hash: string;
  code: string;
  qrUrl: string;
  primaryColor: string;
}

export function PassportFooter({ hash, code, qrUrl, primaryColor }: PassportFooterProps) {
  return (
    <>
      {/* Verification */}
      <div className="px-6 sm:px-8 py-4 bg-gray-50/60 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[8px] tracking-[2px] text-gray-400 uppercase font-semibold mb-1">
              Verificación Digital
            </p>
            <p className="font-mono text-[9px] text-gray-400 break-all leading-relaxed">
              SHA-256: {hash}
            </p>
            <p className="text-[9px] text-gray-400 mt-1">
              Código: {code}
            </p>
          </div>
          <div className="flex-shrink-0 ml-4">
            <QRCodeSVG value={qrUrl} size={48} level="M" bgColor="transparent" fgColor="#64748b" />
          </div>
        </div>
      </div>

      {/* Powered by EcoNova */}
      <div
        className="px-6 sm:px-8 py-3 text-center"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
      >
        <p className="text-[8px] tracking-[3px] text-white/40 uppercase">
          Powered by EcoNova · Economía Circular · econova.com.mx
        </p>
      </div>
    </>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/demo/PassportHeader.tsx src/components/demo/PassportFooter.tsx
git commit -m "feat(demo): add PassportHeader and PassportFooter components"
```

---

## Task 3: Section components

**Files:**
- Create: `src/components/demo/sections/OriginSection.tsx`
- Create: `src/components/demo/sections/ProcessSection.tsx`
- Create: `src/components/demo/sections/MaterialFlowSection.tsx`
- Create: `src/components/demo/sections/QualitySection.tsx`
- Create: `src/components/demo/sections/ImpactSection.tsx`
- Create: `src/components/demo/sections/CircularitySection.tsx`
- Create: `src/components/demo/sections/ComplianceSection.tsx`

All section components follow the same pattern from `CertificatePublic.tsx`:
- `Section` wrapper with title (line 82-91 style)
- `Row` for key-value pairs (line 94-104 style)
- Consistent styling: `text-[9px]` tracking, gray-500 labels, etc.

**Step 1: Create all 7 section components**

Each section component receives its typed `data` prop and renders rows/visuals.

`src/components/demo/sections/OriginSection.tsx`:
```tsx
import type { OriginData } from "@/lib/demo/types";

export function OriginSection({ data }: { data: OriginData }) {
  return (
    <div className="space-y-2">
      {data.materials.map((m, i) => (
        <div key={i} className="flex justify-between items-baseline py-1 border-b border-gray-100 last:border-0">
          <span className="text-gray-500 text-xs">{m.name}</span>
          <span className="text-xs text-right text-gray-700">
            {m.percentage}% · {m.source}
          </span>
        </div>
      ))}
      <div className="flex justify-between items-baseline py-1">
        <span className="text-gray-500 text-xs">Ubicación</span>
        <span className="text-xs font-mono font-bold text-gray-900">{data.location}</span>
      </div>
      {data.supplier && (
        <div className="flex justify-between items-baseline py-1">
          <span className="text-gray-500 text-xs">Proveedor</span>
          <span className="text-xs text-gray-700">{data.supplier}</span>
        </div>
      )}
    </div>
  );
}
```

`src/components/demo/sections/ProcessSection.tsx`:
```tsx
import type { ProcessData } from "@/lib/demo/types";

export function ProcessSection({ data }: { data: ProcessData }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
        <div className="flex justify-between items-baseline py-1 border-b border-gray-100 col-span-1">
          <span className="text-gray-500 text-xs">Tecnología</span>
          <span className="text-xs font-mono font-bold text-gray-900">{data.technology}</span>
        </div>
        <div className="flex justify-between items-baseline py-1 border-b border-gray-100 col-span-1">
          <span className="text-gray-500 text-xs">Planta</span>
          <span className="text-xs text-gray-700">{data.facility}</span>
        </div>
      </div>
      {/* Process steps as flow */}
      <div className="flex flex-wrap items-center gap-1">
        {data.steps.map((step, i) => (
          <span key={i} className="flex items-center">
            <span className="text-[10px] bg-gray-100 text-gray-700 rounded-md px-2 py-0.5 font-medium">
              {step.name}
            </span>
            {i < data.steps.length - 1 && (
              <span className="text-gray-300 mx-0.5 text-xs">→</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
```

`src/components/demo/sections/MaterialFlowSection.tsx`:
```tsx
import type { MaterialFlowData } from "@/lib/demo/types";

export function MaterialFlowSection({ data }: { data: MaterialFlowData }) {
  const totalIn = data.inputs.reduce((s, i) => s + i.kg, 0);
  const totalOut = data.outputs.reduce((s, o) => s + o.kg, 0);

  return (
    <div className="bg-gray-50/80 rounded-xl p-3 -mx-1">
      <div className="grid grid-cols-2 gap-4">
        {/* Inputs */}
        <div>
          <p className="text-[8px] uppercase tracking-[1.5px] text-gray-400 font-semibold mb-1.5">Entrada</p>
          {data.inputs.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 mb-1">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-[10px] text-gray-600">{item.label}</span>
              <span className="text-[10px] font-mono font-bold text-gray-800 ml-auto">{item.kg} kg</span>
            </div>
          ))}
          <div className="border-t border-gray-200 mt-1 pt-1">
            <span className="text-[10px] font-mono font-bold text-gray-900">Total: {totalIn} kg</span>
          </div>
        </div>
        {/* Outputs */}
        <div>
          <p className="text-[8px] uppercase tracking-[1.5px] text-gray-400 font-semibold mb-1.5">Salida</p>
          {data.outputs.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 mb-1">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-[10px] text-gray-600">{item.label}</span>
              <span className="text-[10px] font-mono font-bold text-gray-800 ml-auto">{item.kg} kg</span>
            </div>
          ))}
          <div className="border-t border-gray-200 mt-1 pt-1">
            <span className="text-[10px] font-mono font-bold text-gray-900">Total: {totalOut} kg</span>
          </div>
        </div>
      </div>
      {/* Efficiency bar */}
      <div className="mt-2 pt-2 border-t border-gray-200">
        <div className="flex justify-between text-[10px] mb-0.5">
          <span className="text-gray-500">Eficiencia de material</span>
          <span className="font-mono font-bold text-gray-800">{totalIn > 0 ? ((totalOut / totalIn) * 100).toFixed(1) : 0}%</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500/70"
            style={{ width: `${totalIn > 0 ? (totalOut / totalIn) * 100 : 0}%` }}
          />
        </div>
      </div>
    </div>
  );
}
```

`src/components/demo/sections/QualitySection.tsx`:
```tsx
import type { QualityData } from "@/lib/demo/types";

export function QualitySection({ data }: { data: QualityData }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {data.metrics.map((m, i) => (
          <div key={i} className="flex justify-between items-baseline py-1 border-b border-gray-100 last:border-0">
            <span className="text-gray-500 text-xs">{m.label}</span>
            <span className="text-xs font-mono font-bold text-gray-900">{m.value}</span>
          </div>
        ))}
      </div>
      {data.certifications.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {data.certifications.map((cert, i) => (
            <span key={i} className="text-[9px] bg-emerald-50 text-emerald-700 rounded-md px-2 py-0.5 font-medium">
              {cert}
            </span>
          ))}
        </div>
      )}
      {data.verdict && (
        <div className="mt-2 flex items-center gap-1.5 text-emerald-700">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          <span className="text-xs font-semibold">{data.verdict}</span>
        </div>
      )}
    </div>
  );
}
```

`src/components/demo/sections/ImpactSection.tsx`:
```tsx
import type { PassportImpact } from "@/lib/demo/types";

export function ImpactSection({ data, accentColor }: { data: PassportImpact; accentColor: string }) {
  const reductionPct = data.comparisonBaseline > 0
    ? (data.co2Avoided / data.comparisonBaseline * 100)
    : 0;

  return (
    <div>
      {/* Big number */}
      <div className="text-center py-3 mb-3 rounded-xl" style={{ background: `linear-gradient(135deg, ${accentColor}10, ${accentColor}05)` }}>
        <div className="font-mono text-3xl font-bold" style={{ color: accentColor }}>
          {data.co2Avoided.toFixed(1)}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">kg CO₂eq evitados</div>
        {reductionPct > 0 && (
          <div className="text-[10px] font-semibold mt-1" style={{ color: accentColor }}>
            ↓ {reductionPct.toFixed(0)}% {data.comparisonLabel}
          </div>
        )}
      </div>

      {/* Material diverted */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center py-2 bg-gray-50 rounded-lg">
          <div className="font-mono text-lg font-bold text-gray-800">{data.materialDiverted}</div>
          <div className="text-[10px] text-gray-500">kg material desviado</div>
        </div>
        <div className="text-center py-2 bg-gray-50 rounded-lg">
          <div className="font-mono text-lg font-bold" style={{ color: accentColor }}>{data.circularityIndex}%</div>
          <div className="text-[10px] text-gray-500">índice de circularidad</div>
        </div>
      </div>

      <p className="text-[8px] text-gray-400 italic mt-2">
        Metodología: ISO 14040/14044 · Comparación con producto convencional equivalente
      </p>
    </div>
  );
}
```

`src/components/demo/sections/CircularitySection.tsx`:
```tsx
import type { CircularityData } from "@/lib/demo/types";

export function CircularitySection({ data, accentColor }: { data: CircularityData; accentColor: string }) {
  return (
    <div>
      {data.description && (
        <p className="text-xs text-gray-600 mb-2">{data.description}</p>
      )}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {data.metrics.map((m, i) => (
          <div key={i} className="flex justify-between items-baseline py-1 border-b border-gray-100 last:border-0">
            <span className="text-gray-500 text-xs">{m.label}</span>
            <span className={`text-xs text-right ${m.highlight ? "font-mono font-bold" : "text-gray-700"}`} style={m.highlight ? { color: accentColor } : undefined}>
              {m.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

`src/components/demo/sections/ComplianceSection.tsx`:
```tsx
import type { ComplianceItem } from "@/lib/demo/types";

export function ComplianceSection({ data }: { data: { items: ComplianceItem[] } }) {
  return (
    <div className="space-y-2">
      {data.items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: item.color }} />
          <div>
            <p className="text-[10px] font-semibold text-gray-700">{item.standard}</p>
            <p className="text-[8px] text-gray-400">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/demo/sections/
git commit -m "feat(demo): add 7 section components for industry passports"
```

---

## Task 4: IndustryPassport main component

**Files:**
- Create: `src/components/demo/IndustryPassport.tsx`

**Step 1: Create the main component**

This component orchestrates header + product hero + sections + footer. It reads the config and renders each section from the `sections[]` array. Follow the card structure from `CertificatePublic.tsx:145-543` (white card, rounded-2xl, shadow-xl, cream background).

```tsx
"use client";

import { PassportHeader } from "./PassportHeader";
import { PassportFooter } from "./PassportFooter";
import { OriginSection } from "./sections/OriginSection";
import { ProcessSection } from "./sections/ProcessSection";
import { MaterialFlowSection } from "./sections/MaterialFlowSection";
import { QualitySection } from "./sections/QualitySection";
import { ImpactSection } from "./sections/ImpactSection";
import { CircularitySection } from "./sections/CircularitySection";
import { ComplianceSection } from "./sections/ComplianceSection";
import type { IndustryPassportConfig, SectionConfig } from "@/lib/demo/types";

function SectionWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[9px] tracking-[2.5px] text-gray-500 font-bold uppercase mb-2.5">
        {title}
      </h3>
      {children}
    </section>
  );
}

function renderSection(section: SectionConfig, accentColor: string) {
  switch (section.type) {
    case "origin":
      return <OriginSection data={section.data} />;
    case "process":
      return <ProcessSection data={section.data} />;
    case "material-flow":
      return <MaterialFlowSection data={section.data} />;
    case "quality":
      return <QualitySection data={section.data} />;
    case "impact":
      return <ImpactSection data={section.data} accentColor={accentColor} />;
    case "circularity":
      return <CircularitySection data={section.data} accentColor={accentColor} />;
    case "compliance":
      return <ComplianceSection data={section.data} />;
    default:
      return null;
  }
}

export function IndustryPassport({ config }: { config: IndustryPassportConfig }) {
  const qrUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/demo/${config.slug}`;

  return (
    <div className="min-h-screen bg-[#F5F3EE] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <PassportHeader branding={config.branding} qrUrl={qrUrl} />

          {/* Product Hero */}
          <div className="px-6 sm:px-8 py-5 border-b border-gray-100">
            <div className="flex items-baseline gap-2 mb-1">
              <span
                className="font-mono text-4xl font-bold tracking-tight"
                style={{ color: config.branding.accentColor }}
              >
                {config.product.heroValue}
              </span>
              <span className="text-sm text-gray-500">{config.product.heroUnit}</span>
            </div>
            <p className="text-xs text-gray-600 mb-1">{config.product.name}</p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="font-mono">{config.product.code}</span>
              <span>·</span>
              <span>
                {new Date(config.product.date).toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Sections */}
          <div className="px-6 sm:px-8 py-6 space-y-6">
            {config.sections.map((section, i) => (
              <SectionWrapper key={i} title={section.title}>
                {renderSection(section, config.branding.accentColor)}
              </SectionWrapper>
            ))}
          </div>

          {/* Footer */}
          <PassportFooter
            hash={config.hash}
            code={config.product.code}
            qrUrl={qrUrl}
            primaryColor={config.branding.primaryColor}
          />
        </div>

        {/* Standards line */}
        <p className="text-center text-[9px] text-gray-400 mt-4 leading-relaxed">
          Pasaporte Digital de Producto · EU DPP (ESPR) · ISO 14040/14044 LCA
        </p>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/demo/IndustryPassport.tsx
git commit -m "feat(demo): add IndustryPassport main component"
```

---

## Task 5: Industry data files (3 of 6)

**Files:**
- Create: `src/lib/demo/industries/limpieza.ts`
- Create: `src/lib/demo/industries/exhibidores.ts`
- Create: `src/lib/demo/industries/textil.ts`

**Step 1: Create limpieza.ts (EcoClean México)**

Each data file exports a `const config: IndustryPassportConfig` with all the realistic fictitious data from the design doc. Use the `IndustryPassportConfig` type from `@/lib/demo/types`.

Key data points (from design doc):
- Limpieza: heroValue=47, heroUnit="ciclos de retorno", primaryColor="#2E7D32", co2Avoided=12.8, circularityIndex=78
- Exhibidores: heroValue=18.4, heroUnit="kg plástico reciclado", primaryColor="#1565C0", co2Avoided=14.7, circularityIndex=85
- Textil: heroValue=12, heroUnit="botellas PET recicladas", primaryColor="#6A1B9A", co2Avoided=2.1, circularityIndex=65

Each config must include 5 sections appropriate to the industry (origin, process, circularity/material-flow, quality, impact) plus a compliance section.

SHA-256 hashes should be realistic-looking 64-char hex strings (can be hardcoded constants).

**Step 2: Create exhibidores.ts (DisplayTech)**

Same pattern.

**Step 3: Create textil.ts (ReThread)**

Same pattern.

**Step 4: Commit**

```bash
git add src/lib/demo/industries/limpieza.ts src/lib/demo/industries/exhibidores.ts src/lib/demo/industries/textil.ts
git commit -m "feat(demo): add data for limpieza, exhibidores, textil industries"
```

---

## Task 6: Industry data files (3 of 6)

**Files:**
- Create: `src/lib/demo/industries/muebles.ts`
- Create: `src/lib/demo/industries/packaging.ts`
- Create: `src/lib/demo/industries/construccion.ts`

**Step 1: Create muebles.ts (PlastiMueble)**

Key data:
- Muebles: heroValue=32, heroUnit="kg plástico reciclado", primaryColor="#37474F", co2Avoided=48.6, circularityIndex=92
- Packaging: heroValue="100%", heroUnit="reciclable", primaryColor="#E65100", co2Avoided=0.8, circularityIndex=70
- Construcción: heroValue=4.8, heroUnit="kg plástico reciclado", primaryColor="#4E342E", co2Avoided=3.2, circularityIndex=88

**Step 2: Create packaging.ts (BioEnvase)**

Same pattern.

**Step 3: Create construccion.ts (EcoBloques MX)**

Same pattern.

**Step 4: Commit**

```bash
git add src/lib/demo/industries/muebles.ts src/lib/demo/industries/packaging.ts src/lib/demo/industries/construccion.ts
git commit -m "feat(demo): add data for muebles, packaging, construccion industries"
```

---

## Task 7: Demo pages (all 6 routes)

**Files:**
- Create: `src/app/(public)/demo/[industry]/page.tsx`

**Step 1: Create the dynamic route page**

This is a single Server Component that handles all 6 industries via a dynamic `[industry]` segment. It imports the config based on the slug, and returns `<IndustryPassport config={config} />` or a 404 via `notFound()`.

```tsx
import { notFound } from "next/navigation";
import { IndustryPassport } from "@/components/demo/IndustryPassport";

// Import all industry configs
import { config as limpieza } from "@/lib/demo/industries/limpieza";
import { config as exhibidores } from "@/lib/demo/industries/exhibidores";
import { config as textil } from "@/lib/demo/industries/textil";
import { config as muebles } from "@/lib/demo/industries/muebles";
import { config as packaging } from "@/lib/demo/industries/packaging";
import { config as construccion } from "@/lib/demo/industries/construccion";

const CONFIGS: Record<string, typeof limpieza> = {
  limpieza,
  exhibidores,
  textil,
  muebles,
  packaging,
  construccion,
};

export function generateStaticParams() {
  return Object.keys(CONFIGS).map((industry) => ({ industry }));
}

export function generateMetadata({ params }: { params: { industry: string } }) {
  const config = CONFIGS[params.industry];
  if (!config) return { title: "Demo no encontrado" };
  return {
    title: `${config.branding.companyName} — Pasaporte de Trazabilidad`,
    description: `Demo de pasaporte digital para ${config.industry}: ${config.product.name}`,
  };
}

export default function DemoPage({ params }: { params: { industry: string } }) {
  const config = CONFIGS[params.industry];
  if (!config) return notFound();
  return <IndustryPassport config={config} />;
}
```

**Step 2: Commit**

```bash
git add src/app/\(public\)/demo/
git commit -m "feat(demo): add dynamic demo page route for 6 industries"
```

---

## Task 8: Build verification and visual QA

**Step 1: Run the build**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors. Fix any issues.

**Step 2: Run dev server and check each route**

```bash
npm run dev
```

Open in browser and verify all 6 routes:
- `http://localhost:3000/demo/limpieza`
- `http://localhost:3000/demo/exhibidores`
- `http://localhost:3000/demo/textil`
- `http://localhost:3000/demo/muebles`
- `http://localhost:3000/demo/packaging`
- `http://localhost:3000/demo/construccion`

Verify for each:
- Header shows co-branded gradient with correct company name/colors
- Product hero shows correct hero value/unit
- All 5+ sections render with data
- Footer shows "Powered by EcoNova" + QR code + hash
- No 404s, no blank sections
- Responsive on mobile width

**Step 3: Fix any issues found, then final commit**

```bash
git add -A
git commit -m "fix(demo): address visual QA issues from build verification"
```

---

## Summary

| Task | What | Files |
|------|------|-------|
| 1 | Types + middleware | `types.ts`, `middleware.ts` |
| 2 | Header + Footer | `PassportHeader.tsx`, `PassportFooter.tsx` |
| 3 | 7 section components | `sections/*.tsx` |
| 4 | Main IndustryPassport | `IndustryPassport.tsx` |
| 5 | 3 industry data files | `limpieza.ts`, `exhibidores.ts`, `textil.ts` |
| 6 | 3 industry data files | `muebles.ts`, `packaging.ts`, `construccion.ts` |
| 7 | Dynamic route page | `[industry]/page.tsx` |
| 8 | Build + visual QA | — |

Total: ~20 files, 0 database changes, 0 API routes.
