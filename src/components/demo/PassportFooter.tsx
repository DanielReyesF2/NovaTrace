"use client";

import { QRCodeSVG } from "qrcode.react";

interface PassportFooterProps {
  hash: string;
  code: string;
  qrUrl: string;
  primaryColor: string;
}

export function PassportFooter({ hash, code, qrUrl, primaryColor }: PassportFooterProps) {
  return (
    <>
      {/* Verification */}
      <div className="px-6 sm:px-8 py-4 bg-gray-50/60 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[8px] tracking-[2px] text-gray-400 uppercase font-semibold mb-1">
              Verificación Digital
            </p>
            <p className="font-mono text-[9px] text-gray-400 break-all leading-relaxed">
              SHA-256: {hash}
            </p>
            <p className="text-[9px] text-gray-400 mt-1">
              Código: {code}
            </p>
          </div>
          <div className="flex-shrink-0 ml-4">
            <QRCodeSVG value={qrUrl} size={48} level="M" bgColor="transparent" fgColor="#64748b" />
          </div>
        </div>
      </div>

      {/* Powered by EcoNova */}
      <div
        className="px-6 sm:px-8 py-3 text-center"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
      >
        <p className="text-[8px] tracking-[3px] text-white/40 uppercase">
          Powered by EcoNova · Economía Circular · econova.com.mx
        </p>
      </div>
    </>
  );
}
