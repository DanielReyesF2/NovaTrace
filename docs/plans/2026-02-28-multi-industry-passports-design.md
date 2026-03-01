# Multi-Industry Traceability Passports — Design Document

**Date:** 2026-02-28
**Context:** Post-FLII 2026 opportunity — scale EcoNova's traceability passport to other industries
**Goal:** 6 demo passports as public pages in NovaTrace, later ported to Nova AI platform

## Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scope | Demo pages in NovaTrace (not multi-tenant yet) | NovaTrace stays EcoNova-only; demos validate concept before Nova AI integration |
| Access | Public routes at `/demo/[industry]` | Easy to share links, same Railway infra |
| Branding | Co-branding (fictitious company + "Powered by EcoNova") | Shows white-label potential |
| Sections | Adapted per industry | Each value chain has unique steps worth highlighting |
| Data | Realistic fictitious data | Credible demos for investors and potential clients |
| Architecture | Generic `<IndustryPassport>` component with config | Reusable, portable to Nova AI |

## Architecture

### File Structure

```
src/app/(public)/demo/
  [industry]/page.tsx              # Server Component per industry (6 pages)

src/lib/demo/
  types.ts                         # TypeScript types for passport config
  industries/
    limpieza.ts                    # EcoClean México
    exhibidores.ts                 # DisplayTech
    textil.ts                      # ReThread
    muebles.ts                     # PlastiMueble
    packaging.ts                   # BioEnvase
    construccion.ts                # EcoBloques MX

src/components/demo/
  IndustryPassport.tsx             # Main generic component
  PassportHeader.tsx               # Co-branded header (company colors + name)
  PassportFooter.tsx               # Footer: QR + hash + "Powered by EcoNova"
  sections/
    OriginSection.tsx              # Raw material origin
    ProcessSection.tsx             # Transformation process (steps)
    MaterialFlowSection.tsx        # Sankey/flow diagram adapted
    QualitySection.tsx             # Quality control / certifications
    ImpactSection.tsx              # Environmental impact comparison
    CircularitySection.tsx         # Circularity metrics (return cycles, % recycled)
    ComplianceSection.tsx          # Regulatory compliance
```

### Core Type

```typescript
type IndustryPassportConfig = {
  industry: string
  branding: {
    companyName: string
    tagline: string
    primaryColor: string
    accentColor: string
  }
  product: {
    name: string
    code: string
    date: string
    heroValue: number | string
    heroUnit: string
    heroLabel: string
  }
  sections: SectionConfig[]
  impact: {
    co2Avoided: number
    materialDiverted: number
    circularityIndex: number       // 0-100
  }
  compliance: string[]
  hash: string
  qrUrl: string
}

type SectionConfig = {
  type: 'origin' | 'process' | 'material-flow' | 'quality' | 'impact' | 'circularity' | 'compliance'
  title: string
  icon: string
  data: Record<string, any>        // Section-specific data
}
```

### Routing

Each industry page is a Server Component at `/demo/[industry]`:

- `/demo/limpieza` → EcoClean México
- `/demo/exhibidores` → DisplayTech
- `/demo/textil` → ReThread
- `/demo/muebles` → PlastiMueble
- `/demo/packaging` → BioEnvase
- `/demo/construccion` → EcoBloques MX

These routes must be added to `PUBLIC_ROUTES` in `src/middleware.ts`.

### Visual Design

- Same dark theme as current NovaTrace passports
- Header: gradient using `branding.primaryColor`, company name, "Pasaporte Digital de Producto"
- Body: sections rendered from `sections[]` array
- Footer: "Powered by EcoNova · econova.com.mx", QR code (qrcode.react), SHA-256 hash display
- Responsive: mobile-first, single column

## Industry Data

### 1. EcoClean México — Cleaning Products (Returnable Containers)

- **Product:** Desengrasante Industrial BioCleen 5L
- **Code:** ECL/B/02/RET/012
- **Hero:** 47 ciclos de retorno
- **Colors:** #2E7D32 (green), #66BB6A (light green)
- **Sections:**
  1. Origin: Biodegradable ingredients, supplier Querétaro
  2. Process: Formulation + bottling, Toluca plant
  3. Circularity: HDPE 5L container, 47 returns, 3 industrial washes, ~60 cycle lifespan
  4. Quality: pH 7.2, 98% biodegradability, phosphate-free
  5. Impact: 12.8 kg CO2 avoided vs 47 disposable containers, 23.5 kg plastic avoided
- **Circularity Index:** 78%

### 2. DisplayTech — Recycled Plastic Displays

