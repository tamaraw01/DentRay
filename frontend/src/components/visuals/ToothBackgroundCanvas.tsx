"use client";

import { Center, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef, useSyncExternalStore } from "react";
import * as THREE from "three";

type Tuple3 = [number, number, number];

type ToothInstance = {
  opacity: number;
  position: Tuple3;
  rotation: Tuple3;
  scale: number;
  tint: string;
};

const instances: ToothInstance[] = [
  { opacity: 1, position: [0.9, -0.05, 0], rotation: [0.1, -0.46, 0.05], scale: 1.82, tint: "#fbf6ee" },
  { opacity: 0.62, position: [-1.7, 1.02, -0.7], rotation: [0.22, 0.45, -0.28], scale: 0.82, tint: "#f5fbff" },
  { opacity: 0.46, position: [2.18, 1.25, -1], rotation: [-0.1, -0.8, 0.22], scale: 0.64, tint: "#e9f8ff" },
  { opacity: 0.38, position: [-2.15, -0.72, -0.8], rotation: [0.14, 0.74, 0.18], scale: 0.72, tint: "#ffffff" },
  { opacity: 0.5, position: [2.34, -0.94, -0.7], rotation: [0.18, -0.25, -0.2], scale: 0.78, tint: "#edf8ff" },
  { opacity: 0.3, position: [-0.25, 1.72, -1.35], rotation: [0.05, 0.2, -0.12], scale: 0.58, tint: "#ffffff" }
];

function useReducedMotion() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      media.addEventListener("change", onStoreChange);
      return () => media.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
}

function ToothField() {
  const groupRef = useRef<THREE.Group>(null);
  const reducedMotion = useReducedMotion();
  const { scene } = useGLTF("/models/tooth.glb");

  const models = useMemo(
    () =>
      instances.map((item) => {
        const clone = scene.clone(true);
        const material = new THREE.MeshPhysicalMaterial({
          clearcoat: 0.22,
          clearcoatRoughness: 0.5,
          color: new THREE.Color(item.tint),
          metalness: 0.01,
          opacity: item.opacity,
          roughness: 0.54,
          transparent: item.opacity < 1
        });

        clone.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.isMesh) {
            mesh.material = material;
          }
        });

        return clone;
      }),
    [scene]
  );

  useFrame(({ clock }) => {
    if (!groupRef.current || reducedMotion) {
      return;
    }

    const time = clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(time * 0.14) * 0.08;
    groupRef.current.position.y = Math.sin(time * 0.32) * 0.06;
  });

  return (
    <group ref={groupRef}>
      {instances.map((item, index) => (
        <group key={`${item.position.join("-")}-${item.scale}`} position={item.position} rotation={item.rotation} scale={item.scale}>
          <Center>
            <primitive object={models[index]} />
          </Center>
        </group>
      ))}
    </group>
  );
}

export function ToothBackgroundCanvas() {
  return (
    <Canvas
      camera={{ fov: 38, position: [0, 0.1, 6.2] }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={1.75} />
      <hemisphereLight color="#f8fbff" groundColor="#d8ecff" intensity={1.05} />
      <directionalLight intensity={2.2} position={[4, 5, 5]} />
      <pointLight color="#16d4ff" intensity={0.55} position={[-2.6, 1.8, 3]} />
      <Suspense fallback={null}>
        <ToothField />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload("/models/tooth.glb");
