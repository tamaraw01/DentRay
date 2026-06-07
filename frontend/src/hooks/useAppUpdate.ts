"use client";

import { useEffect, useSyncExternalStore } from "react";

import { APP_VERSION } from "@/config/app-version";

type AppUpdateState = {
  availableVersion: string | null;
};

type VersionResponse = {
  version?: unknown;
};

const initialState: AppUpdateState = {
  availableVersion: null
};

export const UPDATE_PROMPT_DISMISSED_KEY = "dentray.updatePrompt.dismissed";
const checkIntervalMilliseconds = 5 * 60 * 1000;
const dismissCooldownMilliseconds = 24 * 60 * 60 * 1000;
const listeners = new Set<() => void>();
let state = initialState;
let consumerCount = 0;
let cleanupVersionCheck: (() => void) | null = null;
let checkPromise: Promise<void> | null = null;

function emitChange() {
  listeners.forEach((listener) => listener());
}

function updateState(nextState: Partial<AppUpdateState>) {
  state = { ...state, ...nextState };
  emitChange();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function getServerSnapshot() {
  return initialState;
}

function isVersionDismissed(version: string) {
  try {
    const storedValue = window.localStorage.getItem(UPDATE_PROMPT_DISMISSED_KEY);
    if (!storedValue) {
      return false;
    }

    const dismissed = JSON.parse(storedValue) as {
      dismissedAt?: unknown;
      version?: unknown;
    };
    return (
      dismissed.version === version &&
      typeof dismissed.dismissedAt === "number" &&
      dismissed.dismissedAt + dismissCooldownMilliseconds > Date.now()
    );
  } catch {
    return false;
  }
}

async function checkForUpdate() {
  if (checkPromise || typeof window === "undefined") {
    return checkPromise;
  }

  checkPromise = (async () => {
    try {
      const response = await fetch(`/version.json?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as VersionResponse;
      const latestVersion = typeof data.version === "string" ? data.version.trim() : "";

      if (!latestVersion || latestVersion === APP_VERSION || isVersionDismissed(latestVersion)) {
        updateState({ availableVersion: null });
        return;
      }

      updateState({ availableVersion: latestVersion });
    } catch {
      // Update checks should never interrupt the primary app flow.
    } finally {
      checkPromise = null;
    }
  })();

  return checkPromise;
}

function registerVersionCheck() {
  consumerCount += 1;

  if (consumerCount === 1) {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void checkForUpdate();
      }
    };
    const handleFocus = () => void checkForUpdate();
    const intervalId = window.setInterval(() => void checkForUpdate(), checkIntervalMilliseconds);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    void checkForUpdate();

    cleanupVersionCheck = () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      cleanupVersionCheck = null;
    };
  }

  return () => {
    consumerCount = Math.max(0, consumerCount - 1);
    if (consumerCount === 0) {
      cleanupVersionCheck?.();
    }
  };
}

function dismissUpdate() {
  const availableVersion = state.availableVersion;
  if (!availableVersion) {
    return;
  }

  try {
    window.localStorage.setItem(
      UPDATE_PROMPT_DISMISSED_KEY,
      JSON.stringify({
        dismissedAt: Date.now(),
        version: availableVersion
      })
    );
  } catch {
    // The banner can still close if browser storage is unavailable.
  }

  updateState({ availableVersion: null });
}

async function reloadWithUpdate() {
  if ("serviceWorker" in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      const waitingWorker = registrations.find((registration) => registration.waiting)?.waiting;

      if (waitingWorker) {
        const controllerChanged = new Promise<void>((resolve) => {
          navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true });
        });
        waitingWorker.postMessage({ type: "SKIP_WAITING" });
        await Promise.race([
          controllerChanged,
          new Promise<void>((resolve) => window.setTimeout(resolve, 1500))
        ]);
      }
    } catch {
      // A regular reload still retrieves the latest deployment.
    }
  }

  window.location.reload();
}

export function useAppUpdate() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    return registerVersionCheck();
  }, []);

  return {
    availableVersion: snapshot.availableVersion,
    dismissUpdate,
    isUpdateAvailable: Boolean(snapshot.availableVersion),
    reloadWithUpdate
  };
}
