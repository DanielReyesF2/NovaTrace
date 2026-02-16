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

export function TraceabilityPipeline({ stats, totalCerts }: TraceabilityPipelineProps) {
  return (
    <div className="bg-eco-surface border border-eco-border rounded-xl p-5">
      <h3 className="text-[10px] tracking-[2px] text-eco-muted uppercase mb-4">
        Pipeline de trazabilidad
      </h3>
      <div className="w-full overflow-x-auto">
        <svg
          viewBox="0 0 920 220"
          className="w-full min-w-[700px]"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Pipeline de trazabilidad animado"
        >
          <defs>
            {/* Gradient for flow arrows */}
            <linearGradient id="flowGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#273949" />
              <stop offset="100%" stopColor="#3d7a0a" />
            </linearGradient>
            {/* Flame gradient */}
            <linearGradient id="flameGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#E8700A" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>
            {/* Oil purple gradient */}
            <linearGradient id="oilGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9d7dff" />
              <stop offset="100%" stopColor="#7C5CFC" />
            </linearGradient>
          </defs>

          {/* ═══ FLOW CONNECTIONS ═══ */}
          {/* Connection 1→2 */}
          <path
            d="M95,120 L115,120"
            stroke="url(#flowGrad)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="6 4"
            className="flow-dash"
          />
          {/* Connection 2→3: Road */}
          <line
            x1="245" y1="155" x2="265" y2="155"
            stroke="url(#flowGrad)"
            strokeWidth="2"
            strokeDasharray="6 4"
            className="flow-dash"
          />
          {/* Connection 3→4 */}
          <path
            d="M395,120 L415,120"
            stroke="url(#flowGrad)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="6 4"
            className="flow-dash"
          />
          {/* Connection 4→5: pipe */}
          <path
            d="M548,110 L565,110"
            stroke="#7C5CFC"
            strokeWidth="3"
            fill="none"
          />
          {/* Connection 5→6 */}
          <line
            x1="650" y1="120" x2="665" y2="120"
            stroke="url(#flowGrad)"
            strokeWidth="2"
            strokeDasharray="6 4"
            className="flow-dash"
          />
          {/* Connection 6→7 */}
          <line
            x1="785" y1="155" x2="800" y2="155"
            stroke="url(#flowGrad)"
            strokeWidth="2"
            strokeDasharray="6 4"
            className="flow-dash"
          />

          {/* ═══ STATION 1: RECOLECCIÓN (x: 0-100) ═══ */}
          <g transform="translate(10, 70)">
            {/* Plastic bag 1 */}
            <polygon
              points="20,60 40,60 45,30 35,20 25,20 15,30"
              fill="rgba(39,57,73,0.08)"
              stroke="#273949"
              strokeWidth="1.2"
            />
            {/* Bag tie */}
            <line x1="30" y1="20" x2="30" y2="12" stroke="#273949" strokeWidth="1.2" />
            <circle cx="30" cy="10" r="3" fill="none" stroke="#273949" strokeWidth="1" />
            {/* Plastic bag 2 (smaller, behind) */}
            <polygon
              points="50,60 65,60 68,38 60,30 52,30 48,38"
              fill="rgba(39,57,73,0.05)"
              stroke="#273949"
              strokeWidth="1"
              opacity="0.6"
            />
            {/* Recycle arrow - rotating */}
            <g
              style={{ transformOrigin: "30px 42px", animation: "wheelSpin 4s linear infinite" }}
            >
              <path
                d="M22,42 A10,10 0 0,1 38,42"
                fill="none"
                stroke="#3d7a0a"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <polygon points="38,42 35,38 41,40" fill="#3d7a0a" />
              <path
                d="M38,42 A10,10 0 0,1 22,42"
                fill="none"
                stroke="#3d7a0a"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <polygon points="22,42 25,46 19,44" fill="#3d7a0a" />
            </g>
          </g>
          {/* Label: totalBatches */}
          <foreignObject x="5" y="175" width="90" height="40">
            <div style={{ textAlign: "center" }}>
              <span style={{ color: "#273949" }}>
                <AnimatedCounter
                  value={stats.totalBatches}
                  className="font-mono text-sm font-bold"
                />
              </span>
              <div style={{ fontSize: "8px", color: "rgba(39,57,73,0.5)", textTransform: "uppercase", letterSpacing: "1.5px", marginTop: "2px" }}>
                lotes
              </div>
            </div>
          </foreignObject>

          {/* ═══ STATION 2: TRANSPORTE ENTRADA (x: 100-250) ═══ */}
          <g transform="translate(110, 95)" style={{ animation: "truckDrift 3s ease-in-out infinite" }}>
            {/* Truck cab */}
            <rect x="0" y="20" width="28" height="25" rx="3" fill="#273949" />
            {/* Windshield */}
            <rect x="3" y="23" width="10" height="10" rx="1" fill="rgba(45,140,240,0.3)" />
            {/* Trailer */}
            <rect x="30" y="12" width="55" height="33" rx="2" fill="rgba(39,57,73,0.12)" stroke="#273949" strokeWidth="1.2" />
            {/* Trailer content lines (plastic bags icon) */}
            <line x1="40" y1="22" x2="40" y2="35" stroke="#273949" strokeWidth="0.8" opacity="0.3" />
            <line x1="50" y1="18" x2="50" y2="35" stroke="#273949" strokeWidth="0.8" opacity="0.3" />
            <line x1="60" y1="22" x2="60" y2="35" stroke="#273949" strokeWidth="0.8" opacity="0.3" />
            {/* Wheel 1 */}
            <g style={{ transformOrigin: "15px 50px", animation: "wheelSpin 0.6s linear infinite" }}>
              <circle cx="15" cy="50" r="6" fill="#273949" />
              <circle cx="15" cy="50" r="2.5" fill="#FAF8F4" />
              {/* Spokes */}
              <line x1="15" y1="44" x2="15" y2="46" stroke="#FAF8F4" strokeWidth="0.8" />
              <line x1="15" y1="54" x2="15" y2="56" stroke="#FAF8F4" strokeWidth="0.8" />
            </g>
            {/* Wheel 2 */}
            <g style={{ transformOrigin: "55px 50px", animation: "wheelSpin 0.6s linear infinite" }}>
              <circle cx="55" cy="50" r="6" fill="#273949" />
              <circle cx="55" cy="50" r="2.5" fill="#FAF8F4" />
              <line x1="55" y1="44" x2="55" y2="46" stroke="#FAF8F4" strokeWidth="0.8" />
              <line x1="55" y1="54" x2="55" y2="56" stroke="#FAF8F4" strokeWidth="0.8" />
            </g>
            {/* Wheel 3 */}
            <g style={{ transformOrigin: "72px 50px", animation: "wheelSpin 0.6s linear infinite" }}>
              <circle cx="72" cy="50" r="6" fill="#273949" />
              <circle cx="72" cy="50" r="2.5" fill="#FAF8F4" />
              <line x1="72" y1="44" x2="72" y2="46" stroke="#FAF8F4" strokeWidth="0.8" />
              <line x1="72" y1="54" x2="72" y2="56" stroke="#FAF8F4" strokeWidth="0.8" />
            </g>
          </g>
          {/* Road under truck 1 */}
          <line
            x1="105" y1="155" x2="250" y2="155"
            stroke="rgba(39,57,73,0.15)"
            strokeWidth="2"
            strokeDasharray="8 5"
            className="flow-dash"
          />

          {/* ═══ STATION 3: PLANTA ECONOVA (x: 250-400) ═══ */}
          <g transform="translate(270, 55)">
            {/* Factory body */}
            <rect x="10" y="50" width="100" height="60" rx="2" fill="rgba(39,57,73,0.08)" stroke="#273949" strokeWidth="1.2" />
            {/* Roof / triangle */}
            <polygon points="10,50 60,20 110,50" fill="rgba(39,57,73,0.05)" stroke="#273949" strokeWidth="1.2" />
            {/* Door */}
            <rect x="45" y="80" width="20" height="30" rx="1" fill="rgba(39,57,73,0.12)" stroke="#273949" strokeWidth="0.8" />
            {/* Windows */}
            <rect x="20" y="62" width="14" height="10" rx="1" fill="rgba(45,140,240,0.15)" stroke="#273949" strokeWidth="0.6" />
            <rect x="80" y="62" width="14" height="10" rx="1" fill="rgba(45,140,240,0.15)" stroke="#273949" strokeWidth="0.6" />
            {/* Chimney */}
            <rect x="85" y="25" width="12" height="30" rx="1" fill="rgba(39,57,73,0.12)" stroke="#273949" strokeWidth="1" />
            {/* Smoke puffs from chimney */}
            <circle cx="91" cy="20" r="5" fill="rgba(39,57,73,0.15)">
              <animate attributeName="cy" values="20;0" dur="3s" repeatCount="indefinite" />
              <animate attributeName="r" values="4;7" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="88" cy="18" r="4" fill="rgba(39,57,73,0.12)">
              <animate attributeName="cy" values="18;-2" dur="3.5s" repeatCount="indefinite" begin="1s" />
              <animate attributeName="r" values="3;6" dur="3.5s" repeatCount="indefinite" begin="1s" />
              <animate attributeName="opacity" values="0.35;0" dur="3.5s" repeatCount="indefinite" begin="1s" />
            </circle>
            <circle cx="94" cy="22" r="3" fill="rgba(39,57,73,0.1)">
              <animate attributeName="cy" values="22;2" dur="2.8s" repeatCount="indefinite" begin="2s" />
              <animate attributeName="r" values="3;5" dur="2.8s" repeatCount="indefinite" begin="2s" />
              <animate attributeName="opacity" values="0.3;0" dur="2.8s" repeatCount="indefinite" begin="2s" />
            </circle>
            {/* Green operational dot */}
            <circle cx="60" cy="30" r="4" fill="#3d7a0a" style={{ animation: "glowPulse 2s ease-in-out infinite" }} />
            <circle cx="60" cy="30" r="7" fill="none" stroke="#3d7a0a" strokeWidth="0.8" opacity="0.3">
              <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>
          {/* Label: Planta DY-500 */}
          <foreignObject x="275" y="175" width="100" height="40">
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "#273949", fontFamily: "'JetBrains Mono', monospace" }}>
                Planta DY-500
              </div>
              <div style={{ fontSize: "8px", color: "rgba(39,57,73,0.5)", textTransform: "uppercase", letterSpacing: "1.5px", marginTop: "2px" }}>
                operativa
              </div>
            </div>
          </foreignObject>

          {/* ═══ STATION 4: REACTOR DE PIRÓLISIS (x: 400-550) ═══ */}
          <g transform="translate(415, 55)">
            {/* Reactor body (cylinder-like) */}
            <rect x="15" y="20" width="80" height="55" rx="12" fill="rgba(232,112,10,0.06)" stroke="#E8700A" strokeWidth="1.5" />
            {/* Reactor internal lines */}
            <line x1="35" y1="30" x2="35" y2="65" stroke="#E8700A" strokeWidth="0.5" opacity="0.3" />
            <line x1="55" y1="25" x2="55" y2="70" stroke="#E8700A" strokeWidth="0.5" opacity="0.3" />
            <line x1="75" y1="30" x2="75" y2="65" stroke="#E8700A" strokeWidth="0.5" opacity="0.3" />
            {/* Temperature indicator */}
            <rect x="40" y="38" width="30" height="12" rx="3" fill="rgba(232,112,10,0.1)" stroke="#E8700A" strokeWidth="0.8" />
            <text x="55" y="48" textAnchor="middle" fontSize="7" fill="#E8700A" fontWeight="600" fontFamily="'JetBrains Mono', monospace">
              450°C
            </text>
            {/* Temperature glow */}
            <rect x="40" y="38" width="30" height="12" rx="3" fill="none" stroke="#E8700A" strokeWidth="0.5">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
            </rect>
            {/* Flames under reactor */}
            {/* Flame 1 */}
            <path d="M30,82 Q33,72 36,82" fill="url(#flameGrad)" opacity="0.9">
              <animate attributeName="d" values="M30,82 Q33,70 36,82;M30,82 Q33,74 36,82;M30,82 Q33,70 36,82" dur="0.7s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;1;0.7" dur="0.7s" repeatCount="indefinite" />
            </path>
            {/* Flame 2 */}
            <path d="M48,82 Q52,70 56,82" fill="url(#flameGrad)" opacity="0.85">
              <animate attributeName="d" values="M48,82 Q52,68 56,82;M48,82 Q52,73 56,82;M48,82 Q52,68 56,82" dur="0.9s" repeatCount="indefinite" begin="0.2s" />
              <animate attributeName="opacity" values="0.6;1;0.6" dur="0.9s" repeatCount="indefinite" begin="0.2s" />
            </path>
            {/* Flame 3 */}
            <path d="M66,82 Q69,72 72,82" fill="url(#flameGrad)" opacity="0.8">
              <animate attributeName="d" values="M66,82 Q69,71 72,82;M66,82 Q69,76 72,82;M66,82 Q69,71 72,82" dur="0.8s" repeatCount="indefinite" begin="0.5s" />
              <animate attributeName="opacity" values="0.65;1;0.65" dur="0.8s" repeatCount="indefinite" begin="0.5s" />
            </path>
            {/* Heat waves above reactor */}
            <path d="M30,15 Q40,10 50,15 Q60,20 70,15 Q80,10 85,15" fill="none" stroke="#E8700A" strokeWidth="0.6" opacity="0.2"
              style={{ animation: "heatRise 2s ease-in-out infinite" }}
            />
            <path d="M35,10 Q45,5 55,10 Q65,15 75,10" fill="none" stroke="#E8700A" strokeWidth="0.5" opacity="0.15"
              style={{ animation: "heatRise 2.5s ease-in-out infinite 0.5s" }}
            />
          </g>
          {/* Label: feedstock kg */}
          <foreignObject x="420" y="175" width="90" height="40">
            <div style={{ textAlign: "center" }}>
              <span style={{ color: "#E8700A" }}>
                <AnimatedCounter
                  value={stats.totalFeedstockKg}
                  className="font-mono text-sm font-bold"
                />
              </span>
              <div style={{ fontSize: "8px", color: "rgba(39,57,73,0.5)", textTransform: "uppercase", letterSpacing: "1.5px", marginTop: "2px" }}>
                kg procesados
              </div>
            </div>
          </foreignObject>

          {/* ═══ STATION 5: PRODUCCIÓN DE ACEITE (x: 550-650) ═══ */}
          <g transform="translate(565, 60)">
            {/* Pipe from reactor */}
            <rect x="-5" y="45" width="20" height="6" rx="2" fill="rgba(124,92,252,0.2)" stroke="#7C5CFC" strokeWidth="1" />
            {/* Collection funnel/tube */}
            <path d="M15,40 L15,55 L25,60 L25,85 L55,85 L55,60 L65,55 L65,40" fill="none" stroke="#7C5CFC" strokeWidth="1.2" />
            {/* Oil drops */}
            <circle cx="35" cy="55" r="2.5" fill="url(#oilGrad)" style={{ animation: "dropFall 1.5s ease-in infinite" }} />
            <circle cx="45" cy="50" r="2" fill="url(#oilGrad)" style={{ animation: "dropFall 1.5s ease-in infinite 0.7s" }} />
            {/* Barrel */}
            <rect x="20" y="85" width="40" height="30" rx="4" fill="rgba(124,92,252,0.06)" stroke="#7C5CFC" strokeWidth="1.2" />
            {/* Barrel bands */}
            <line x1="20" y1="92" x2="60" y2="92" stroke="#7C5CFC" strokeWidth="0.8" opacity="0.4" />
            <line x1="20" y1="108" x2="60" y2="108" stroke="#7C5CFC" strokeWidth="0.8" opacity="0.4" />
            {/* Barrel fill level (animated) */}
            <rect x="22" y="110" width="36" height="0" rx="2" fill="url(#oilGrad)" opacity="0.4">
              <animate attributeName="height" from="0" to="22" dur="4s" fill="freeze" />
              <animate attributeName="y" from="113" to="91" dur="4s" fill="freeze" />
            </rect>
          </g>
          {/* Label: oil liters */}
          <foreignObject x="565" y="175" width="90" height="40">
            <div style={{ textAlign: "center" }}>
              <span style={{ color: "#7C5CFC" }}>
                <AnimatedCounter
                  value={stats.totalOilLiters}
                  className="font-mono text-sm font-bold"
                  suffix=" L"
                />
              </span>
              <div style={{ fontSize: "8px", color: "rgba(39,57,73,0.5)", textTransform: "uppercase", letterSpacing: "1.5px", marginTop: "2px" }}>
                aceite
              </div>
            </div>
          </foreignObject>

          {/* ═══ STATION 6: DISTRIBUCIÓN (x: 650-780) ═══ */}
          <g transform="translate(670, 95)" style={{ animation: "truckDrift 3.5s ease-in-out infinite 0.5s" }}>
            {/* Small truck cab */}
            <rect x="0" y="20" width="22" height="22" rx="3" fill="#273949" />
            {/* Windshield */}
            <rect x="3" y="23" width="8" height="8" rx="1" fill="rgba(45,140,240,0.3)" />
            {/* Tanker (cylindrical) */}
            <rect x="24" y="14" width="50" height="28" rx="14" fill="rgba(124,92,252,0.1)" stroke="#7C5CFC" strokeWidth="1.2" />
            {/* Tanker band */}
            <line x1="49" y1="14" x2="49" y2="42" stroke="#7C5CFC" strokeWidth="0.6" opacity="0.4" />
            {/* Tanker fill indicator */}
            <ellipse cx="49" cy="28" rx="5" ry="3" fill="#7C5CFC" opacity="0.3">
              <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
            </ellipse>
            {/* Wheel 1 */}
            <g style={{ transformOrigin: "12px 47px", animation: "wheelSpin 0.7s linear infinite" }}>
              <circle cx="12" cy="47" r="5" fill="#273949" />
              <circle cx="12" cy="47" r="2" fill="#FAF8F4" />
            </g>
            {/* Wheel 2 */}
            <g style={{ transformOrigin: "45px 47px", animation: "wheelSpin 0.7s linear infinite" }}>
              <circle cx="45" cy="47" r="5" fill="#273949" />
              <circle cx="45" cy="47" r="2" fill="#FAF8F4" />
            </g>
            {/* Wheel 3 */}
            <g style={{ transformOrigin: "62px 47px", animation: "wheelSpin 0.7s linear infinite" }}>
              <circle cx="62" cy="47" r="5" fill="#273949" />
              <circle cx="62" cy="47" r="2" fill="#FAF8F4" />
            </g>
          </g>
          {/* Road under truck 2 */}
          <line
            x1="665" y1="155" x2="790" y2="155"
            stroke="rgba(39,57,73,0.15)"
            strokeWidth="2"
            strokeDasharray="8 5"
            className="flow-dash"
          />

          {/* ═══ STATION 7: CERTIFICACIÓN (x: 780-900) ═══ */}
          <g transform="translate(810, 65)">
            {/* Shield / badge */}
            <g style={{ animation: "stampIn 1.5s ease-out forwards" }}>
              {/* Shield shape */}
              <path
                d="M40,10 L65,20 L65,50 Q65,70 40,80 Q15,70 15,50 L15,20 Z"
                fill="rgba(61,122,10,0.06)"
                stroke="#3d7a0a"
                strokeWidth="1.5"
              />
              {/* Checkmark */}
              <polyline
                points="28,45 36,55 55,32"
                fill="none"
                stroke="#3d7a0a"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* ISCC text */}
              <text x="40" y="72" textAnchor="middle" fontSize="7" fill="#3d7a0a" fontWeight="600" fontFamily="'JetBrains Mono', monospace" opacity="0.7">
                ISCC
              </text>
            </g>
            {/* Glow ring */}
            <circle cx="40" cy="45" r="38" fill="none" stroke="#3d7a0a" strokeWidth="1" opacity="0.15">
              <animate attributeName="r" values="36;42;36" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.15;0.05;0.15" dur="2.5s" repeatCount="indefinite" />
            </circle>
          </g>
          {/* Label: certificates */}
          <foreignObject x="815" y="175" width="90" height="40">
            <div style={{ textAlign: "center" }}>
              <span style={{ color: "#3d7a0a" }}>
                <AnimatedCounter
                  value={totalCerts}
                  className="font-mono text-sm font-bold"
                />
              </span>
              <div style={{ fontSize: "8px", color: "rgba(39,57,73,0.5)", textTransform: "uppercase", letterSpacing: "1.5px", marginTop: "2px" }}>
                certificados
              </div>
            </div>
          </foreignObject>
        </svg>
      </div>
    </div>
  );
}
