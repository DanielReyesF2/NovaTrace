import type {
  IndustryPassportConfig,
  PassportImpact,
  ComplianceItem,
} from "../types";

const impact: PassportImpact = {
  co2Avoided: 14.7,
  materialDiverted: 18.4,
  circularityIndex: 85,
  comparisonLabel: "vs acrílico virgen",
  comparisonBaseline: 17.3,
};

const compliance: ComplianceItem[] = [
  {
    standard: "ISO 14021 — Declaraciones Ambientales",
    description:
      "Verificación de contenido reciclado y declaraciones tipo II",
    color: "#1565C0",
  },
  {
    standard: "ISO 9001:2015 — Gestión de Calidad",
    description: "Sistema de gestión de calidad certificado",
    color: "#2E7D32",
  },
  {
    standard: "ISO 14040/14044 — Análisis de Ciclo de Vida",
    description: "Evaluación del impacto ambiental vs material virgen",
    color: "#7C5CFC",
  },
  {
    standard: "EU DPP (ESPR 2024/1781)",
    description:
      "Trazabilidad completa: residuo → proceso → producto → impacto",
    color: "#E8700A",
  },
];

export const config: IndustryPassportConfig = {
  industry: "Exhibidores y Displays",
  slug: "exhibidores",
  branding: {
    companyName: "DisplayTech",
    tagline: "Exhibidores Sustentables · Plástico Reciclado",
    primaryColor: "#1565C0",
    accentColor: "#42A5F5",
  },
  product: {
    name: "Exhibidor Modular Punto de Venta 120x80cm",
    code: "DTX/B/01/EXH/034",
    date: "2026-02-03",
    heroValue: 18.4,
    heroUnit: "kg plástico reciclado",
    heroLabel: "contenido reciclado",
  },
  sections: [
    {
      type: "origin",
      title: "Origen del Material Reciclado",
      data: {
        materials: [
          {
            name: "HDPE post-industrial (tapas)",
            percentage: 85,
            source: "Centro de acopio CDMX",
          },
          {
            name: "PP post-consumo (envases)",
            percentage: 15,
            source: "Recicladora Puebla",
          },
        ],
        location: "Naucalpan, Estado de México",
      },
    },
    {
      type: "process",
      title: "Proceso de Manufactura",
      data: {
        technology: "Extrusión + Termoformado",
        facility: "Planta Naucalpan",
        steps: [
          { name: "Trituración" },
          { name: "Lavado" },
          { name: "Extrusión lámina" },
          { name: "Termoformado" },
          { name: "Ensamble" },
        ],
      },
    },
    {
      type: "material-flow",
      title: "Balance de Materiales",
      data: {
        inputs: [
          { label: "HDPE reciclado", kg: 18.4, color: "#1565C0" },
          { label: "PP reciclado", kg: 3.2, color: "#42A5F5" },
          { label: "Estabilizadores UV", kg: 0.8, color: "#90CAF9" },
        ],
        outputs: [
          { label: "Exhibidor terminado", kg: 4.2, color: "#1565C0" },
          { label: "Merma (reingresa)", kg: 17.4, color: "#42A5F5" },
          { label: "Residuo", kg: 0.8, color: "#BDBDBD" },
        ],
      },
    },
    {
      type: "quality",
      title: "Control de Calidad",
      data: {
        metrics: [
          { label: "Resistencia flexión", value: "32 MPa" },
          { label: "Peso", value: "4.2 kg" },
          { label: "Contenido reciclado", value: "85%" },
          { label: "Resistencia UV", value: "5+ años" },
          { label: "Acabado", value: "Mate texturizado" },
          { label: "Color", value: "Personalizable" },
        ],
        certifications: ["ISO 9001:2015", "Contenido Reciclado Verificado"],
        verdict: "Aprobado — Grado comercial",
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
  hash: "b7e2a9c4d1f83560e2b7d4a8c1f95e20d6c9f2b4a8c3d5e7f1b6a2c4d8f0e3b5",
};
