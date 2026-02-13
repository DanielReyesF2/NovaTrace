"use client";

interface CertificatePublicProps {
  certificate: {
    code: string;
    hash: string;
    generatedAt: string;
    verifiedAt: string | null;
    batch: {
      code: string;
      date: string;
      feedstockType: string;
      feedstockOrigin: string;
      feedstockWeight: number;
      contaminationPct: number | null;
      oilOutput: number | null;
      co2Baseline: number | null;
      co2Project: number | null;
      co2Avoided: number | null;
      labResults: Array<{
        labName: string;
        labCertification: string | null;
        sulfurPercent: number | null;
        waterContent: number | null;
        verdict: string | null;
      }>;
    };
  };
}

export function CertificatePublic({ certificate }: CertificatePublicProps) {
  const { batch } = certificate;

  return (
    <div className="min-h-screen bg-eco-bg flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#FAFAF9] rounded-2xl p-10 text-gray-900 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-[10px] tracking-[5px] text-gray-400 uppercase mb-2">
            Certificado de Trazabilidad
          </p>
          <h1 className="text-3xl font-bold text-green-800 font-mono tracking-tighter">
            ECONOVA
          </h1>
          <p className="text-[9px] tracking-[4px] text-gray-400 uppercase">
            Economía Circular · México
          </p>
          <div className="w-12 h-px bg-green-800/30 mx-auto mt-4" />
          <p className="font-mono text-xs text-green-800 mt-3">{batch.code}</p>
          <p className="text-xs text-gray-400">
            {new Date(batch.date).toLocaleDateString("es-MX", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-5 text-xs">
          <section>
            <h3 className="text-[9px] tracking-[2px] text-green-800 font-bold uppercase mb-1">
              Origen del Residuo
            </h3>
            <p className="text-gray-600">{batch.feedstockType} · {batch.feedstockOrigin}</p>
            <p className="text-gray-600">{batch.feedstockWeight} kg · Contaminación ~{batch.contaminationPct}%</p>
          </section>

          {batch.oilOutput != null && batch.oilOutput > 0 && (
            <section>
              <h3 className="text-[9px] tracking-[2px] text-green-800 font-bold uppercase mb-1">
                Producto
              </h3>
              <p className="text-gray-600">~{batch.oilOutput} litros aceite pirolítico</p>
            </section>
          )}

          {batch.labResults.length > 0 && (
            <section>
              <h3 className="text-[9px] tracking-[2px] text-green-800 font-bold uppercase mb-1">
                Control de Calidad — {batch.labResults[0].labName}
              </h3>
              <p className="text-gray-600">
                Azufre: {batch.labResults[0].sulfurPercent}% · Agua: {batch.labResults[0].waterContent} PPM
              </p>
              {batch.labResults[0].verdict && (
                <p className="text-green-700 font-medium mt-1">✓ {batch.labResults[0].verdict}</p>
              )}
            </section>
          )}

          {batch.co2Avoided != null && (
            <section>
              <h3 className="text-[9px] tracking-[2px] text-green-800 font-bold uppercase mb-1">
                Impacto Ambiental — Ciclo de Vida
              </h3>
              <p className="text-gray-600">
                Sin EcoNova: {batch.co2Baseline?.toFixed(1)} kg CO₂eq (quema abierta)
              </p>
              <p className="text-gray-600">
                Con EcoNova: {batch.co2Project?.toFixed(1)} kg CO₂eq (pirólisis)
              </p>
              <p className="text-green-700 font-bold mt-1">
                {batch.co2Avoided.toFixed(1)} kg CO₂eq evitados
              </p>
            </section>
          )}
        </div>

        {/* Verification */}
        <div className="border-t border-gray-200 pt-5 mt-6 text-center">
          <div className="w-20 h-20 bg-gray-100 border border-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center text-[9px] text-gray-400">
            QR
          </div>
          <p className="font-mono text-[9px] text-gray-300">
            SHA-256: {certificate.hash.slice(0, 16)}...{certificate.hash.slice(-8)}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            trace.econova.com.mx/verify/{certificate.code}
          </p>
        </div>

        <p className="text-center text-[9px] text-gray-300 mt-6">
          EcoNova México · econova.com.mx
        </p>
      </div>
    </div>
  );
}
