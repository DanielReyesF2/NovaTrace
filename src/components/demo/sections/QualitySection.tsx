import type { QualityData } from "@/lib/demo/types";

export function QualitySection({ data }: { data: QualityData }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {data.metrics.map((m, i) => (
          <div key={i} className="flex justify-between items-baseline py-1 border-b border-gray-100 last:border-0">
            <span className="text-gray-500 text-xs">{m.label}</span>
            <span className="text-xs font-mono font-bold text-gray-900">{m.value}</span>
          </div>
        ))}
      </div>
      {data.certifications.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {data.certifications.map((cert, i) => (
            <span key={i} className="text-[9px] bg-emerald-50 text-emerald-700 rounded-md px-2 py-0.5 font-medium">
              {cert}
            </span>
          ))}
        </div>
      )}
      {data.verdict && (
        <div className="mt-2 flex items-center gap-1.5 text-emerald-700">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          <span className="text-xs font-semibold">{data.verdict}</span>
        </div>
      )}
    </div>
  );
}
