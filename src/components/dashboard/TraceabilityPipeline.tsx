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

/* Station X positions (7 evenly spaced across 960px) */
const SX = [68, 205, 342, 479, 616, 753, 890];
const CY = 78; /* Flow line Y center */
const R = 27; /* Node radius */

export function TraceabilityPipeline({ stats, totalCerts }: TraceabilityPipelineProps) {
  return (
    <div className="bg-eco-surface border border-eco-border rounded-xl p-5">
      <h3 className="text-[10px] tracking-[2px] text-eco-muted uppercase mb-3">
        Pipeline de trazabilidad
      </h3>
      <div className="w-full overflow-x-auto">
        <svg viewBox="0 0 960 195" className="w-full min-w-[720px]">
          <defs>
            <linearGradient id="flowG" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#273949" />
              <stop offset="40%" stopColor="#E8700A" />
              <stop offset="100%" stopColor="#3d7a0a" />
            </linearGradient>
            <linearGradient id="trackG" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#273949" stopOpacity="0.06" />
              <stop offset="40%" stopColor="#E8700A" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#3d7a0a" stopOpacity="0.06" />
            </linearGradient>
            <filter id="ns" x="-20%" y="-15%" width="140%" height="145%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#273949" floodOpacity="0.1" />
            </filter>
            <linearGradient id="flameG" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#E8700A" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>
          </defs>

          {/* ═══ FLOW TRACK ═══ */}
          <line x1={SX[0]} y1={CY} x2={SX[6]} y2={CY}
            stroke="url(#trackG)" strokeWidth="48" strokeLinecap="round" />
          <line x1={SX[0]} y1={CY} x2={SX[6]} y2={CY}
            stroke="url(#flowG)" strokeWidth="2" strokeLinecap="round"
            strokeDasharray="8 6" className="flow-dash" />

          {/* Directional chevrons between nodes */}
          {SX.slice(0, -1).map((x, i) => {
            const mx = (x + SX[i + 1]) / 2;
            return (
              <path key={`ch${i}`}
                d={`M${mx - 5},${CY - 6} L${mx + 3},${CY} L${mx - 5},${CY + 6}`}
                fill="none" stroke="url(#flowG)" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" opacity="0.2" />
            );
          })}

          {/* Flowing particles along track */}
          {[0, 1.8, 3.6].map((delay, i) => (
            <circle key={`pt${i}`} cy={CY} r="3" fill="url(#flowG)">
              <animate attributeName="cx" from={SX[0]} to={SX[6]}
                dur="6s" begin={`${delay}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0.45;0.45;0"
                dur="6s" begin={`${delay}s`} repeatCount="indefinite" />
            </circle>
          ))}

          {/* ═══ ACCENT ANIMATIONS ═══ */}

          {/* Plant: smoke puffs rising */}
          <circle cx={SX[2] + 2} r="3" fill="#273949">
            <animate attributeName="cy" values={`${CY - 34};${CY - 56}`} dur="3s" repeatCount="indefinite" />
            <animate attributeName="r" values="2;6" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.12;0" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx={SX[2] - 4} r="2.5" fill="#273949">
            <animate attributeName="cy" values={`${CY - 30};${CY - 50}`} dur="3.5s" begin="1.2s" repeatCount="indefinite" />
            <animate attributeName="r" values="1.5;5" dur="3.5s" begin="1.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.1;0" dur="3.5s" begin="1.2s" repeatCount="indefinite" />
          </circle>

          {/* Reactor: heat glow ring */}
          <circle cx={SX[3]} cy={CY} r={R} fill="none" stroke="#E8700A" strokeWidth="2">
            <animate attributeName="r" values={`${R};${R + 12}`} dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.35;0" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Reactor: heat shimmer waves */}
          <path d={`M${SX[3] - 18},${CY - 40} Q${SX[3] - 6},${CY - 48} ${SX[3]},${CY - 40} Q${SX[3] + 6},${CY - 32} ${SX[3] + 18},${CY - 40}`}
            fill="none" stroke="#E8700A" strokeWidth="0.8" opacity="0.2"
            style={{ animation: "heatRise 2s ease-in-out infinite" }} />
          <path d={`M${SX[3] - 12},${CY - 46} Q${SX[3]},${CY - 52} ${SX[3] + 12},${CY - 46}`}
            fill="none" stroke="#E8700A" strokeWidth="0.6" opacity="0.12"
            style={{ animation: "heatRise 2.5s ease-in-out infinite 0.5s" }} />
          {/* Reactor: mini flames below node */}
          <path d={`M${SX[3] - 10},${CY + R + 4} Q${SX[3] - 7},${CY + R - 4} ${SX[3] - 4},${CY + R + 4}`} fill="url(#flameG)">
            <animate attributeName="opacity" values="0.5;0.9;0.5" dur="0.7s" repeatCount="indefinite" />
          </path>
          <path d={`M${SX[3] - 2},${CY + R + 4} Q${SX[3] + 2},${CY + R - 6} ${SX[3] + 6},${CY + R + 4}`} fill="url(#flameG)">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="0.9s" begin="0.2s" repeatCount="indefinite" />
          </path>
          <path d={`M${SX[3] + 5},${CY + R + 4} Q${SX[3] + 9},${CY + R - 3} ${SX[3] + 13},${CY + R + 4}`} fill="url(#flameG)">
            <animate attributeName="opacity" values="0.45;0.85;0.45" dur="0.8s" begin="0.5s" repeatCount="indefinite" />
          </path>

          {/* Oil: drip particles */}
          <circle cx={SX[4]} r="2.5" fill="#7C5CFC">
            <animate attributeName="cy" values={`${CY + R + 2};${CY + R + 18}`} dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.6;0" dur="1.6s" repeatCount="indefinite" />
          </circle>
          <circle cx={SX[4] + 6} r="2" fill="#7C5CFC">
            <animate attributeName="cy" values={`${CY + R + 2};${CY + R + 16}`} dur="2s" begin="0.7s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.4;0" dur="2s" begin="0.7s" repeatCount="indefinite" />
          </circle>

          {/* Cert: pulse ring */}
          <circle cx={SX[6]} cy={CY} r={R} fill="none" stroke="#3d7a0a" strokeWidth="2">
            <animate attributeName="r" values={`${R};${R + 16}`} dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0" dur="2.5s" repeatCount="indefinite" />
          </circle>

          {/* ═══ STATION NODES ═══ */}

          {/* Node 1: Recoleccion */}
          <circle cx={SX[0]} cy={CY} r={R} fill="white" stroke="#273949" strokeWidth="2.2" filter="url(#ns)" />
          <circle cx={SX[0]} cy={CY} r={R - 3} fill="rgba(39,57,73,0.03)" stroke="none" />
          <g transform={`translate(${SX[0]},${CY}) scale(0.65)`} fill="none" stroke="#273949" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <g transform="translate(-12,-12)">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </g>
          </g>

          {/* Node 2: Transporte Entrada */}
          <circle cx={SX[1]} cy={CY} r={R} fill="white" stroke="#273949" strokeWidth="2.2" filter="url(#ns)" />
          <circle cx={SX[1]} cy={CY} r={R - 3} fill="rgba(39,57,73,0.03)" stroke="none" />
          <g transform={`translate(${SX[1]},${CY}) scale(0.65)`} fill="none" stroke="#273949" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <g transform="translate(-12,-12)">
              <rect x="1" y="3" width="15" height="13" rx="1" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </g>
          </g>

          {/* Node 3: Planta */}
          <circle cx={SX[2]} cy={CY} r={R} fill="white" stroke="#273949" strokeWidth="2.2" filter="url(#ns)" />
          <circle cx={SX[2]} cy={CY} r={R - 3} fill="rgba(39,57,73,0.03)" stroke="none" />
          <g transform={`translate(${SX[2]},${CY}) scale(0.65)`} fill="none" stroke="#273949" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <g transform="translate(-12,-12)">
              <path d="M2 20V8l5-5v5l5-5v5l5-5v17" />
              <path d="M2 20h20" />
              <rect x="17" y="2" width="5" height="8" rx="0.5" />
            </g>
          </g>

          {/* Node 4: Pirolisis */}
          <circle cx={SX[3]} cy={CY} r={R} fill="white" stroke="#E8700A" strokeWidth="2.2" filter="url(#ns)" />
          <circle cx={SX[3]} cy={CY} r={R - 3} fill="rgba(232,112,10,0.04)" stroke="none" />
          <g transform={`translate(${SX[3]},${CY}) scale(0.65)`} fill="none" stroke="#E8700A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <g transform="translate(-12,-12)">
              <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
            </g>
          </g>

          {/* Node 5: Aceite */}
          <circle cx={SX[4]} cy={CY} r={R} fill="white" stroke="#7C5CFC" strokeWidth="2.2" filter="url(#ns)" />
          <circle cx={SX[4]} cy={CY} r={R - 3} fill="rgba(124,92,252,0.04)" stroke="none" />
          <g transform={`translate(${SX[4]},${CY}) scale(0.65)`} fill="none" stroke="#7C5CFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <g transform="translate(-12,-12)">
              <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
            </g>
          </g>

          {/* Node 6: Distribucion */}
          <circle cx={SX[5]} cy={CY} r={R} fill="white" stroke="#7C5CFC" strokeWidth="2.2" filter="url(#ns)" />
          <circle cx={SX[5]} cy={CY} r={R - 3} fill="rgba(124,92,252,0.04)" stroke="none" />
          <g transform={`translate(${SX[5]},${CY}) scale(0.65)`} fill="none" stroke="#7C5CFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <g transform="translate(-12,-12)">
              <rect x="1" y="3" width="15" height="13" rx="1" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </g>
          </g>

          {/* Node 7: Certificacion */}
          <circle cx={SX[6]} cy={CY} r={R} fill="white" stroke="#3d7a0a" strokeWidth="2.2" filter="url(#ns)" />
          <circle cx={SX[6]} cy={CY} r={R - 3} fill="rgba(61,122,10,0.04)" stroke="none" />
          <g transform={`translate(${SX[6]},${CY}) scale(0.65)`} fill="none" stroke="#3d7a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <g transform="translate(-12,-12)">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </g>
          </g>

          {/* ═══ STEP NUMBERS ═══ */}
          {SX.map((x, i) => (
            <text key={`sn${i}`} x={x} y={CY - R - 10}
              textAnchor="middle" fontSize="9" fontWeight="600"
              fontFamily="'JetBrains Mono', monospace"
              fill="rgba(39,57,73,0.25)">
              {`0${i + 1}`}
            </text>
          ))}

          {/* ═══ LABELS ═══ */}

          {/* Station 1: Recoleccion */}
          <foreignObject x={SX[0] - 50} y={CY + R + 10} width="100" height="50">
            <div style={{ textAlign: "center" }}>
              <span style={{ color: "#273949" }}>
                <AnimatedCounter value={stats.totalBatches} className="font-mono text-sm font-bold" />
              </span>
              <div style={{ fontSize: "8px", color: "rgba(39,57,73,0.45)", textTransform: "uppercase", letterSpacing: "1.5px", marginTop: "2px" }}>
                lotes
              </div>
            </div>
          </foreignObject>

          {/* Station 2: Transporte */}
          <foreignObject x={SX[1] - 50} y={CY + R + 10} width="100" height="50">
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "10px", fontWeight: 600, color: "#273949", fontFamily: "'JetBrains Mono', monospace" }}>
                Transporte
              </div>
              <div style={{ fontSize: "8px", color: "rgba(39,57,73,0.45)", textTransform: "uppercase", letterSpacing: "1.5px", marginTop: "2px" }}>
                entrada
              </div>
            </div>
          </foreignObject>

          {/* Station 3: Planta */}
          <foreignObject x={SX[2] - 50} y={CY + R + 10} width="100" height="50">
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#273949", fontFamily: "'JetBrains Mono', monospace" }}>
                DY-500
              </div>
              <div style={{ fontSize: "8px", color: "rgba(39,57,73,0.45)", textTransform: "uppercase", letterSpacing: "1.5px", marginTop: "2px" }}>
                planta activa
              </div>
            </div>
          </foreignObject>

          {/* Station 4: Pirolisis */}
          <foreignObject x={SX[3] - 50} y={CY + R + 10} width="100" height="50">
            <div style={{ textAlign: "center" }}>
              <span style={{ color: "#E8700A" }}>
                <AnimatedCounter value={stats.totalFeedstockKg} className="font-mono text-sm font-bold" />
              </span>
              <div style={{ fontSize: "8px", color: "rgba(39,57,73,0.45)", textTransform: "uppercase", letterSpacing: "1.5px", marginTop: "2px" }}>
                kg procesados
              </div>
            </div>
          </foreignObject>

          {/* Station 5: Aceite */}
          <foreignObject x={SX[4] - 50} y={CY + R + 10} width="100" height="50">
            <div style={{ textAlign: "center" }}>
              <span style={{ color: "#7C5CFC" }}>
                <AnimatedCounter value={stats.totalOilLiters} className="font-mono text-sm font-bold" suffix=" L" />
              </span>
              <div style={{ fontSize: "8px", color: "rgba(39,57,73,0.45)", textTransform: "uppercase", letterSpacing: "1.5px", marginTop: "2px" }}>
                aceite
              </div>
            </div>
          </foreignObject>

          {/* Station 6: Distribucion */}
          <foreignObject x={SX[5] - 50} y={CY + R + 10} width="100" height="50">
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "10px", fontWeight: 600, color: "#7C5CFC", fontFamily: "'JetBrains Mono', monospace" }}>
                Distribución
              </div>
              <div style={{ fontSize: "8px", color: "rgba(39,57,73,0.45)", textTransform: "uppercase", letterSpacing: "1.5px", marginTop: "2px" }}>
                diesel verde
              </div>
            </div>
          </foreignObject>

          {/* Station 7: Certificacion */}
          <foreignObject x={SX[6] - 50} y={CY + R + 10} width="100" height="50">
            <div style={{ textAlign: "center" }}>
              <span style={{ color: "#3d7a0a" }}>
                <AnimatedCounter value={totalCerts} className="font-mono text-sm font-bold" />
              </span>
              <div style={{ fontSize: "8px", color: "rgba(39,57,73,0.45)", textTransform: "uppercase", letterSpacing: "1.5px", marginTop: "2px" }}>
                certificados
              </div>
            </div>
          </foreignObject>
        </svg>
      </div>
    </div>
  );
}
