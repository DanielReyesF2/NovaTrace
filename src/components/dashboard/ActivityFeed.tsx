"use client";

import Link from "next/link";

interface RecentEvent {
  id: string;
  timestamp: string;
  type: string;
  detail: string;
  batch: { code: string; id: string };
}

interface ActivityFeedProps {
  events: RecentEvent[];
}

const EVENT_ICONS: Record<string, { icon: string; color: string }> = {
  PHASE_CHANGE: { icon: "⚡", color: "#3d7a0a" },
  INCIDENT: { icon: "⚠", color: "#DC2626" },
  VALVE_CHANGE: { icon: "🔧", color: "#E8700A" },
  EQUIPMENT_TOGGLE: { icon: "⚙", color: "#2D8CF0" },
  FUEL_ADD: { icon: "🔥", color: "#7C5CFC" },
  OBSERVATION: { icon: "👁", color: "rgba(39,57,73,0.5)" },
};

export function ActivityFeed({ events }: ActivityFeedProps) {
  const displayed = events.slice(0, 6);

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] p-5">
      <h3 className="text-[11px] tracking-[2px] text-eco-muted uppercase font-medium mb-4">
        Actividad Reciente
      </h3>
      {displayed.length > 0 ? (
        <div className="space-y-0">
          {displayed.map((event, i) => {
            const evStyle = EVENT_ICONS[event.type] || EVENT_ICONS.OBSERVATION;
            return (
              <div key={event.id} className="flex gap-2.5 relative">
                {/* Timeline line */}
                {i < displayed.length - 1 && (
                  <div className="absolute left-[9px] top-6 bottom-0 w-px bg-black/[0.04]" />
                )}
                {/* Dot */}
                <div
                  className="w-[19px] h-[19px] rounded-full flex items-center justify-center text-[8px] flex-shrink-0 z-10"
                  style={{
                    background: `${evStyle.color}12`,
                    border: `1px solid ${evStyle.color}25`,
                  }}
                >
                  {evStyle.icon}
                </div>
                {/* Content */}
                <div className="pb-3 min-w-0 flex-1">
                  <p className="text-[11px] text-eco-ink leading-snug line-clamp-2">
                    {event.detail}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Link
                      href={`/batch/${event.batch.id}`}
                      className="text-[8px] font-mono text-eco-blue hover:underline"
                    >
                      {event.batch.code}
                    </Link>
                    <span className="text-[8px] text-eco-muted-2">
                      {new Date(event.timestamp).toLocaleString("es-MX", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {events.length > 6 && (
            <div className="pt-2 border-t border-black/[0.04]">
              <Link
                href="/activity"
                className="text-[10px] text-eco-blue hover:underline font-medium"
              >
                Ver todo →
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 text-eco-muted-2">
          <p className="text-xs">Sin eventos registrados</p>
        </div>
      )}
    </div>
  );
}
