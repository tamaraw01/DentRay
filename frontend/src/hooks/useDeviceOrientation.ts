"use client";

import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  const portraitQuery = window.matchMedia("(orientation: portrait)");
  portraitQuery.addEventListener("change", onStoreChange);
  window.addEventListener("orientationchange", onStoreChange);
  window.addEventListener("resize", onStoreChange);

  return () => {
    portraitQuery.removeEventListener("change", onStoreChange);
    window.removeEventListener("orientationchange", onStoreChange);
    window.removeEventListener("resize", onStoreChange);
  };
}

function getPortraitSnapshot() {
  return window.matchMedia("(orientation: portrait)").matches;
}

export function useDeviceOrientation() {
  const isPortrait = useSyncExternalStore(subscribe, getPortraitSnapshot, () => true);

  return {
    isLandscape: !isPortrait,
    isPortrait
  };
}
