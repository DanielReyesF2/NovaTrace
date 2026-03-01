import type { ComplianceItem } from "@/lib/demo/types";

export function ComplianceSection({ data }: { data: { items: ComplianceItem[] } }) {
  return (
    <div className="space-y-2">
      {data.items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: item.color }} />
          <div>
            <p className="text-[10px] font-semibold text-gray-700">{item.standard}</p>
            <p className="text-[8px] text-gray-400">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
