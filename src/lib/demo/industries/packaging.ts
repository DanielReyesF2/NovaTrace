import type {
  IndustryPassportConfig,
  PassportImpact,
  ComplianceItem,
} from "../types";

const impact: PassportImpact = {
  co2Avoided: 0.8,
  materialDiverted: 0.028,
  circularityIndex: 70,
  comparisonLabel: "vs poliestireno expandido",
  comparisonBaseline: 1.1,
};

const compliance: ComplianceItem[] = [
  {
    standard: "FDA 21 CFR 177.1630 — Contacto Alimentario",
    description:
      "Aprobación para contacto directo con alimentos, migración dentro de límites",
    color: "#E65100",
  },
  {
    standard: "NOM-161-SEMARNAT — Residuos de Envases",
    description:
      "Marcado y clasificación para reciclaje conforme a norma mexicana",
    color: "#2E7D32",
  },
  {
    standard: "ISO 14040/14044 — Análisis de Ciclo de Vida",
    description:
      "Comparación vs charola de poliestireno expandido convencional",
    color: "#1565C0",
  },
  {
    standard: "EU DPP (ESPR 2024/1781)",
    description:
      "Trazabilidad: material reciclado → proceso → envase → fin de vida → impacto",
    color: "#E8700A",
  },
];

export const config: IndustryPassportConfig = {
  industry: "Packaging Sustentable",
  slug: "packaging",
  branding: {
    companyName: "BioEnvase",
    tagline: "Packaging Sustentable · Grado Alimentario",
    primaryColor: "#E65100",
    accentColor: "#FF9800",
  },
  product: {
    name: "Charola Termoformada 500ml — Grado Alimentario",
    code: "BEV/B/02/PKG/156",
    date: "2026-02-18",
    heroValue: "100%",
    heroUnit: "reciclable",
    heroLabel: "post-uso",
  },
  sections: [
    {
      type: "origin",
      title: "Origen del Material",
      data: {
        materials: [
          {
            name: "rPET reciclado grado alimentario",
            percentage: 70,
            source: "Planta de reciclaje Toluca",
          },
          {
            name: "PET virgen grado alimentario",
            percentage: 30,
            source: "Proveedor certificado CDMX",
          },
        ],
        location: "Lerma, Estado de México",
        supplier: "ReciclaPlast Food-Grade S.A.",
      },
    },
    {
      type: "process",
      title: "Proceso de Fabricación",
      data: {
        technology: "Lavado supercrítico + Termoformado",
        facility: "Planta Lerma",
        steps: [
          { name: "Lavado supercrítico" },
          { name: "Pelletizado" },
          { name: "Extrusión lámina" },
          { name: "Termoformado" },
          { name: "Inspección" },
        ],
      },
    },
    {
      type: "circularity",
      title: "Fin de Vida del Envase",
      data: {
        type: "end-of-life",
        description:
          "Charola 100% reciclable en el flujo convencional de PET. Marcado según NOM-161 para facilitar separación.",
        metrics: [
          { label: "Reciclabilidad", value: "100%", highlight: true },
          { label: "Flujo de reciclaje", value: "PET convencional" },
          { label: "Marcado", value: "NOM-161 (triángulo #1)" },
          { label: "Contenido reciclado", value: "70% rPET", highlight: true },
          { label: "Peso por charola", value: "28 g" },
          { label: "Compostable", value: "No (reciclable)" },
        ],
      },
    },
    {
      type: "quality",
      title: "Seguridad Alimentaria",
      data: {
        metrics: [
          { label: "FDA", value: "21 CFR 177.1630" },
          { label: "COFEPRIS", value: "Aprobado" },
          { label: "Contacto alimentos", value: "Directo" },
          { label: "Migración global", value: "< 10 mg/dm²" },
          { label: "Temperatura máx.", value: "70°C" },
          { label: "Transparencia", value: "92%" },
        ],
        certifications: [
          "FDA 21 CFR 177.1630",
          "COFEPRIS Grado Alimentario",
          "NOM-161-SEMARNAT",
        ],
        verdict: "Aprobado — Contacto directo con alimentos",
      },
    },
    {
      type: "impact",
      title: "Impacto Ambiental",
      data: impact,
    },
    {
      type: "compliance",
      title: "Cumplimiento Normativo",
      data: { items: compliance },
    },
  ],
  impact,
  compliance,
  hash: "e6f3a0b9c2d85672e3f9c6b0d3a17e52f9d2c5b7e1a4f6b8c0d3e5a7f9b2c4d6",
};
