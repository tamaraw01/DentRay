"use client";

import { useEffect, useSyncExternalStore } from "react";

import { isIOSSafari, isMobileDevice, isStandaloneMode } from "@/utils/device";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

type InstallPromptState = {
  deferredPrompt: BeforeInstallPromptEvent | null;
  forceVisible: boolean;
  isCooldownActive: boolean;
  isIOSSafari: boolean;
  isMobile: boolean;
  isStandalone: boolean;
};

const initialState: InstallPromptState = {
  deferredPrompt: null,
  forceVisible: false,
  isCooldownActive: false,
  isIOSSafari: false,
  isMobile: false,
  isStandalone: false
};

export const INSTALL_PROMPT_DISMISSED_KEY = "dentray.installPrompt.dismissedAt";
const cooldownMilliseconds = 7 * 24 * 60 * 60 * 1000;
const listeners = new Set<() => void>();
let state = initialState;
let isInitialized = false;
let consumerCount = 0;
let cleanupInstallPrompt: (() => void) | null = null;

function emitChange() {
  listeners.forEach((listener) => listener());
}

function updateState(nextState: Partial<InstallPromptState>) {
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

function readCooldownState() {
  try {
    const dismissedAt = Number(window.localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY) ?? 0);
    return Number.isFinite(dismissedAt) && dismissedAt + cooldownMilliseconds > Date.now();
  } catch {
    return false;
  }
}

function initializeInstallPrompt() {
  if (isInitialized || typeof window === "undefined") {
    return;
  }

  isInitialized = true;
  const displayMode = window.matchMedia("(display-mode: standalone)");

  updateState({
    isCooldownActive: readCooldownState(),
    isIOSSafari: isIOSSafari(),
    isMobile: isMobileDevice(),
    isStandalone: isStandaloneMode()
  });

  const handleBeforeInstallPrompt = (event: Event) => {
    event.preventDefault();
    updateState({ deferredPrompt: event as BeforeInstallPromptEvent });
  };

  const handleAppInstalled = () => {
    updateState({
      deferredPrompt: null,
      forceVisible: false,
      isStandalone: true
    });
  };

  const handleDisplayModeChange = () => {
    updateState({
      forceVisible: false,
      isStandalone: isStandaloneMode()
    });
  };

  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.addEventListener("appinstalled", handleAppInstalled);
  displayMode.addEventListener("change", handleDisplayModeChange);

  cleanupInstallPrompt = () => {
    window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.removeEventListener("appinstalled", handleAppInstalled);
    displayMode.removeEventListener("change", handleDisplayModeChange);
    cleanupInstallPrompt = null;
    isInitialized = false;
  };
}

function registerInstallPrompt() {
  consumerCount += 1;
  initializeInstallPrompt();

  return () => {
    consumerCount = Math.max(0, consumerCount - 1);
    if (consumerCount === 0) {
      cleanupInstallPrompt?.();
    }
  };
}

function dismissPrompt() {
  const dismissedAt = Date.now();
  try {
    window.localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, String(dismissedAt));
  } catch {
    // The prompt can still close when browser storage is unavailable.
  }
  updateState({
    forceVisible: false,
    isCooldownActive: true
  });
}

async function installApp() {
  if (!state.deferredPrompt) {
    return;
  }

  const promptEvent = state.deferredPrompt;
  try {
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "dismissed") {
      dismissPrompt();
    }
  } catch {
    dismissPrompt();
  } finally {
    updateState({
      deferredPrompt: null,
      forceVisible: false
    });
  }
}

function showPrompt() {
  if (!state.isStandalone) {
    updateState({ forceVisible: true });
  }
}

export function useInstallPrompt() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    return registerInstallPrompt();
  }, []);

  const canAutoInstall = Boolean(snapshot.deferredPrompt);
  const canShowAutomatically =
    snapshot.isMobile &&
    !snapshot.isStandalone &&
    !snapshot.isCooldownActive &&
    (canAutoInstall || snapshot.isIOSSafari);

  return {
    canAutoInstall,
    dismissPrompt,
    installApp,
    isIOSSafari: snapshot.isIOSSafari,
    isStandalone: snapshot.isStandalone,
    isVisible: !snapshot.isStandalone && (snapshot.forceVisible || canShowAutomatically),
    showPrompt
  };
}
