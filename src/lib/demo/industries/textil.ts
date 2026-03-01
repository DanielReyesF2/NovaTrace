import type {
  IndustryPassportConfig,
  PassportImpact,
  ComplianceItem,
} from "../types";

const impact: PassportImpact = {
  co2Avoided: 2.1,
  materialDiverted: 0.36,
  circularityIndex: 65,
  comparisonLabel: "vs poliéster virgen",
  comparisonBaseline: 3.2,
};

const compliance: ComplianceItem[] = [
  {
    standard: "GRS — Global Recycled Standard",
    description:
      "Certificación de cadena de custodia para contenido reciclado verificado",
    color: "#6A1B9A",
  },
  {
    standard: "OEKO-TEX Standard 100",
    description:
      "Libre de sustancias nocivas, seguro para contacto directo con piel",
    color: "#2E7D32",
  },
  {
    standard: "ISO 14040/14044 — Análisis de Ciclo de Vida",
    description:
      "Comparación ambiental vs poliéster virgen + algodón convencional",
    color: "#1565C0",
  },
  {
    standard: "EU DPP (ESPR 2024/1781)",
    description:
      "Trazabilidad textil: botella → fibra → prenda → impacto",
    color: "#E8700A",
  },
];

export const config: IndustryPassportConfig = {
  industry: "Textil Reciclado",
  slug: "textil",
  branding: {
    companyName: "ReThread",
    tagline: "Moda Circular · Fibra de PET Reciclado",
    primaryColor: "#6A1B9A",
    accentColor: "#AB47BC",
  },
  product: {
    name: "Polo Corporativo EcoFiber — Talla M",
    code: "RTH/B/03/TEX/089",
    date: "2026-01-28",
    heroValue: 12,
    heroUnit: "botellas PET recicladas",
    heroLabel: "por prenda",
  },
  sections: [
    {
      type: "origin",
      title: "Origen del PET Reciclado",
      data: {
        materials: [
          {
            name: "PET post-consumo (botellas)",
            percentage: 65,
            source: "Centro de acopio Guadalajara",
          },
          {
            name: "Algodón orgánico",
            percentage: 35,
            source: "Cooperativa Oaxaca",
          },
        ],
        location: "Guadalajara, Jalisco",
        supplier: "RecolectaPET S.A.",
      },
    },
    {
      type: "process",
      title: "Proceso de Transformación",
      data: {
        technology: "PET-a-Fibra + Confección",
        facility: "Planta Tlaquepaque",
        steps: [
          { name: "Recolección" },
          { name: "Triturado" },
          { name: "Lavado" },
          { name: "Pelletizado" },
          { name: "Hilado" },
          { name: "Tejido" },
          { name: "Confección" },
        ],
      },
    },
    {
      type: "circularity",
      title: "Composición de Fibra",
      data: {
        type: "recycled-content",
        description:
          "Cada polo contiene el equivalente a 12 botellas PET de 600ml recicladas, transformadas en fibra de poliéster.",
        metrics: [
          {
            label: "Poliéster reciclado (rPET)",
            value: "65%",
            highlight: true,
          },
          { label: "Algodón orgánico", value: "35%" },
          {
            label: "Botellas por prenda",
            value: "12 unidades",
            highlight: true,
          },
          { label: "Lote de producción", value: "600 botellas" },
          { label: "Rendimiento fibra", value: "142 g/botella" },
          { label: "Gramaje tejido", value: "180 g/m²" },
        ],
      },
    },
    {
      type: "quality",
      title: "Certificaciones Textiles",
      data: {
        metrics: [
          { label: "Gramaje", value: "180 g/m²" },
          { label: "Solidez color", value: "4-5 (escala 5)" },
          { label: "Pilling", value: "4 (escala 5)" },
          { label: "Encogimiento", value: "< 3%" },
        ],
        certifications: [
          "GRS (Global Recycled Standard)",
          "OEKO-TEX Standard 100",
          "Comercio Justo Algodón",
        ],
        verdict: "Certificado — Grado premium",
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
  hash: "c4d1f8a7e2b93560c1d8a4e7b2f95c30e7d0a3b5c9d2f4e6a8b1c5d7f3e0a2b6",
};
