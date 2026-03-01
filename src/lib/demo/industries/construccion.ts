import type {
  IndustryPassportConfig,
  PassportImpact,
  ComplianceItem,
} from "../types";

const impact: PassportImpact = {
  co2Avoided: 3.2,
  materialDiverted: 4.8,
  circularityIndex: 88,
  comparisonLabel: "vs bloque concreto convencional",
  comparisonBaseline: 3.6,
};

const compliance: ComplianceItem[] = [
  {
    standard: "NMX-C-441 — Bloques de Concreto",
    description:
      "Cumplimiento de resistencia mecánica y especificaciones para bloques estructurales",
    color: "#4E342E",
  },
  {
    standard: "NOM-018-ENER — Aislamiento Térmico",
    description:
      "Valor R-1.2 verificado, superior a bloque de concreto convencional",
    color: "#2E7D32",
  },
  {
    standard: "ISO 14040/14044 — Análisis de Ciclo de Vida",
    description: "Comparación ambiental vs bloque de concreto convencional",
    color: "#1565C0",
  },
  {
    standard: "EU DPP (ESPR 2024/1781)",
    description:
      "Trazabilidad: residuo plástico → mezcla → bloque → propiedades → impacto",
    color: "#E8700A",
  },
];

export const config: IndustryPassportConfig = {
  industry: "Materiales de Construcción",
  slug: "construccion",
  branding: {
    companyName: "EcoBloques MX",
    tagline: "Materiales de Construcción · Plástico Reciclado",
    primaryColor: "#4E342E",
    accentColor: "#8D6E63",
  },
  product: {
    name: "Bloque Estructural EcoBlock 40×20×15cm",
    code: "EBQ/B/01/CON/043",
    date: "2026-01-22",
    heroValue: 4.8,
    heroUnit: "kg plástico reciclado",
    heroLabel: "por bloque",
  },
  sections: [
    {
      type: "origin",
      title: "Origen de Materiales",
      data: {
        materials: [
          {
            name: "Poliolefinas post-consumo",
            percentage: 40,
            source: "Recolección municipal León, Gto.",
          },
          {
            name: "Arena sílica",
            percentage: 35,
            source: "Banco de materiales Silao",
          },
          {
            name: "Cemento Portland",
            percentage: 25,
            source: "CEMEX Salamanca",
          },
        ],
        location: "León, Guanajuato",
      },
    },
    {
      type: "process",
      title: "Proceso de Fabricación",
      data: {
        technology: "Mezcla + Prensado",
        facility: "Planta León",
        steps: [
          { name: "Trituración plástico" },
          { name: "Mezcla (40/35/25)" },
          { name: "Prensado hidráulico" },
          { name: "Curado 28 días" },
          { name: "Inspección" },
        ],
      },
    },
    {
      type: "circularity",
      title: "Propiedades Mecánicas",
      data: {
        type: "composite",
        description:
          "Bloque estructural que combina plástico reciclado con arena y cemento, logrando propiedades mecánicas superiores a bloques convencionales.",
        metrics: [
          {
            label: "Resistencia compresión",
            value: "65 kg/cm²",
            highlight: true,
          },
          { label: "Densidad", value: "1,450 kg/m³" },
          { label: "Aislamiento térmico", value: "R-1.2", highlight: true },
          { label: "Absorción agua", value: "< 8%" },
          { label: "Peso por bloque", value: "12 kg" },
          { label: "Vida útil estimada", value: "50+ años" },
        ],
      },
    },
    {
      type: "quality",
      title: "Control de Calidad — Construcción",
      data: {
        metrics: [
          { label: "Resistencia compresión", value: "65 kg/cm²" },
          { label: "Variación dimensional", value: "< 2 mm" },
          { label: "Absorción agua", value: "7.8%" },
          { label: "Resistencia fuego", value: "Clase A" },
          { label: "Aislamiento acústico", value: "42 dB" },
          { label: "Contenido reciclado", value: "40%" },
        ],
        certifications: [
          "NMX-C-441 Bloques",
          "NOM-018-ENER Aislamiento",
          "Resistencia al Fuego Clase A",
        ],
        verdict: "Aprobado — Grado estructural",
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
  hash: "f7a4b1c0d3e96783f4a0d7b1e4c28f63a0e3d6c8f2b5a7c9d1e4f6a8b0c3d5e7",
};
