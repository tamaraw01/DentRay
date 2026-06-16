"use client";

import { useEffect } from "react";

export function SplashScreen() {
  useEffect(() => {
    const splash = document.getElementById("dentray-splash");
    if (!splash) return;

    splash.classList.add("dentray-splash--out");

    const removeTimer = setTimeout(() => {
      splash.remove();
    }, 320);

    return () => clearTimeout(removeTimer);
  }, []);

  return null;
}
