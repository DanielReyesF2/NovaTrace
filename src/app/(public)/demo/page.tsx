import { DemoShowcase } from "@/components/demo/DemoShowcase";

import { config as limpieza } from "@/lib/demo/industries/limpieza";
import { config as exhibidores } from "@/lib/demo/industries/exhibidores";
import { config as textil } from "@/lib/demo/industries/textil";
import { config as muebles } from "@/lib/demo/industries/muebles";
import { config as packaging } from "@/lib/demo/industries/packaging";
import { config as construccion } from "@/lib/demo/industries/construccion";

const ALL_CONFIGS = [limpieza, exhibidores, textil, muebles, packaging, construccion];

export const metadata = {
  title: "Pasaportes Digitales de Producto — EcoNova",
  description:
    "Plataforma de trazabilidad para economía circular. Pasaportes digitales para 6 industrias: limpieza, exhibidores, textil, muebles, packaging y construcción.",
};

export default function DemoIndexPage() {
  return <DemoShowcase configs={ALL_CONFIGS} />;
}
