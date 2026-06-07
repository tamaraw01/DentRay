type IOSNavigator = Navigator & {
  standalone?: boolean;
};

export function isStandaloneMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as IOSNavigator).standalone);
}

export function isIOSDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent;
  const isClassicIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isIPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return isClassicIOS || isIPadOS;
}

export function isIOSSafari() {
  if (!isIOSDevice()) {
    return false;
  }

  const userAgent = navigator.userAgent;
  return /Safari/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(userAgent);
}

export function isMobileDevice() {
  if (typeof window === "undefined") {
    return false;
  }

  return /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent) || window.matchMedia("(max-width: 820px) and (pointer: coarse)").matches;
}