- **Product:** Exhibidor Modular Punto de Venta 120x80cm
- **Code:** DTX/B/01/EXH/034
- **Hero:** 18.4 kg plástico reciclado
- **Colors:** #1565C0 (blue), #42A5F5 (light blue)
- **Sections:**
  1. Origin: 85% HDPE post-industrial (caps), 15% PP post-consumer (containers)
  2. Process: Shredding → washing → sheet extrusion → thermoforming → assembly
  3. Material Flow: Input 21.6 kg → 18.4 kg recycled + 3.2 kg virgin (UV stabilizers)
  4. Quality: Flexural strength 32 MPa, weight 4.2 kg, 5+ year lifespan
  5. Impact: 14.7 kg CO2 avoided vs virgin acrylic, 18.4 kg plastic diverted
- **Circularity Index:** 85%

### 3. ReThread — Recycled PET Textiles

- **Product:** Polo Corporativo EcoFiber — Talla M
- **Code:** RTH/B/03/TEX/089
- **Hero:** 12 botellas PET recicladas
- **Colors:** #6A1B9A (purple), #AB47BC (light purple)
- **Sections:**
  1. Origin: Post-consumer PET, collection center Guadalajara, 600 bottles/batch
  2. Process: Collection → shredding → washing → pelletizing → spinning → weaving → sewing
  3. Composition: 65% recycled polyester (rPET), 35% organic cotton
  4. Quality: GRS certified, OEKO-TEX Standard 100
  5. Impact: 2.1 kg CO2 avoided vs virgin polyester, 0.36 kg PET diverted
- **Circularity Index:** 65%

### 4. PlastiMueble — Recycled Plastic Furniture

- **Product:** Banca Urbana Parque 180cm — Gris Grafito
- **Code:** PMB/B/01/MUE/017
- **Hero:** 32 kg plástico reciclado
- **Colors:** #37474F (dark gray), #78909C (gray)
- **Sections:**
  1. Origin: HDPE/PP post-consumer mix, collection plant Monterrey
  2. Process: Shredding → washing → drying → profile extrusion → cutting → assembly
  3. Material Flow: 35 kg input → 32 kg product + 2.5 kg scrap (re-enters) + 0.5 kg waste
  4. Quality: 500 kg load capacity, 25-year warranty, UV resistant
  5. Impact: 48.6 kg CO2 avoided vs tropical wood bench, 32 kg plastic diverted
- **Circularity Index:** 92%

### 5. BioEnvase — Sustainable Packaging

- **Product:** Charola Termoformada 500ml — Grado Alimentario
- **Code:** BEV/B/02/PKG/156
- **Hero:** 100% reciclable
- **Colors:** #E65100 (orange), #FF9800 (light orange)
- **Sections:**
  1. Origin: 70% rPET + 30% virgin food-grade PET
  2. Process: Supercritical wash → pelletizing → sheet extrusion → thermoforming
  3. Quality: FDA 21 CFR 177.1630, COFEPRIS approved, direct food contact
  4. End of Life: 100% recyclable in conventional PET stream, NOM-161 marking
  5. Impact: 0.8 kg CO2 avoided per tray vs expanded PS, 0.028 kg PET diverted
- **Circularity Index:** 70%

### 6. EcoBloques MX — Construction Materials

- **Product:** Bloque Estructural EcoBlock 40x20x15cm
- **Code:** EBQ/B/01/CON/043
- **Hero:** 4.8 kg plástico reciclado
- **Colors:** #4E342E (brown), #8D6E63 (light brown)
- **Sections:**
  1. Origin: Post-consumer polyolefin mix, municipal collection León, Gto.
  2. Process: Shredding → mixing with sand/cement (40/35/25) → pressing → 28-day curing
  3. Properties: Compressive strength 65 kg/cm², density 1,450 kg/m³, thermal R-1.2
  4. Compliance: NMX-C-441, NOM-018-ENER
  5. Impact: 3.2 kg CO2 avoided vs conventional concrete block, 4.8 kg plastic diverted
- **Circularity Index:** 88%

## Non-Goals

- No database changes (all data is hardcoded in config files)
- No authentication required (public demo pages)
- No certificate generation API (these are static demos)
- No PDF generation
- No multi-tenant system (that's for Nova AI later)

## Future: Nova AI Integration

This component architecture (`IndustryPassportConfig` + `<IndustryPassport>`) is designed to be portable to the Nova AI platform where:
- Companies create their own passport configs via UI/API
- Data comes from database instead of hardcoded files
- Branding is fully customizable
- QR codes link to the Nova AI verification system
