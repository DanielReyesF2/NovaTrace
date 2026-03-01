import type { ProcessData } from "@/lib/demo/types";

export function ProcessSection({ data }: { data: ProcessData }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
        <div className="flex justify-between items-baseline py-1 border-b border-gray-100 col-span-1">
          <span className="text-gray-500 text-xs">Tecnología</span>
          <span className="text-xs font-mono font-bold text-gray-900">{data.technology}</span>
        </div>
        <div className="flex justify-between items-baseline py-1 border-b border-gray-100 col-span-1">
          <span className="text-gray-500 text-xs">Planta</span>
          <span className="text-xs text-gray-700">{data.facility}</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {data.steps.map((step, i) => (
          <span key={i} className="flex items-center">
            <span className="text-[10px] bg-gray-100 text-gray-700 rounded-md px-2 py-0.5 font-medium">
              {step.name}
            </span>
            {i < data.steps.length - 1 && (
              <span className="text-gray-300 mx-0.5 text-xs">→</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
