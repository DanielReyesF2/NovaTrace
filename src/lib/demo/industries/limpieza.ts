import type {
  IndustryPassportConfig,
  PassportImpact,
  ComplianceItem,
} from "../types";

const impact: PassportImpact = {
  co2Avoided: 12.8,
  materialDiverted: 23.5,
  circularityIndex: 78,
  comparisonLabel: "vs envases desechables",
  comparisonBaseline: 16.4,
};

const compliance: ComplianceItem[] = [
  {
    standard: "NOM-189-SSA1 — Productos de Limpieza",
    description:
      "Cumplimiento de requisitos sanitarios para productos de aseo",
    color: "#2E7D32",
  },
  {
    standard: "OECD 301B — Biodegradabilidad",
    description: "Prueba de biodegradabilidad rápida: 98% en 28 días",
    color: "#1565C0",
  },
  {
    standard: "ISO 14040/14044 — Análisis de Ciclo de Vida",
    description:
      "Evaluación completa del impacto ambiental del sistema retornable",
    color: "#7C5CFC",
  },
  {
    standard: "EU DPP (ESPR 2024/1781)",
    description:
      "Pasaporte digital con trazabilidad origen → proceso → retorno → impacto",
    color: "#E8700A",
  },
];

export const config: IndustryPassportConfig = {
  industry: "Productos de Limpieza",
  slug: "limpieza",
  branding: {
    companyName: "EcoClean México",
    tagline: "Limpieza Responsable · Envases Retornables",
    primaryColor: "#2E7D32",
    accentColor: "#66BB6A",
  },
  product: {
    name: "Desengrasante Industrial BioCleen 5L",
    code: "ECL/B/02/RET/012",
    date: "2026-01-15",
    heroValue: 47,
    heroUnit: "ciclos de retorno",
    heroLabel: "envase retornable",
  },
  sections: [
    {
      type: "origin",
      title: "Origen de Ingredientes",
      data: {
        materials: [
          {
            name: "Tensoactivos biodegradables",
            percentage: 45,
            source: "Proveedor Querétaro",
          },
          {
            name: "Solventes de origen vegetal",
            percentage: 30,
            source: "Jalisco",
          },
          {
            name: "Agua purificada",
            percentage: 25,
            source: "Planta Toluca",
          },
        ],
        location: "Toluca, Estado de México",
        supplier: "BioQuím de México S.A.",
      },
    },
    {
      type: "process",
      title: "Proceso de Producción",
      data: {
        technology: "Formulación por lotes",
        facility: "Planta Toluca",
        steps: [
          { name: "Mezcla" },
          { name: "Homogeneización" },
          { name: "Control pH" },
          { name: "Embotellado" },
          { name: "Etiquetado" },
        ],
      },
    },
    {
      type: "circularity",
      title: "Ciclo de Retorno del Envase",
      data: {
        type: "returnable",
        description:
          "Envase HDPE de 5L diseñado para 60+ ciclos de uso con lavado industrial entre cada retorno.",
        metrics: [
          { label: "Ciclos completados", value: "47 de 60", highlight: true },
          { label: "Material envase", value: "HDPE alta densidad" },
          { label: "Lavados industriales", value: "3 por ciclo" },
          { label: "Peso envase", value: "285 g" },
          { label: "Vida útil estimada", value: "60 ciclos" },
          { label: "Km recorridos", value: "2,350 km" },
        ],
      },
    },
    {
      type: "quality",
      title: "Control de Calidad",
      data: {
        metrics: [
          { label: "pH", value: "7.2" },
          { label: "Biodegradabilidad", value: "98%" },
          { label: "Fosfatos", value: "Libre" },
          { label: "COV", value: "< 1%" },
          { label: "Viscosidad", value: "1,050 cP" },
          { label: "Densidad", value: "1.02 g/mL" },
        ],
        certifications: [
          "NOM-189-SSA1",
          "Biodegradable OECD 301B",
          "Envase Retornable Certificado",
        ],
        verdict: "Aprobado — Grado industrial",
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
  hash: "a3f8c2d1e9b74560f1c8d3a7e2b94f10c5d8e1a3f7b2c9d4e8a1b5c3d7f9e2a4",
};
