"use client";

import { useRef, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Environment } from "@react-three/drei";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import AnnotationMarkers, { type Annotation } from "./AnnotationMarkers";
import { ViewerErrorBoundary } from "./ViewerErrorBoundary";

// ---------------------------------------------------------------------------
// Auto-center & scale any Object3D to fit viewport
// ---------------------------------------------------------------------------
function autoFit(object: THREE.Object3D): { meshCount: number } {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = maxDim > 0 ? 5 / maxDim : 1;

  object.scale.setScalar(scale);
  object.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);

  let meshCount = 0;
  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      meshCount++;
    }
  });

  return { meshCount };
}

// ---------------------------------------------------------------------------
// OBJ+MTL loader (imperative — most reliable for async materials)
// ---------------------------------------------------------------------------
function OBJWithMTL({
  objUrl,
  mtlUrl,
  onLoaded,
}: {
  objUrl: string;
  mtlUrl: string;
  onLoaded?: (info: { name: string; meshCount: number }) => void;
}) {
  const groupRef = useRef<THREE.Group>(null!);

  useEffect(() => {
    const basePath = mtlUrl.substring(0, mtlUrl.lastIndexOf("/") + 1);
    const mtlName = mtlUrl.split("/").pop() || "";

    const mtlLoader = new MTLLoader();
    mtlLoader.setPath(basePath);

    mtlLoader.load(
      mtlName,
      (materials) => {
        materials.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);

        objLoader.load(
          objUrl,
          (object) => {
            const { meshCount } = autoFit(object);
            if (groupRef.current) {
              while (groupRef.current.children.length > 0) {
                groupRef.current.remove(groupRef.current.children[0]);
              }
              groupRef.current.add(object);
            }
            onLoaded?.({ name: objUrl.split("/").pop() || "model", meshCount });
          },
          undefined,
          (err) => console.error("[Digital Twin] OBJ load error:", err),
        );
      },
      undefined,
      (err) => console.error("[Digital Twin] MTL load error:", err),
    );
  }, [objUrl, mtlUrl, onLoaded]);

  return <group ref={groupRef} />;
}

// ---------------------------------------------------------------------------
// Simple OBJ loader (no materials)
// ---------------------------------------------------------------------------
function OBJOnly({
  objUrl,
  onLoaded,
}: {
  objUrl: string;
  onLoaded?: (info: { name: string; meshCount: number }) => void;
}) {
  const groupRef = useRef<THREE.Group>(null!);

  useEffect(() => {
    const objLoader = new OBJLoader();
    objLoader.load(
      objUrl,
      (object) => {
        const { meshCount } = autoFit(object);
        if (groupRef.current) {
          while (groupRef.current.children.length > 0) {
            groupRef.current.remove(groupRef.current.children[0]);
          }
          groupRef.current.add(object);
        }
        onLoaded?.({ name: objUrl.split("/").pop() || "model", meshCount });
      },
      undefined,
      (err) => console.error("[Digital Twin] OBJ load error:", err),
    );
  }, [objUrl, onLoaded]);

  return <group ref={groupRef} />;
}

// ---------------------------------------------------------------------------
// Cinematic camera entrance — slow, elegant descent
// ---------------------------------------------------------------------------
function CameraRig() {
  const { camera } = useThree();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    camera.position.set(7, 5.5, 7);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame((_, delta) => {
    if (camera.position.y > 3) {
      camera.position.y -= delta * 0.8;
      camera.position.x -= delta * 1.0;
      camera.position.z -= delta * 1.0;
    }
  });

  return null;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export interface ModelViewerProps {
  modelUrl: string | null;
  mtlUrl?: string | null;
  showGrid?: boolean;
  showAnnotations?: boolean;
  annotations?: Annotation[];
  onModelLoaded?: (info: { name: string; meshCount: number }) => void;
}

export default function ModelViewer({
  modelUrl,
  mtlUrl,
  showGrid = true,
  showAnnotations = true,
  annotations,
  onModelLoaded,
}: ModelViewerProps) {
  const isOBJ = modelUrl?.toLowerCase().endsWith(".obj");

  if (!modelUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-eco-navy">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5">
            <svg className="h-10 w-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </div>
          <p className="text-xs text-white/40">Sube un modelo 3D para visualizarlo</p>
          <p className="mt-1 text-[9px] text-white/25">.glb · .gltf · .obj</p>
        </div>
      </div>
    );
  }

  return (
    <ViewerErrorBoundary>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [7, 5.5, 7], fov: 42, near: 0.1, far: 1000 }}
        gl={{ antialias: true }}
        style={{ background: "#1d2b36" }}
      >
        {/* Background — eco-navy */}
        <color attach="background" args={["#1d2b36"]} />
        <fog attach="fog" args={["#1d2b36", 30, 60]} />

        {/* Lighting — soft, cinematic */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 8, 3]} intensity={1.0} color="#fff5e6" />
        <directionalLight position={[-3, 4, -5]} intensity={0.3} color="#7C5CFC" />
        <hemisphereLight args={["#c8e0ff", "#1d2b36", 0.35]} />

        {/* Environment for subtle reflections */}
        <Environment preset="city" background={false} />

        {/* Camera animation */}
        <CameraRig />

        {/* Model — OBJ with optional MTL */}
        {isOBJ && mtlUrl ? (
          <OBJWithMTL objUrl={modelUrl} mtlUrl={mtlUrl} onLoaded={onModelLoaded} />
        ) : isOBJ ? (
          <OBJOnly objUrl={modelUrl} onLoaded={onModelLoaded} />
        ) : null}

        {/* 3D Annotations */}
        <AnnotationMarkers annotations={annotations} visible={showAnnotations} />

        {/* Ground grid — subtle, nearly invisible */}
        {showGrid && (
          <Grid
            position={[0, -0.01, 0]}
            args={[30, 30]}
            cellSize={0.5}
            cellThickness={0.3}
            cellColor="#253540"
            sectionSize={2.5}
            sectionThickness={0.6}
            sectionColor="#2e4050"
            fadeDistance={25}
            fadeStrength={1.5}
            infiniteGrid
          />
        )}

        {/* Controls — slow, contemplative auto-rotate */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          autoRotate
          autoRotateSpeed={0.25}
          minDistance={1}
          maxDistance={30}
        />
      </Canvas>
    </ViewerErrorBoundary>
  );
}
