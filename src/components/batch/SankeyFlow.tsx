"use client";

import { useMemo } from "react";

// ─── Types ──────────────────────────────────────────────────────
interface SankeyFlowProps {
  feedstockKg: number;
  feedstockType: string;
  contaminationPct: number;
  oilLiters: number;
  oilKg: number;
  charKg: number;
  gasKg: number;
}

// ─── Color palette ──────────────────────────────────────────────
const C = {
  plastic: { fill: "#64748b", text: "#475569" },
  reactor: { fill: "#E8700A", text: "#9a3412" },
  oil: { fill: "#7C5CFC", text: "#5b21b6" },
  char: { fill: "#3d7a0a", text: "#15803d" },
  gas: { fill: "#f59e0b", text: "#b45309" },
  contamination: { fill: "#ef4444", text: "#dc2626" },
};

// ─── SVG Sankey (pure, no dependencies) ─────────────────────────
export function SankeyFlow({
  feedstockKg,
  feedstockType,
  contaminationPct,
  oilLiters,
  oilKg,
  charKg,
  gasKg,
}: SankeyFlowProps) {
  const cleanKg = feedstockKg * (1 - contaminationPct / 100);
  const contaminationKg = Math.round(feedstockKg - cleanKg);
  const hasContamination = contaminationKg > 1;

  // Layout — compact for passport width
  const W = 480;
  const H = 160;
  const nodeW = 10;
  const nodeR = 3;

  const totalOutput = oilKg + charKg + gasKg;

  // ── Left: Plástico ──
  const leftX = 80;
  const leftY = hasContamination ? 18 : 10;
  const leftH = H - (hasContamination ? 36 : 20);

  // ── Center: Reactor ──
  const centerX = W / 2 - nodeW / 2;
  const reactorY = hasContamination ? 30 : 10;
  const reactorH = H - (hasContamination ? 50 : 20);

  // ── Right: outputs ──
  const rightX = W - 95;
  const gap = 8;
  const rightTotalH = H - 20;
  const oilH = Math.max(18, (oilKg / totalOutput) * rightTotalH);
  const charH = Math.max(14, (charKg / totalOutput) * rightTotalH);
  const gasH = Math.max(12, (gasKg / totalOutput) * rightTotalH);
  const usedH = oilH + charH + gasH;
  const startY = Math.max(6, (H - usedH - gap * 2) / 2);

  const oilY = startY;
  const charY = oilY + oilH + gap;
  const gasY = charY + charH + gap;

  // ── Contamination ──
  const contX = leftX + 60;
  const contY = 2;
  const contH = hasContamination ? Math.max(8, (contaminationKg / feedstockKg) * 30) : 0;

  // ── Bezier link helper ──
  function linkPath(sx: number, sy: number, sh: number, tx: number, ty: number, th: number) {
    const x1 = sx + nodeW;
    const x2 = tx;
    const cpx = (x1 + x2) / 2;
    return `M ${x1} ${sy} C ${cpx} ${sy}, ${cpx} ${ty}, ${x2} ${ty} L ${x2} ${ty + th} C ${cpx} ${ty + th}, ${cpx} ${sy + sh}, ${x1} ${sy + sh} Z`;
  }

  // ── Reactor band positions ──
  const rOilH = (oilKg / totalOutput) * reactorH;
  const rCharH = (charKg / totalOutput) * reactorH;
  const rOilY = reactorY;
  const rCharY = reactorY + rOilH;
  const rGasY = reactorY + rOilH + rCharH;
  const rGasH = reactorH - rOilH - rCharH;

  // ── Input band positions ──
  const inputCleanH = hasContamination ? (cleanKg / feedstockKg) * leftH : leftH;
  const inputCleanY = leftY;
  const inputContH = hasContamination ? leftH - inputCleanH : 0;
  const inputContY = leftY + inputCleanH;

  const uid = useMemo(() => Math.random().toString(36).slice(2, 8), []);

  return (
    <div className="w-full">
      {/* Section title */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[8px] uppercase tracking-[2px] text-eco-muted font-semibold">
          Balance de Masa
        </span>
      </div>

      {/* SVG Sankey */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: "auto" }} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={`gm-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={C.plastic.fill} stopOpacity="0.22" />
            <stop offset="100%" stopColor={C.reactor.fill} stopOpacity="0.22" />
          </linearGradient>
          <linearGradient id={`go-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={C.reactor.fill} stopOpacity="0.18" />
            <stop offset="100%" stopColor={C.oil.fill} stopOpacity="0.28" />
          </linearGradient>
          <linearGradient id={`gc-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={C.reactor.fill} stopOpacity="0.12" />
            <stop offset="100%" stopColor={C.char.fill} stopOpacity="0.22" />
          </linearGradient>
          <linearGradient id={`gg-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={C.reactor.fill} stopOpacity="0.08" />
            <stop offset="100%" stopColor={C.gas.fill} stopOpacity="0.14" />
          </linearGradient>
          <linearGradient id={`gx-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={C.plastic.fill} stopOpacity="0.1" />
            <stop offset="100%" stopColor={C.contamination.fill} stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* ═══ LINKS ═══ */}
        <path d={linkPath(leftX, inputCleanY, inputCleanH, centerX, reactorY, reactorH)} fill={`url(#gm-${uid})`} />
        {hasContamination && <path d={linkPath(leftX, inputContY, inputContH, contX, contY, contH)} fill={`url(#gx-${uid})`} />}
        <path d={linkPath(centerX, rOilY, rOilH, rightX, oilY, oilH)} fill={`url(#go-${uid})`} />
        <path d={linkPath(centerX, rCharY, rCharH, rightX, charY, charH)} fill={`url(#gc-${uid})`} />
        <path d={linkPath(centerX, rGasY, rGasH, rightX, gasY, gasH)} fill={`url(#gg-${uid})`} />

        {/* ═══ NODES ═══ */}

        {/* Plástico */}
        <rect x={leftX} y={leftY} width={nodeW} height={leftH} rx={nodeR} fill={C.plastic.fill} opacity="0.85" />
        <text x={leftX - 6} y={leftY + leftH / 2 - 7} textAnchor="end" style={{ fontSize: 9.5, fill: C.plastic.text, fontWeight: 600 }}>Plástico</text>
        <text x={leftX - 6} y={leftY + leftH / 2 + 6} textAnchor="end" style={{ fontSize: 11, fill: "#273949", fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>{feedstockKg} kg</text>

        {/* Contaminación */}
        {hasContamination && (
          <>
            <rect x={contX} y={contY} width={nodeW} height={contH} rx={3} fill={C.contamination.fill} opacity="0.65" />
            <text x={contX + nodeW + 4} y={contY + contH / 2 + 1} textAnchor="start" dominantBaseline="middle" style={{ fontSize: 8, fill: C.contamination.text, fontWeight: 500 }}>
              Contaminación · {contaminationKg} kg
            </text>
          </>
        )}

        {/* Reactor */}
        <rect x={centerX} y={reactorY} width={nodeW} height={reactorH} rx={nodeR} fill={C.reactor.fill} opacity="0.9" />
        <text x={centerX + nodeW / 2} y={reactorY - 6} textAnchor="middle" style={{ fontSize: 9, fill: C.reactor.text, fontWeight: 700, letterSpacing: "0.5px" }}>REACTOR</text>

        {/* Aceite pirolítico */}
        <rect x={rightX} y={oilY} width={nodeW} height={oilH} rx={nodeR} fill={C.oil.fill} opacity="0.85" />
        <text x={rightX + nodeW + 6} y={oilY + oilH / 2 - 8} textAnchor="start" style={{ fontSize: 9.5, fill: C.oil.text, fontWeight: 600 }}>Aceite pirolítico</text>
        <text x={rightX + nodeW + 6} y={oilY + oilH / 2 + 5} textAnchor="start" style={{ fontSize: 12, fill: C.oil.fill, fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>{oilLiters} L</text>
        <text x={rightX + nodeW + 6} y={oilY + oilH / 2 + 16} textAnchor="start" style={{ fontSize: 8, fill: "#94a3b8" }}>({Math.round(oilKg)} kg)</text>

        {/* Char */}
        <rect x={rightX} y={charY} width={nodeW} height={charH} rx={nodeR} fill={C.char.fill} opacity="0.85" />
        <text x={rightX + nodeW + 6} y={charY + charH / 2 - 3} textAnchor="start" style={{ fontSize: 9, fill: C.char.text, fontWeight: 600 }}>Char (carbón)</text>
        <text x={rightX + nodeW + 6} y={charY + charH / 2 + 9} textAnchor="start" style={{ fontSize: 10, fill: C.char.fill, fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>{charKg} kg</text>

        {/* Gas — inline label explaining recirculation */}
        <rect x={rightX} y={gasY} width={nodeW} height={gasH} rx={nodeR} fill={C.gas.fill} opacity="0.65" />
        <text x={rightX + nodeW + 6} y={gasY + gasH / 2 - 2} textAnchor="start" style={{ fontSize: 8.5, fill: C.gas.text, fontWeight: 500 }}>
          Gas · {gasKg} kg
        </text>
        <text x={rightX + nodeW + 6} y={gasY + gasH / 2 + 9} textAnchor="start" style={{ fontSize: 7, fill: "#94a3b8", fontStyle: "italic" }}>
          ↺ Recircula para calentar el reactor
        </text>
      </svg>
    </div>
  );
}
