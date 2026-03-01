import type { MaterialFlowData } from "@/lib/demo/types";

export function MaterialFlowSection({ data }: { data: MaterialFlowData }) {
  const totalIn = data.inputs.reduce((s, i) => s + i.kg, 0);
  const totalOut = data.outputs.reduce((s, o) => s + o.kg, 0);

  return (
    <div className="bg-gray-50/80 rounded-xl p-3 -mx-1">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[8px] uppercase tracking-[1.5px] text-gray-400 font-semibold mb-1.5">Entrada</p>
          {data.inputs.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 mb-1">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-[10px] text-gray-600">{item.label}</span>
              <span className="text-[10px] font-mono font-bold text-gray-800 ml-auto">{item.kg} kg</span>
            </div>
          ))}
          <div className="border-t border-gray-200 mt-1 pt-1">
            <span className="text-[10px] font-mono font-bold text-gray-900">Total: {totalIn} kg</span>
          </div>
        </div>
        <div>
          <p className="text-[8px] uppercase tracking-[1.5px] text-gray-400 font-semibold mb-1.5">Salida</p>
          {data.outputs.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 mb-1">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-[10px] text-gray-600">{item.label}</span>
              <span className="text-[10px] font-mono font-bold text-gray-800 ml-auto">{item.kg} kg</span>
            </div>
          ))}
          <div className="border-t border-gray-200 mt-1 pt-1">
            <span className="text-[10px] font-mono font-bold text-gray-900">Total: {totalOut} kg</span>
          </div>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-200">
        <div className="flex justify-between text-[10px] mb-0.5">
          <span className="text-gray-500">Eficiencia de material</span>
          <span className="font-mono font-bold text-gray-800">{totalIn > 0 ? ((totalOut / totalIn) * 100).toFixed(1) : 0}%</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500/70"
            style={{ width: `${totalIn > 0 ? (totalOut / totalIn) * 100 : 0}%` }}
          />
        </div>
      </div>
    </div>
  );
}
