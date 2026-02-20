import { prisma } from "@/lib/prisma";
import Link from "next/link";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  COMPLETED: { label: "Completado", color: "#3d7a0a", bg: "rgba(61,122,10,0.08)", icon: "✓" },
  IN_PROGRESS: { label: "En proceso", color: "#2D8CF0", bg: "rgba(45,140,240,0.08)", icon: "◉" },
  ACTIVE: { label: "Activo", color: "#E8700A", bg: "rgba(232,112,10,0.08)", icon: "◉" },
  INCOMPLETE: { label: "Incompleto", color: "#DC2626", bg: "rgba(220,38,38,0.06)", icon: "○" },
  FAILED: { label: "Fallido", color: "#DC2626", bg: "rgba(220,38,38,0.06)", icon: "✕" },
  TEST: { label: "Prueba", color: "#7C5CFC", bg: "rgba(124,92,252,0.08)", icon: "◇" },
};

export default async function BatchListPage() {
  const batches = await prisma.batch.findMany({
    orderBy: { date: "desc" },
    select: {
      id: true,
      code: true,
      date: true,
      status: true,
      feedstockType: true,
      feedstockOrigin: true,
      feedstockWeight: true,
      oilOutput: true,
      yieldPercent: true,
      co2Avoided: true,
      maxReactorTemp: true,
      durationMinutes: true,
      operators: true,
      labResults: { select: { id: true, verdict: true } },
      certificates: { select: { id: true } },
      _count: { select: { readings: true, events: true, photos: true } },
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-eco-ink">Lotes de Pirólisis</h1>
          <p className="text-xs text-eco-muted mt-1">{batches.length} lotes registrados</p>
        </div>
      </div>

      {/* Batch list */}
      <div className="space-y-3">
        {batches.map((batch) => {
          const st = STATUS_CONFIG[batch.status] || STATUS_CONFIG.TEST;
          const oilPct = batch.oilOutput && batch.feedstockWeight > 0
            ? ((batch.oilOutput / batch.feedstockWeight) * 100).toFixed(0)
            : null;
          const durationStr = batch.durationMinutes
            ? `${Math.floor(batch.durationMinutes / 60)}h ${batch.durationMinutes % 60}m`
            : null;

          return (
            <Link
              key={batch.id}
              href={`/batch/${batch.id}`}
              className="block bg-white rounded-2xl shadow-soft border border-black/[0.03] p-5 hover:shadow-md hover:border-black/[0.06] transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: batch info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="font-mono text-sm font-bold text-eco-ink group-hover:text-eco-navy-light transition-colors">
                      {batch.code}
                    </span>
                    <span
                      className="text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
                      style={{ color: st.color, background: st.bg }}
                    >
                      {st.icon} {st.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-eco-muted">
                    <span>
                      {new Date(batch.date).toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span>{batch.feedstockType}</span>
                    <span className="text-eco-muted-2">{batch.feedstockOrigin}</span>
                  </div>
                </div>

                {/* Right: metrics */}
                <div className="flex items-center gap-5 text-right flex-shrink-0">
                  <div>
                    <div className="font-mono text-lg font-bold text-eco-ink">{batch.feedstockWeight} kg</div>
                    <div className="text-[8px] text-eco-muted uppercase tracking-wider">feedstock</div>
                  </div>
                  {batch.oilOutput != null && batch.oilOutput > 0 && (
                    <div>
                      <div className="font-mono text-lg font-bold" style={{ color: "#7C5CFC" }}>
                        {batch.oilOutput} L
                      </div>
                      <div className="text-[8px] text-eco-muted uppercase tracking-wider">
                        aceite{oilPct && ` · ${oilPct}%`}
                      </div>
                    </div>
                  )}
                  {batch.co2Avoided != null && batch.co2Avoided > 0 && (
                    <div>
                      <div className="font-mono text-lg font-bold" style={{ color: "#3d7a0a" }}>
                        {batch.co2Avoided.toFixed(0)} kg
                      </div>
                      <div className="text-[8px] text-eco-muted uppercase tracking-wider">CO₂ evitado</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom row: metadata chips */}
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-eco-border/50">
                {durationStr && (
                  <span className="text-[9px] font-mono text-eco-muted px-2 py-0.5 rounded-full bg-eco-surface-2">
                    {durationStr}
                  </span>
                )}
                {batch.maxReactorTemp && (
                  <span className="text-[9px] font-mono text-eco-orange px-2 py-0.5 rounded-full bg-eco-surface-2">
                    {batch.maxReactorTemp}°C
                  </span>
                )}
                <span className="text-[9px] font-mono text-eco-muted px-2 py-0.5 rounded-full bg-eco-surface-2">
                  {batch._count.readings} lecturas
                </span>
                <span className="text-[9px] font-mono text-eco-muted px-2 py-0.5 rounded-full bg-eco-surface-2">
                  {batch._count.events} eventos
                </span>
                {batch._count.photos > 0 && (
                  <span className="text-[9px] font-mono text-eco-muted px-2 py-0.5 rounded-full bg-eco-surface-2">
                    {batch._count.photos} fotos
                  </span>
                )}
                {batch.certificates.length > 0 && (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full" style={{ color: "#E8700A", background: "rgba(232,112,10,0.08)" }}>
                    Certificado
                  </span>
                )}
                {batch.labResults.length > 0 && (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full" style={{ color: "#2D8CF0", background: "rgba(45,140,240,0.08)" }}>
                    Lab
                  </span>
                )}
                <span className="text-[9px] text-eco-muted-2 ml-auto">
                  {batch.operators.join(", ")}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {batches.length === 0 && (
        <div className="text-center py-16 text-eco-muted-2">
          <div className="text-3xl mb-2">📋</div>
          <p className="text-sm">No hay lotes registrados</p>
        </div>
      )}
    </div>
  );
}
