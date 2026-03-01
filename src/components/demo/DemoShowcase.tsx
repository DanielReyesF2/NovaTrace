"use client";

import Link from "next/link";
import type { IndustryPassportConfig } from "@/lib/demo/types";

// ─── Industry Card ──────────────────────────────────────────
function IndustryCard({ config }: { config: IndustryPassportConfig }) {
  return (
    <Link href={`/demo/${config.slug}`}>
      <div className="bg-white rounded-2xl shadow-card border border-black/[0.03] overflow-hidden hover:shadow-elevated transition-shadow duration-200 cursor-pointer h-full flex flex-col">
        {/* Gradient header */}
        <div
          className="px-5 py-4"
          style={{
            background: `linear-gradient(135deg, ${config.branding.primaryColor} 0%, ${config.branding.accentColor} 50%, ${config.branding.primaryColor} 100%)`,
          }}
        >
          <p className="text-[8px] tracking-[2px] text-white/40 uppercase mb-0.5">
            {config.industry}
          </p>
          <h3 className="text-lg font-bold text-white font-mono tracking-tight uppercase">
            {config.branding.companyName}
          </h3>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex-1 flex flex-col">
          {/* Hero KPI */}
          <div className="flex items-baseline gap-1.5 mb-2">
            <span
              className="font-mono text-2xl font-bold tracking-tight"
              style={{ color: config.branding.accentColor }}
            >
              {config.product.heroValue}
            </span>
            <span className="text-xs text-gray-500">{config.product.heroUnit}</span>
          </div>

          {/* Product name */}
          <p className="text-xs text-gray-600 mb-3 leading-relaxed">
            {config.product.name}
          </p>

          {/* Impact stats */}
          <div className="flex gap-2 mb-3 mt-auto">
            <div className="flex-1 bg-gray-50 rounded-lg px-2.5 py-1.5 text-center">
              <div className="font-mono text-sm font-bold text-gray-800">
                {config.impact.co2Avoided}
              </div>
              <div className="text-[8px] text-gray-400 uppercase tracking-wide">
                kg CO₂ evitados
              </div>
            </div>
            <div className="flex-1 bg-gray-50 rounded-lg px-2.5 py-1.5 text-center">
              <div
                className="font-mono text-sm font-bold"
                style={{ color: config.branding.accentColor }}
              >
                {config.impact.circularityIndex}%
              </div>
              <div className="text-[8px] text-gray-400 uppercase tracking-wide">
                circularidad
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: config.branding.primaryColor }}>
            <span>Ver Pasaporte</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Showcase Grid ──────────────────────────────────────────
export function DemoShowcase({ configs }: { configs: IndustryPassportConfig[] }) {
  return (
    <div className="min-h-screen bg-[#F5F3EE] p-6 sm:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Page header */}
        <div className="text-center mb-10">
          <p className="text-[9px] tracking-[4px] text-gray-400 uppercase mb-2">
            Plataforma de Trazabilidad
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2">
            Pasaportes Digitales de Producto
          </h1>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Cada producto cuenta su historia: origen, proceso, calidad, e impacto ambiental verificado con tecnología blockchain-ready.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/60 rounded-full px-4 py-1.5 border border-black/[0.04]">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] tracking-[2px] text-gray-500 uppercase font-medium">
              Powered by EcoNova
            </span>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {configs.map((config) => (
            <IndustryCard key={config.slug} config={config} />
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-10">
          <p className="text-[9px] tracking-[3px] text-gray-400 uppercase">
            EU Digital Product Passport (ESPR) · ISO 14040/14044 · Economía Circular
          </p>
          <p className="text-xs text-gray-400 mt-2">
            econova.com.mx
          </p>
        </div>
      </div>
    </div>
  );
}
