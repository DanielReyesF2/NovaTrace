"use client";

interface LifecycleFlowProps {
  feedstockKg: number;
  distanceKm: number;
  durationH: number;
  oilL: number;
  co2Avoided: number;
  fuelForTruck: number;
  lang: "es" | "en";
}

export function LifecycleFlow({
  feedstockKg,
  distanceKm,
  durationH,
  oilL,
  co2Avoided,
  fuelForTruck,
  lang,
}: LifecycleFlowProps) {
  const t = (es: string, en: string) => (lang === "es" ? es : en);
  const surplus = oilL - fuelForTruck;

  // Layout
  const W = 760;
  const H = 280;

  // Stage X positions (6 stages evenly spaced)
  const stages = [
    { x: 65,  label: t("ORIGEN", "ORIGIN"),           value: `${feedstockKg} kg`,       sub: t("plástico agrícola", "agricultural plastic"), color: "#64748b", iconColor: "#475569" },
    { x: 190, label: t("TRASLADO", "TRANSPORT"),       value: `${distanceKm} km`,        sub: t("Michoacán → Lerma", "Michoacán → Lerma"),    color: "#92400e", iconColor: "#78350f" },
    { x: 320, label: t("PIRÓLISIS", "PYROLYSIS"),      value: `${durationH}h`,           sub: t("catalítica", "catalytic"),                    color: "#E8700A", iconColor: "#c2410c" },
    { x: 445, label: t("REFINACIÓN", "REFINING"),      value: t("H₂SO₄/NaOH", "H₂SO₄/NaOH"), sub: t("destilación + lavado", "distillation + wash"), color: "#7C5CFC", iconColor: "#6d28d9" },
    { x: 570, label: t("PRODUCTO", "PRODUCT"),         value: `${oilL} L`,               sub: t("diésel pirolítico", "pyrolytic diesel"),      color: "#7C5CFC", iconColor: "#6d28d9" },
    { x: 695, label: t("IMPACTO", "IMPACT"),           value: `-${co2Avoided}`,          sub: "kg CO₂eq",                                     color: "#3d5c0e", iconColor: "#365314" },
  ];

  const pathY = 85;
  const nodeR = 24;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: "auto" }} preserveAspectRatio="xMidYMid meet">
      <defs>
        {/* Main path gradient */}
        <linearGradient id="lf-path" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#64748b" stopOpacity="0.3" />
          <stop offset="20%" stopColor="#92400e" stopOpacity="0.3" />
          <stop offset="40%" stopColor="#E8700A" stopOpacity="0.3" />
          <stop offset="60%" stopColor="#7C5CFC" stopOpacity="0.25" />
          <stop offset="80%" stopColor="#7C5CFC" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3d5c0e" stopOpacity="0.3" />
        </linearGradient>
        {/* Return loop gradient */}
        <linearGradient id="lf-return" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#7C5CFC" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#92400e" stopOpacity="0.2" />
        </linearGradient>
        {/* Glow filter for nodes */}
        <filter id="lf-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Background landscape silhouette ── */}
      {/* Mountains (Michoacán) */}
      <path d="M 0 95 Q 20 40, 50 70 Q 70 50, 95 75 Q 110 55, 130 80 L 130 95 Z" fill="#64748b" opacity="0.06" />
      {/* Factory silhouette (center) */}
      <rect x="305" y="65" width="30" height="30" rx="2" fill="#E8700A" opacity="0.04" />
      <rect x="310" y="55" width="8" height="15" rx="1" fill="#E8700A" opacity="0.04" />
      {/* Tree silhouette (right) */}
      <circle cx="700" cy="72" r="15" fill="#3d5c0e" opacity="0.04" />
      <rect x="698" y="82" width="4" height="13" rx="1" fill="#3d5c0e" opacity="0.04" />

      {/* ── Main flowing path ── */}
      <path
        d={`M ${stages[0].x} ${pathY} ${stages.slice(1).map(s => `L ${s.x} ${pathY}`).join(' ')}`}
        stroke="url(#lf-path)"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />

      {/* ── Stage connector dots (small) on the path ── */}
      {stages.slice(0, -1).map((s, i) => {
        const next = stages[i + 1];
        const midX = (s.x + next.x) / 2;
        return (
          <g key={`arrow-${i}`}>
            {/* Small chevron arrow */}
            <path
              d={`M ${midX - 4} ${pathY - 4} L ${midX + 2} ${pathY} L ${midX - 4} ${pathY + 4}`}
              stroke={s.color}
              strokeWidth="1.5"
              fill="none"
              opacity="0.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        );
      })}

      {/* ── Stage nodes ── */}
      {stages.map((s, i) => (
        <g key={s.label}>
          {/* Outer glow ring */}
          <circle cx={s.x} cy={pathY} r={nodeR + 4} fill={s.color} opacity="0.06" />
          {/* Node circle */}
          <circle cx={s.x} cy={pathY} r={nodeR} fill="white" stroke={s.color} strokeWidth="2.5" />

          {/* ── Icons inside nodes ── */}
          {i === 0 && (
            /* Field/mountain icon */
            <g transform={`translate(${s.x - 10}, ${pathY - 10})`}>
              <path d="M 3 18 L 10 4 L 17 18 Z" fill="none" stroke={s.iconColor} strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M 0 18 L 7 10 L 12 14 L 20 6" fill="none" stroke={s.iconColor} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
            </g>
          )}
          {i === 1 && (
            /* Truck icon */
            <g transform={`translate(${s.x - 11}, ${pathY - 8})`}>
              <rect x="0" y="2" width="14" height="10" rx="1.5" fill="none" stroke={s.iconColor} strokeWidth="1.8" />
              <path d="M 14 5 L 19 5 L 22 9 L 22 12 L 14 12 Z" fill="none" stroke={s.iconColor} strokeWidth="1.8" strokeLinejoin="round" />
              <circle cx="5" cy="14" r="2" fill="none" stroke={s.iconColor} strokeWidth="1.5" />
              <circle cx="18" cy="14" r="2" fill="none" stroke={s.iconColor} strokeWidth="1.5" />
            </g>
          )}
          {i === 2 && (
            /* Reactor/flame icon */
            <g transform={`translate(${s.x - 9}, ${pathY - 11})`}>
              <rect x="2" y="4" width="14" height="16" rx="3" fill="none" stroke={s.iconColor} strokeWidth="1.8" />
              <path d="M 9 8 Q 6 12, 9 14 Q 12 12, 9 8" fill={s.iconColor} opacity="0.4" />
              <line x1="5" y1="1" x2="5" y2="4" stroke={s.iconColor} strokeWidth="1.2" opacity="0.5" />
              <line x1="9" y1="0" x2="9" y2="4" stroke={s.iconColor} strokeWidth="1.2" opacity="0.5" />
              <line x1="13" y1="1" x2="13" y2="4" stroke={s.iconColor} strokeWidth="1.2" opacity="0.5" />
            </g>
          )}
          {i === 3 && (
            /* Distillation column icon */
            <g transform={`translate(${s.x - 8}, ${pathY - 12})`}>
              <rect x="4" y="0" width="8" height="22" rx="2" fill="none" stroke={s.iconColor} strokeWidth="1.8" />
              <line x1="4" y1="6" x2="12" y2="6" stroke={s.iconColor} strokeWidth="1" opacity="0.4" />
              <line x1="4" y1="11" x2="12" y2="11" stroke={s.iconColor} strokeWidth="1" opacity="0.4" />
              <line x1="4" y1="16" x2="12" y2="16" stroke={s.iconColor} strokeWidth="1" opacity="0.4" />
              <circle cx="2" cy="20" r="1.5" fill={s.iconColor} opacity="0.3" />
              <circle cx="14" cy="3" r="1.5" fill={s.iconColor} opacity="0.3" />
            </g>
          )}
          {i === 4 && (
            /* Oil barrel icon */
            <g transform={`translate(${s.x - 9}, ${pathY - 11})`}>
              <rect x="2" y="2" width="14" height="18" rx="3" fill="none" stroke={s.iconColor} strokeWidth="1.8" />
              <line x1="2" y1="7" x2="16" y2="7" stroke={s.iconColor} strokeWidth="1.2" />
              <line x1="2" y1="15" x2="16" y2="15" stroke={s.iconColor} strokeWidth="1.2" />
              <path d="M 7 9 L 9 13 L 11 9" fill="none" stroke={s.iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
          {i === 5 && (
            /* Leaf/eco icon */
            <g transform={`translate(${s.x - 10}, ${pathY - 10})`}>
              <path d="M 10 18 Q 4 14, 3 8 Q 2 2, 10 2 Q 18 2, 17 8 Q 16 14, 10 18 Z" fill={s.iconColor} opacity="0.15" stroke={s.iconColor} strokeWidth="1.5" />
              <path d="M 10 18 Q 8 12, 10 6" fill="none" stroke={s.iconColor} strokeWidth="1.2" />
              <path d="M 8 10 L 10 12" fill="none" stroke={s.iconColor} strokeWidth="1" strokeLinecap="round" />
            </g>
          )}

          {/* Value (prominent) */}
          <text x={s.x} y={pathY + nodeR + 18} textAnchor="middle"
            style={{ fontSize: 13, fontWeight: 800, fill: s.color, fontFamily: "ui-monospace, monospace" }}>
            {s.value}
          </text>

          {/* Label */}
          <text x={s.x} y={pathY - nodeR - 10} textAnchor="middle"
            style={{ fontSize: 7.5, fontWeight: 700, fill: s.color, letterSpacing: "1.5px" }}>
            {s.label}
          </text>

          {/* Sub-label */}
          <text x={s.x} y={pathY + nodeR + 32} textAnchor="middle"
            style={{ fontSize: 8, fill: "#6b7280", fontWeight: 500 }}>
            {s.sub}
          </text>
        </g>
      ))}

      {/* ── Reverse logistics loop ── */}
      <path
        d={`M ${stages[4].x} ${pathY + nodeR + 42} Q ${stages[4].x} ${H - 25}, ${(stages[1].x + stages[4].x) / 2} ${H - 25} Q ${stages[1].x} ${H - 25}, ${stages[1].x} ${pathY + nodeR + 42}`}
        stroke="url(#lf-return)"
        strokeWidth="3"
        fill="none"
        strokeDasharray="8 4"
        strokeLinecap="round"
      />

      {/* Arrow at the end of the return loop (pointing up to truck) */}
      <path
        d={`M ${stages[1].x - 5} ${pathY + nodeR + 48} L ${stages[1].x} ${pathY + nodeR + 40} L ${stages[1].x + 5} ${pathY + nodeR + 48}`}
        stroke="#92400e"
        strokeWidth="2"
        fill="none"
        opacity="0.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Return loop label */}
      <rect
        x={(stages[1].x + stages[4].x) / 2 - 72}
        y={H - 38}
        width="144"
        height="22"
        rx="11"
        fill="white"
        stroke="#92400e"
        strokeWidth="1"
        opacity="0.9"
      />
      <text
        x={(stages[1].x + stages[4].x) / 2}
        y={H - 23}
        textAnchor="middle"
        style={{ fontSize: 8.5, fill: "#92400e", fontWeight: 600 }}
      >
        {t(`↺ ${fuelForTruck} L alimentan el camión · ${surplus} L excedente`, `↺ ${fuelForTruck} L fuel the truck · ${surplus} L surplus`)}
      </text>
    </svg>
  );
}
