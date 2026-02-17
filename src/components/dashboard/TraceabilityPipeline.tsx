"use client";

import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

interface TraceabilityPipelineProps {
  stats: {
    totalBatches: number;
    totalFeedstockKg: number;
    totalOilLiters: number;
    totalCO2Avoided: number;
  };
  totalCerts: number;
}

/* Circle geometry */
const CX = 200, CY = 180, CR = 100, NR = 18, N = 7;

const STATIONS = [
  { label: "Recolección", color: "#273949", bg: "rgba(39,57,73,0.03)" },
  { label: "Transporte", color: "#273949", bg: "rgba(39,57,73,0.03)" },
  { label: "Planta", color: "#273949", bg: "rgba(39,57,73,0.03)" },
  { label: "Pirólisis", color: "#E8700A", bg: "rgba(232,112,10,0.04)" },
  { label: "Aceite", color: "#7C5CFC", bg: "rgba(124,92,252,0.04)" },
  { label: "Distribución", color: "#7C5CFC", bg: "rgba(124,92,252,0.04)" },
  { label: "Certificación", color: "#3d7a0a", bg: "rgba(61,122,10,0.04)" },
];

/* Icon paths (Feather-style) */
const ICONS: Record<number, JSX.Element> = {
  0: ( // Package
    <g transform="translate(-12,-12)">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </g>
  ),
  1: ( // Truck
    <g transform="translate(-12,-12)">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </g>
  ),
  2: ( // Factory
    <g transform="translate(-12,-12)">
      <path d="M2 20V8l5-5v5l5-5v5l5-5v17" />
      <path d="M2 20h20" />
      <rect x="17" y="2" width="5" height="8" rx="0.5" />
    </g>
  ),
  3: ( // Flame
    <g transform="translate(-12,-12)">
      <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
    </g>
  ),
  4: ( // Droplet
    <g transform="translate(-12,-12)">
      <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
    </g>
  ),
  5: ( // Truck (distribution)
    <g transform="translate(-12,-12)">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </g>
  ),
  6: ( // Shield + Check
    <g transform="translate(-12,-12)">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </g>
  ),
};

function nodePos(i: number) {
  const angle = (i * 2 * Math.PI / N) - Math.PI / 2;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: CX + CR * cos,
    y: CY + CR * sin,
    angle,
    cos,
    sin,
    lx: CX + (CR + 40) * cos,
    ly: CY + (CR + 40) * sin,
    anchor: (cos > 0.25 ? "start" : cos < -0.25 ? "end" : "middle") as "start" | "end" | "middle",
  };
}

const POS = Array.from({ length: N }, (_, i) => nodePos(i));

