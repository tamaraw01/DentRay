"use client";

import { Center, Environment, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef, useSyncExternalStore } from "react";
import * as THREE from "three";

import type { HeroToothModelProps } from "@/components/visuals/HeroToothModel";

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

function ToothAsset({ position, rotation, scale }: Required<Pick<HeroToothModelProps, "position" | "rotation" | "scale">>) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotationRef = useRef({ x: rotation[0], y: rotation[1] });
  const reducedMotion = useReducedMotion();
  const { scene } = useGLTF("/models/tooth.glb");

  const model = useMemo(() => {
    const clonedScene = scene.clone(true);
    const enamelMaterial = new THREE.MeshPhysicalMaterial({
      clearcoat: 0.62,
      clearcoatRoughness: 0.22,
      color: new THREE.Color("#FFF8EA"),
      metalness: 0,
      roughness: 0.3,
      sheen: 0.24,
      sheenColor: new THREE.Color("#FFFDF7"),
      specularColor: new THREE.Color("#FFFDF7"),
      specularIntensity: 0.58
    });

    clonedScene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.material = enamelMaterial;
      }
    });

    return clonedScene;
  }, [scene]);

  useFrame(({ clock }) => {
    if (!groupRef.current) {
      return;
    }

    if (reducedMotion) {
      groupRef.current.rotation.x = rotation[0];
      groupRef.current.rotation.y = rotation[1];
      return;
    }

    const time = clock.getElapsedTime();
    groupRef.current.position.y = position[1] + Math.sin(time * 0.38) * 0.055;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationRef.current.x + Math.sin(time * 0.22) * 0.025, 0.035);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationRef.current.y + Math.sin(time * 0.18) * 0.1, 0.035);
  });

  return (
    <group
      onPointerMove={(event) => {
        targetRotationRef.current = {
          x: rotation[0] + event.point.y * 0.018,
          y: rotation[1] + event.point.x * 0.018
        };
      }}
      onPointerOut={() => {
        targetRotationRef.current = { x: rotation[0], y: rotation[1] };
      }}
      position={position}
      ref={groupRef}
      rotation={rotation}
      scale={scale}
    >
      <Center>
        <primitive object={model} />
      </Center>
    </group>
  );
}

export function HeroToothModelCanvas({
  position = [0.18, -0.02, 0],
  rotation = [0.08, -0.34, 0.02],
  scale = 2.72
}: HeroToothModelProps) {
  return (
    <Canvas camera={{ fov: 36, position: [0, 0.18, 7.1] }} dpr={[1, 1.7]} gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}>
      <ambientLight intensity={1.35} />
      <hemisphereLight color="#fffdf7" groundColor="#DCE8F5" intensity={1.08} />
      <directionalLight intensity={2.7} position={[-3.4, 4.8, 4.4]} />
      <pointLight color="#93c5fd" intensity={0.26} position={[3.2, 1.2, 2.8]} />
      <pointLight color="#fffdf7" intensity={0.84} position={[-1.7, -2.1, 3.2]} />
      <Suspense fallback={null}>
        <Environment preset="studio" />
        <ToothAsset position={position} rotation={rotation} scale={scale} />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload("/models/tooth.glb");
