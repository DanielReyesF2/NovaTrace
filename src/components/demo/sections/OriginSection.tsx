import type { OriginData } from "@/lib/demo/types";

export function OriginSection({ data }: { data: OriginData }) {
  return (
    <div className="space-y-2">
      {data.materials.map((m, i) => (
        <div key={i} className="flex justify-between items-baseline py-1 border-b border-gray-100 last:border-0">
          <span className="text-gray-500 text-xs">{m.name}</span>
          <span className="text-xs text-right text-gray-700">
            {m.percentage}% · {m.source}
          </span>
        </div>
      ))}
      <div className="flex justify-between items-baseline py-1">
        <span className="text-gray-500 text-xs">Ubicación</span>
        <span className="text-xs font-mono font-bold text-gray-900">{data.location}</span>
      </div>
      {data.supplier && (
        <div className="flex justify-between items-baseline py-1">
          <span className="text-gray-500 text-xs">Proveedor</span>
          <span className="text-xs text-gray-700">{data.supplier}</span>
        </div>
      )}
    </div>
  );
}
