"use client";

export function KPICardSkeleton() {
  return (
    <div className="bg-eco-surface border border-eco-border rounded-xl p-5 animate-pulse">
      <div className="h-3 w-24 bg-eco-surface-2 rounded mb-4" />
      <div className="h-8 w-20 bg-eco-surface-2 rounded mb-2" />
      <div className="h-2 w-32 bg-eco-surface-2 rounded" />
    </div>
  );
}

export function ChartSkeleton({ height = "h-64" }: { height?: string }) {
  return (
    <div className={`bg-eco-surface border border-eco-border rounded-xl p-5 animate-pulse`}>
      <div className="h-3 w-32 bg-eco-surface-2 rounded mb-4" />
      <div className={`${height} bg-eco-surface-2 rounded-lg skeleton-shimmer`} />
    </div>
  );
}

export function TableRowSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-eco-surface border border-eco-border rounded-xl p-5 animate-pulse space-y-3">
      <div className="h-3 w-32 bg-eco-surface-2 rounded mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-4 w-16 bg-eco-surface-2 rounded" />
          <div className="h-4 flex-1 bg-eco-surface-2 rounded" />
          <div className="h-4 w-12 bg-eco-surface-2 rounded" />
          <div className="h-4 w-12 bg-eco-surface-2 rounded" />
        </div>
      ))}
    </div>
  );
}
