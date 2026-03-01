import type { CircularityData } from "@/lib/demo/types";

export function CircularitySection({ data, accentColor }: { data: CircularityData; accentColor: string }) {
  return (
    <div>
      {data.description && (
        <p className="text-xs text-gray-600 mb-2">{data.description}</p>
      )}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {data.metrics.map((m, i) => (
          <div key={i} className="flex justify-between items-baseline py-1 border-b border-gray-100 last:border-0">
            <span className="text-gray-500 text-xs">{m.label}</span>
            <span className={`text-xs text-right ${m.highlight ? "font-mono font-bold" : "text-gray-700"}`} style={m.highlight ? { color: accentColor } : undefined}>
              {m.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
