"use client";

import { useState, useRef, useEffect } from "react";
import { Html, QuadraticBezierLine } from "@react-three/drei";
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
// Status color helpers — subtle palette
// ---------------------------------------------------------------------------
function statusColor(status?: string) {
  switch (status) {
    case "critical":
      return { dot: "#DC2626", line: "rgba(220,38,38,0.30)", text: "#fca5a5", badge: "#DC2626" };
    case "warning":
      return { dot: "#D97706", line: "rgba(217,119,6,0.25)", text: "#fcd34d", badge: "#D97706" };
    default:
      return { dot: "#4a9a12", line: "rgba(61,122,10,0.22)", text: "#b5e951", badge: "#3d7a0a" };
  }
}

// ---------------------------------------------------------------------------
// Label offset — where the leader line ends and the HTML label starts
// ---------------------------------------------------------------------------
const LABEL_OFFSET: [number, number, number] = [0.6, 0.7, 0];
const LINE_MID: [number, number, number] = [0.15, 0.55, 0];

// ---------------------------------------------------------------------------
// Single annotation marker — Apple-style: minimal dot + leader line + clean label
// ---------------------------------------------------------------------------
function Marker({ annotation, index = 0 }: { annotation: Annotation; index?: number }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const colors = statusColor(annotation.status);

  // Staggered entrance
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 180);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <group position={new THREE.Vector3(...annotation.position)}>
      {/* Tiny anchor dot */}
      <mesh>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshStandardMaterial
          color={colors.dot}
          emissive={colors.dot}
          emissiveIntensity={0.3}
          transparent
          opacity={visible ? 1 : 0}
        />
      </mesh>

      {/* Curved leader line from dot to label */}
      {visible && (
        <QuadraticBezierLine
          start={[0, 0, 0]}
          end={LABEL_OFFSET}
          mid={LINE_MID}
          color={colors.line}
          lineWidth={1}
          transparent
          opacity={0.6}
        />
      )}

      {/* HTML label — clean, minimal */}
      <Html
        position={LABEL_OFFSET}
        distanceFactor={6}
        occlude={false}
        style={{
          pointerEvents: "auto",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        <div
          onClick={() => setExpanded((v) => !v)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => {
            setHovered(false);
            if (!expanded) setExpanded(false);
          }}
          style={{
            cursor: "pointer",
            userSelect: "none",
            minWidth: expanded ? "200px" : "auto",
          }}
        >
          {/* Compact label pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              background: "rgba(29,43,54,0.82)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "6px",
              padding: "3px 8px",
              transform: hovered ? "scale(1.06)" : "scale(1)",
              transition: "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            {/* Status dot */}
            <span
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: colors.dot,
                flexShrink: 0,
              }}
            />
            {/* Tag text */}
            <span
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: "10px",
                fontWeight: 500,
                whiteSpace: "nowrap",
                fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                letterSpacing: "0.01em",
              }}
            >
              {annotation.label}
            </span>
          </div>

          {/* Hover tooltip: description */}
          {hovered && !expanded && annotation.description && (
            <div
              style={{
                marginTop: "4px",
                background: "rgba(29,43,54,0.88)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "6px",
                padding: "4px 8px",
                animation: "fadeIn 0.2s ease",
              }}
            >
              <p
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "9px",
                  margin: 0,
                  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                  whiteSpace: "nowrap",
                }}
              >
                {annotation.description}
              </p>
            </div>
          )}

          {/* Expanded panel: metrics */}
          {expanded && (
            <div
              style={{
                marginTop: "4px",
                background: "rgba(29,43,54,0.90)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "8px",
                padding: "8px 10px",
                maxWidth: "220px",
                animation: "fadeIn 0.2s ease",
              }}
            >
              {/* Description */}
              {annotation.description && (
                <p
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontSize: "9px",
                    margin: "0 0 6px 0",
                    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                  }}
                >
                  {annotation.description}
                </p>
              )}

              {/* Metrics */}
              {annotation.metrics?.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "2px 0",
                    borderBottom:
                      i < (annotation.metrics?.length || 0) - 1
                        ? "1px solid rgba(255,255,255,0.04)"
                        : "none",
                  }}
                >
                  <span
                    style={{
                      color: "rgba(255,255,255,0.35)",
                      fontSize: "9px",
                      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                    }}
                  >
                    {m.label}
                  </span>
                  <span
                    style={{
                      color: colors.text,
                      fontSize: "10px",
                      fontWeight: 600,
                      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                    }}
                  >
                    {m.value}
                    {m.unit && (
                      <span
                        style={{
                          color: "rgba(255,255,255,0.25)",
                          fontSize: "8px",
                          marginLeft: "2px",
                        }}
                      >
                        {m.unit}
                      </span>
                    )}
                  </span>
                </div>
              ))}

              {/* Status badge */}
              <div
                style={{
                  marginTop: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: colors.badge,
                  }}
                />
                <span
                  style={{
                    color: colors.text,
                    fontSize: "8px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                  }}
                >
                  {annotation.status === "critical"
                    ? "CALIBRACIÓN VENCIDA"
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
      {annotations.map((a, i) => (
        <Marker key={a.id} annotation={a} index={i} />
      ))}
    </group>
  );
}