export function TraceabilityPipeline({ stats, totalCerts }: TraceabilityPipelineProps) {
  const values: (null | { val: number; unit: string; color: string })[] = [
    { val: stats.totalBatches, unit: "lotes", color: "#273949" },
    null,
    null,
    { val: stats.totalFeedstockKg, unit: "kg", color: "#E8700A" },
    { val: stats.totalOilLiters, unit: "L", color: "#7C5CFC" },
    null,
    { val: totalCerts, unit: "certs", color: "#3d7a0a" },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft border border-black/[0.03] h-full flex flex-col">
      <h3 className="text-[11px] tracking-[2px] text-eco-muted uppercase font-medium mb-1">
        Ciclo de vida
      </h3>
      <div className="flex-1 flex items-center justify-center">
        <svg viewBox="0 0 400 370" className="w-full max-w-[400px]">
          <defs>
            <linearGradient id="circG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#273949" />
              <stop offset="45%" stopColor="#E8700A" />
              <stop offset="100%" stopColor="#3d7a0a" />
            </linearGradient>
            <filter id="cns" x="-25%" y="-20%" width="150%" height="150%">
              <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodColor="#273949" floodOpacity="0.08" />
            </filter>
            <linearGradient id="cflameG" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#E8700A" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>
          </defs>

          {/* Circle track — soft background */}
          <circle cx={CX} cy={CY} r={CR} fill="none"
            stroke="rgba(39,57,73,0.04)" strokeWidth="36" />

          {/* Circle track — flowing dashes */}
          <circle cx={CX} cy={CY} r={CR} fill="none"
            stroke="url(#circG)" strokeWidth="1.5"
            strokeDasharray="7 5" className="circle-flow" />

          {/* Directional chevrons between nodes */}
          {POS.map((p, i) => {
            const n = POS[(i + 1) % N];
            const mx = (p.x + n.x) / 2;
            const my = (p.y + n.y) / 2;
            const dx = n.x - p.x, dy = n.y - p.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const ux = dx / len, uy = dy / len;
            const px = -uy, py = ux;
            return (
              <path key={`ch${i}`}
                d={`M${mx - ux * 4 + px * 4},${my - uy * 4 + py * 4} L${mx + ux * 3},${my + uy * 3} L${mx - ux * 4 - px * 4},${my - uy * 4 - py * 4}`}
                fill="none" stroke="url(#circG)" strokeWidth="1"
                strokeLinecap="round" strokeLinejoin="round" opacity="0.2" />
            );
          })}

          {/* Flowing particles around the circle */}
          <g transform={`translate(${CX},${CY})`}>
            {[0, 2.8, 5.6].map((delay, i) => (
              <circle key={`cpt${i}`} r="2.5" fill="url(#circG)">
                <animateMotion
                  dur="9s" begin={`${delay}s`} repeatCount="indefinite"
                  path={`M0,${-CR} A${CR},${CR} 0 0,1 0,${CR} A${CR},${CR} 0 0,1 0,${-CR}`}
                />
                <animate attributeName="opacity" values="0;0.5;0.5;0"
                  dur="9s" begin={`${delay}s`} repeatCount="indefinite" />
              </circle>
            ))}
          </g>

          {/* Accent: Reactor heat glow */}
          <circle cx={POS[3].x} cy={POS[3].y} r={NR}
            fill="none" stroke="#E8700A" strokeWidth="1.5">
            <animate attributeName="r" values={`${NR};${NR + 10}`} dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Mini flames */}
          {[-5, 1, 7].map((off, fi) => (
            <path key={`fl${fi}`}
              d={`M${POS[3].x + off - 2.5},${POS[3].y + NR + 2} Q${POS[3].x + off},${POS[3].y + NR - 4} ${POS[3].x + off + 2.5},${POS[3].y + NR + 2}`}
              fill="url(#cflameG)">
              <animate attributeName="opacity" values="0.35;0.85;0.35"
                dur={`${0.6 + fi * 0.12}s`} begin={`${fi * 0.2}s`} repeatCount="indefinite" />
            </path>
          ))}

          {/* Accent: Oil drips */}
          <circle cx={POS[4].x} r="2" fill="#7C5CFC">
            <animate attributeName="cy" values={`${POS[4].y + NR};${POS[4].y + NR + 12}`}
              dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.5;0" dur="1.5s" repeatCount="indefinite" />
          </circle>

          {/* Accent: Cert pulse */}
          <circle cx={POS[6].x} cy={POS[6].y} r={NR}
            fill="none" stroke="#3d7a0a" strokeWidth="1.5">
            <animate attributeName="r" values={`${NR};${NR + 12}`} dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0" dur="2.5s" repeatCount="indefinite" />
          </circle>

          {/* Station nodes */}
          {STATIONS.map((st, i) => (
            <g key={`n${i}`}>
              <circle cx={POS[i].x} cy={POS[i].y} r={NR}
                fill="white" stroke={st.color} strokeWidth="2" filter="url(#cns)" />
              <circle cx={POS[i].x} cy={POS[i].y} r={NR - 3}
                fill={st.bg} stroke="none" />
              <g transform={`translate(${POS[i].x},${POS[i].y}) scale(0.5)`}
                fill="none" stroke={st.color} strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                {ICONS[i]}
              </g>
            </g>
          ))}

          {/* Labels + values */}
          {STATIONS.map((st, i) => {
            const p = POS[i];
            const v = values[i];
            const foX = p.anchor === "start" ? p.lx : p.anchor === "end" ? p.lx - 85 : p.lx - 42;
            return (
              <g key={`lbl${i}`}>
                <text x={p.lx} y={p.ly}
                  textAnchor={p.anchor} dominantBaseline="central"
                  fontSize="7.5" fontWeight="600"
                  fontFamily="'JetBrains Mono', monospace"
                  fill={st.color}>
                  {st.label}
                </text>
                {v && (
                  <foreignObject x={foX} y={p.ly + 5} width="85" height="20">
                    <div style={{
                      textAlign: p.anchor === "start" ? "left" : p.anchor === "end" ? "right" : "center",
                      lineHeight: 1,
                    }}>
                      <span style={{ color: v.color }}>
                        <AnimatedCounter value={v.val} className="font-mono text-[10px] font-bold" />
                      </span>
                      <span style={{ fontSize: "7px", color: "rgba(39,57,73,0.4)", marginLeft: "2px" }}>
                        {v.unit}
                      </span>
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}

          {/* Center — CO₂ metric */}
          <g>
            <circle cx={CX} cy={CY} r="28" fill="rgba(61,122,10,0.04)" stroke="rgba(61,122,10,0.1)" strokeWidth="1" />
            <foreignObject x={CX - 35} y={CY - 16} width="70" height="36">
              <div style={{ textAlign: "center", lineHeight: 1.2 }}>
                <span style={{ color: "#3d7a0a" }}>
                  <AnimatedCounter value={stats.totalCO2Avoided} decimals={1} className="font-mono text-xs font-bold" />
                </span>
                <div style={{ fontSize: "6px", color: "rgba(39,57,73,0.4)", marginTop: "2px", letterSpacing: "0.5px" }}>
                  kg CO₂ evitadas
                </div>
              </div>
            </foreignObject>
          </g>
        </svg>
      </div>
    </div>
  );
}
