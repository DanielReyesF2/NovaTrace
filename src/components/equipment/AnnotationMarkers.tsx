"use client";

import { useState } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Annotation data type
// ---------------------------------------------------------------------------
export interface Annotation {
  id: string;
  position: [number, number, number];
  label: string;
  description?: string;
  status?: "normal" | "warning" | "critical";
  metrics?: { label: string; value: string; unit?: string }[];
}

// ---------------------------------------------------------------------------
// Status color helpers
// ---------------------------------------------------------------------------
function statusColor(status?: string) {
  switch (status) {
    case "critical":
      return { bg: "#DC2626", ring: "rgba(220,38,38,0.4)", text: "#fca5a5" };
    case "warning":
      return { bg: "#D97706", ring: "rgba(217,119,6,0.4)", text: "#fcd34d" };
    default:
      return { bg: "#3d7a0a", ring: "rgba(61,122,10,0.3)", text: "#b5e951" };
  }
}

// ---------------------------------------------------------------------------
// Single annotation marker
// ---------------------------------------------------------------------------
function Marker({ annotation }: { annotation: Annotation }) {
  const [expanded, setExpanded] = useState(false);
  const colors = statusColor(annotation.status);

  return (
    <group position={new THREE.Vector3(...annotation.position)}>
      {/* Glowing sphere at the anchor point */}
      <mesh onClick={() => setExpanded((v) => !v)}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={colors.bg} emissive={colors.bg} emissiveIntensity={0.8} />
      </mesh>

      {/* Pulsing ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.12, 0.18, 32]} />
        <meshBasicMaterial color={colors.bg} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* HTML label */}
      <Html
        position={[0.3, 0.4, 0]}
        distanceFactor={8}
        occlude={false}
        style={{ pointerEvents: "auto", transition: "all 0.2s ease" }}
      >
        <div
          onClick={() => setExpanded((v) => !v)}
          style={{ cursor: "pointer", userSelect: "none", minWidth: expanded ? "200px" : "120px" }}
        >
          {/* Compact label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(29,43,54,0.92)",
              backdropFilter: "blur(12px)",
              border: `1px solid ${colors.bg}33`,
              borderRadius: "8px",
              padding: "6px 10px",
              boxShadow: `0 0 20px ${colors.ring}`,
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: colors.bg,
                boxShadow: `0 0 8px ${colors.bg}`,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                color: "#e2e8f0",
                fontSize: "11px",
                fontWeight: 600,
                whiteSpace: "nowrap",
                fontFamily: "Inter, system-ui, sans-serif",
              }}
            >
              {annotation.label}
            </span>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", marginLeft: "2px" }}>
              {expanded ? "▾" : "▸"}
            </span>
          </div>

          {/* Expanded panel */}
          {expanded && (
            <div
              style={{
                marginTop: "4px",
                background: "rgba(29,43,54,0.95)",
                backdropFilter: "blur(16px)",
                border: `1px solid ${colors.bg}33`,
                borderRadius: "10px",
                padding: "10px 12px",
                boxShadow: `0 4px 30px rgba(0,0,0,0.5), 0 0 20px ${colors.ring}`,
              }}
            >
              {annotation.description && (
                <p
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "10px",
                    margin: "0 0 8px 0",
                    fontFamily: "Inter, system-ui, sans-serif",
                  }}
                >
                  {annotation.description}
                </p>
              )}

              {annotation.metrics?.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "3px 0",
                    borderBottom:
                      i < (annotation.metrics?.length || 0) - 1
                        ? "1px solid rgba(255,255,255,0.06)"
                        : "none",
                  }}
                >
                  <span
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "10px",
                      fontFamily: "Inter, system-ui, sans-serif",
                    }}
                  >
                    {m.label}
                  </span>
                  <span
                    style={{
                      color: colors.text,
                      fontSize: "11px",
                      fontWeight: 600,
                      fontFamily: "Inter, system-ui, sans-serif",
                    }}
                  >
                    {m.value}
                    {m.unit && (
                      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "9px", marginLeft: "2px" }}>
                        {m.unit}
                      </span>
                    )}
                  </span>
                </div>
              ))}

              {/* Status badge */}
              <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
                <span
                  style={{ width: "6px", height: "6px", borderRadius: "50%", background: colors.bg }}
                />
                <span
                  style={{
                    color: colors.text,
                    fontSize: "9px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontFamily: "Inter, system-ui, sans-serif",
                  }}
                >
                  {annotation.status === "critical"
                    ? "CALIBRACION VENCIDA"
                    : annotation.status === "warning"
                      ? "POR VENCER"
                      : "VIGENTE"}
                </span>
              </div>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Annotation markers group
// ---------------------------------------------------------------------------
export default function AnnotationMarkers({
  annotations = [],
  visible = true,
}: {
  annotations?: Annotation[];
  visible?: boolean;
}) {
  if (!visible || annotations.length === 0) return null;

  return (
    <group>
      {annotations.map((a) => (
        <Marker key={a.id} annotation={a} />
      ))}
    </group>
  );
}
