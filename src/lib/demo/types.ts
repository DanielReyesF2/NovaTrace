export interface PassportBranding {
  companyName: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
}

export interface PassportProduct {
  name: string;
  code: string;
  date: string;
  heroValue: number | string;
  heroUnit: string;
  heroLabel: string;
}

export interface PassportImpact {
  co2Avoided: number;
  materialDiverted: number;
  circularityIndex: number;
  comparisonLabel: string;
  comparisonBaseline: number;
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
  color: string;
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
  hash: string;
}
