"use client";

import { Center, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import type { ReactNode } from "react";
import { Component, Suspense, useMemo, useRef, useSyncExternalStore } from "react";
import * as THREE from "three";

import type { ToothModelProps } from "@/components/visuals/ToothModel";
import { ToothModelFallback } from "@/components/visuals/ToothModel";

type Tuple3 = [number, number, number];
type ToothSceneProps = Required<Pick<ToothModelProps, "floating" | "position" | "rotation" | "scale" | "variant">>;

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

class ToothErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function ToothAsset({ floating, position, rotation, scale, variant }: ToothSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const reducedMotion = useReducedMotion();
  const { scene } = useGLTF("/models/tooth.glb");

  const model = useMemo(() => {
    const clonedScene = scene.clone(true);
    const pearlMaterial = new THREE.MeshPhysicalMaterial({
      clearcoat: 0.56,
      clearcoatRoughness: 0.24,
      color: new THREE.Color("#fff7e8"),
      metalness: 0,
      roughness: 0.34,
      specularColor: new THREE.Color("#ffffff"),
      specularIntensity: 0.54
    });

    clonedScene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.material = pearlMaterial;
      }
    });

    return clonedScene;
  }, [scene]);

  useFrame(({ clock }) => {
    if (!groupRef.current || reducedMotion) {
      return;
    }

    const time = clock.getElapsedTime();
    if (floating) {
      groupRef.current.position.y = position[1] + Math.sin(time * 0.82) * (variant === "hero" ? 0.08 : 0.04);
      groupRef.current.rotation.y = rotation[1] + Math.sin(time * 0.26) * 0.12;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <Center>
        <primitive object={model} />
      </Center>
    </group>
  );
}

const cameraByVariant = {
  background: { fov: 36, position: [0, 0.2, 8] as Tuple3 },
  hero: { fov: 32, position: [0, 0.2, 6.4] as Tuple3 },
  small: { fov: 40, position: [0, 0.12, 7.35] as Tuple3 }
};

export function ToothModelCanvas({
  floating = true,
  position = [0, 0, 0],
  rotation = [0.08, -0.34, 0.02],
  scale = 2.2,
  variant = "hero"
}: ToothModelProps) {
  return (
    <ToothErrorBoundary fallback={<ToothModelFallback />}>
      <Suspense fallback={<ToothModelFallback />}>
        <Canvas
          camera={cameraByVariant[variant]}
          dpr={[1, 1.75]}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          shadows
        >
          <ambientLight intensity={1.7} />
          <hemisphereLight color="#fffdf7" groundColor="#d8ecff" intensity={1.08} />
          <directionalLight castShadow intensity={2.45} position={[4, 5, 5]} />
          <pointLight color="#93c5fd" intensity={0.36} position={[-3, 1.6, 3]} />
          <pointLight color="#ffffff" intensity={0.9} position={[2, -2, 4]} />
          <ToothAsset floating={floating} position={position} rotation={rotation} scale={scale} variant={variant} />
        </Canvas>
      </Suspense>
    </ToothErrorBoundary>
  );
}

useGLTF.preload("/models/tooth.glb");
