import type {
  IndustryPassportConfig,
  PassportImpact,
  ComplianceItem,
} from "../types";

const impact: PassportImpact = {
  co2Avoided: 48.6,
  materialDiverted: 32,
  circularityIndex: 92,
  comparisonLabel: "vs banca de madera tropical",
  comparisonBaseline: 52.8,
};

const compliance: ComplianceItem[] = [
  {
    standard: "NMX-R-019-SCFI — Mobiliario Urbano",
    description:
      "Cumplimiento de requisitos de seguridad y durabilidad para espacios públicos",
    color: "#37474F",
  },
  {
    standard: "ISO 14021 — Declaraciones Ambientales",
    description: "Contenido reciclado post-consumo verificado al 95%",
    color: "#2E7D32",
  },
  {
    standard: "ISO 14040/14044 — Análisis de Ciclo de Vida",
    description:
      "Comparación vs banca de madera tropical y concreto convencional",
    color: "#1565C0",
  },
  {
    standard: "EU DPP (ESPR 2024/1781)",
    description:
      "Trazabilidad: residuo plástico → procesamiento → mobiliario → impacto",
    color: "#E8700A",
  },
];

export const config: IndustryPassportConfig = {
  industry: "Mobiliario Urbano",
  slug: "muebles",
  branding: {
    companyName: "PlastiMueble",
    tagline: "Mobiliario Urbano · Plástico Reciclado",
    primaryColor: "#37474F",
    accentColor: "#78909C",
  },
  product: {
    name: "Banca Urbana Parque 180cm — Gris Grafito",
    code: "PMB/B/01/MUE/017",
    date: "2026-02-10",
    heroValue: 32,
    heroUnit: "kg plástico reciclado",
    heroLabel: "contenido reciclado",
  },
  sections: [
    {
      type: "origin",
      title: "Origen del Plástico Reciclado",
      data: {
        materials: [
          {
            name: "HDPE post-consumo",
            percentage: 60,
            source: "Centro de acopio Monterrey",
          },
          {
            name: "PP post-consumo",
            percentage: 35,
            source: "Recicladora Saltillo",
          },
          {
            name: "Pigmentos y aditivos",
            percentage: 5,
            source: "Proveedor Monterrey",
          },
        ],
        location: "Apodaca, Nuevo León",
      },
    },
    {
      type: "process",
      title: "Proceso de Manufactura",
      data: {
        technology: "Extrusión de perfil",
        facility: "Planta Apodaca",
        steps: [
          { name: "Trituración" },
          { name: "Lavado" },
          { name: "Secado" },
          { name: "Extrusión perfil" },
          { name: "Corte" },
          { name: "Ensamble" },
        ],
      },
    },
    {
      type: "material-flow",
      title: "Balance de Materiales",
      data: {
        inputs: [
          { label: "HDPE post-consumo", kg: 21, color: "#37474F" },
          { label: "PP post-consumo", kg: 12.25, color: "#607D8B" },
          { label: "Aditivos", kg: 1.75, color: "#90A4AE" },
        ],
        outputs: [
          { label: "Banca terminada", kg: 32, color: "#37474F" },
          { label: "Merma (reingresa)", kg: 2.5, color: "#78909C" },
          { label: "Residuo no recuperable", kg: 0.5, color: "#BDBDBD" },
        ],
      },
    },
    {
      type: "quality",
      title: "Control de Calidad",
      data: {
        metrics: [
          { label: "Capacidad carga", value: "500 kg" },
          { label: "Resistencia UV", value: "25+ años" },
          { label: "Peso", value: "32 kg" },
          { label: "Contenido reciclado", value: "95%" },
          { label: "Dimensiones", value: "180 × 45 × 80 cm" },
          { label: "Color", value: "Gris Grafito" },
        ],
        certifications: [
          "Garantía 25 años",
          "Resistencia UV Certificada",
          "Anti-grafiti",
        ],
        verdict: "Aprobado — Grado urbano exterior",
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
  hash: "d5e2f9a8b1c74561d2e8b5a9c2f06d41e8c1b4a6d0e3f5a7b9c2d4e6f8a1b3c5",
};
