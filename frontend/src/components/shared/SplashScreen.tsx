"use client";

import { useEffect } from "react";

export function SplashScreen() {
  useEffect(() => {
    const splash = document.getElementById("dentray-splash");
    if (!splash) return;

    const fadeTimer = setTimeout(() => {
      splash.classList.add("dentray-splash--out");
    }, 80);

    const removeTimer = setTimeout(() => {
      splash.remove();
    }, 520);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return null;
}
