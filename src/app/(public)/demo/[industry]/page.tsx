import { notFound } from "next/navigation";
import { IndustryPassport } from "@/components/demo/IndustryPassport";
import type { IndustryPassportConfig } from "@/lib/demo/types";

import { config as limpieza } from "@/lib/demo/industries/limpieza";
import { config as exhibidores } from "@/lib/demo/industries/exhibidores";
import { config as textil } from "@/lib/demo/industries/textil";
import { config as muebles } from "@/lib/demo/industries/muebles";
import { config as packaging } from "@/lib/demo/industries/packaging";
import { config as construccion } from "@/lib/demo/industries/construccion";

const CONFIGS: Record<string, IndustryPassportConfig> = {
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
