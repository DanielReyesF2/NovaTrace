"use client";

import { QRCodeSVG } from "qrcode.react";
import type { PassportBranding } from "@/lib/demo/types";

interface PassportHeaderProps {
  branding: PassportBranding;
  qrUrl: string;
}

export function PassportHeader({ branding, qrUrl }: PassportHeaderProps) {
  return (
    <div
      className="px-6 sm:px-8 pt-6 pb-4"
      style={{
        background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.accentColor} 50%, ${branding.primaryColor} 100%)`,
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] tracking-[4px] text-white/40 uppercase mb-1">
            Pasaporte Digital de Producto
          </p>
          <h1 className="text-2xl font-bold text-white font-mono tracking-tight uppercase">
            {branding.companyName}
          </h1>
          <p className="text-[8px] tracking-[3px] text-white/35 uppercase mt-0.5">
            {branding.tagline}
          </p>
        </div>
        <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm">
          <QRCodeSVG value={qrUrl} size={64} level="M" bgColor="transparent" fgColor="#ffffff" />
        </div>
      </div>
    </div>
  );
}
