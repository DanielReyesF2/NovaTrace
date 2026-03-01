"use client";

import { PassportHeader } from "./PassportHeader";
import { PassportFooter } from "./PassportFooter";
import { OriginSection } from "./sections/OriginSection";
import { ProcessSection } from "./sections/ProcessSection";
import { MaterialFlowSection } from "./sections/MaterialFlowSection";
import { QualitySection } from "./sections/QualitySection";
import { ImpactSection } from "./sections/ImpactSection";
import { CircularitySection } from "./sections/CircularitySection";
import { ComplianceSection } from "./sections/ComplianceSection";
import type { IndustryPassportConfig, SectionConfig } from "@/lib/demo/types";

function SectionWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[9px] tracking-[2.5px] text-gray-500 font-bold uppercase mb-2.5">
        {title}
      </h3>
      {children}
    </section>
  );
}

function renderSection(section: SectionConfig, accentColor: string) {
  switch (section.type) {
    case "origin":
      return <OriginSection data={section.data} />;
    case "process":
      return <ProcessSection data={section.data} />;
    case "material-flow":
      return <MaterialFlowSection data={section.data} />;
    case "quality":
      return <QualitySection data={section.data} />;
    case "impact":
      return <ImpactSection data={section.data} accentColor={accentColor} />;
    case "circularity":
      return <CircularitySection data={section.data} accentColor={accentColor} />;
    case "compliance":
      return <ComplianceSection data={section.data} />;
    default:
      return null;
  }
}

export function IndustryPassport({ config }: { config: IndustryPassportConfig }) {
  const qrUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/demo/${config.slug}`;

  return (
    <div className="min-h-screen bg-[#F5F3EE] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <PassportHeader branding={config.branding} qrUrl={qrUrl} />

          {/* Product Hero */}
          <div className="px-6 sm:px-8 py-5 border-b border-gray-100">
            <div className="flex items-baseline gap-2 mb-1">
              <span
                className="font-mono text-4xl font-bold tracking-tight"
                style={{ color: config.branding.accentColor }}
              >
                {config.product.heroValue}
              </span>
              <span className="text-sm text-gray-500">{config.product.heroUnit}</span>
            </div>
            <p className="text-xs text-gray-600 mb-1">{config.product.name}</p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="font-mono">{config.product.code}</span>
              <span>·</span>
              <span>
                {new Date(config.product.date).toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Sections */}
          <div className="px-6 sm:px-8 py-6 space-y-6">
            {config.sections.map((section, i) => (
              <SectionWrapper key={i} title={section.title}>
                {renderSection(section, config.branding.accentColor)}
              </SectionWrapper>
            ))}
          </div>

          {/* Footer */}
          <PassportFooter
            hash={config.hash}
            code={config.product.code}
            qrUrl={qrUrl}
            primaryColor={config.branding.primaryColor}
          />
        </div>

        {/* Standards line */}
        <p className="text-center text-[9px] text-gray-400 mt-4 leading-relaxed">
          Pasaporte Digital de Producto · EU DPP (ESPR) · ISO 14040/14044 LCA
        </p>
      </div>
    </div>
  );
}
