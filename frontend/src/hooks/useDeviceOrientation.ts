"use client";

import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  const portraitQuery = window.matchMedia("(orientation: portrait)");
  const screenOrientation = window.screen.orientation;
  const visualViewport = window.visualViewport;

  if (typeof portraitQuery.addEventListener === "function") {
    portraitQuery.addEventListener("change", onStoreChange);
  } else {
    portraitQuery.addListener(onStoreChange);
  }
  screenOrientation?.addEventListener("change", onStoreChange);
  visualViewport?.addEventListener("resize", onStoreChange);
  window.addEventListener("orientationchange", onStoreChange);
  window.addEventListener("resize", onStoreChange);

  return () => {
    if (typeof portraitQuery.removeEventListener === "function") {
      portraitQuery.removeEventListener("change", onStoreChange);
    } else {
      portraitQuery.removeListener(onStoreChange);
    }
    screenOrientation?.removeEventListener("change", onStoreChange);
    visualViewport?.removeEventListener("resize", onStoreChange);
    window.removeEventListener("orientationchange", onStoreChange);
    window.removeEventListener("resize", onStoreChange);
  };
}

function getOrientationSnapshot() {
  const width = Math.round(window.visualViewport?.width ?? window.innerWidth);
  const height = Math.round(window.visualViewport?.height ?? window.innerHeight);
  const angle = window.screen.orientation?.angle ?? 0;

  return `${width}:${height}:${angle}`;
}

export function useDeviceOrientation() {
  const snapshot = useSyncExternalStore(subscribe, getOrientationSnapshot, () => "0:0:0");
  const [width, height, angle] = snapshot.split(":").map(Number);
  const isLandscape = width > height;

  return {
    angle,
    height,
    isLandscape,
    isPortrait: !isLandscape,
    width
  };
}
