"use client";

import { useEffect, useState } from "react";

export const useIsRunningInPWA = () => {
  const [isRunningInPWA, setIsRunningInPWA] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const checkPWAMode = () => {
      // Check for standalone mode (Web and MacOS)
      if (window.matchMedia("(display-mode: standalone)").matches) {
        return true;
      }

      // Check for iOS Safari standalone mode
      if ("standalone" in window.navigator && window.navigator.standalone) {
        return true;
      }

      // Additional check for MacOS PWA
      // MacOS PWA might use fullscreen or minimal-ui display mode
      if (
        window.matchMedia("(display-mode: fullscreen)").matches ||
        window.matchMedia("(display-mode: minimal-ui)").matches
      ) {
        return true;
      }

      return false;
    };

    setIsRunningInPWA(checkPWAMode());
  }, []);

  return isRunningInPWA;
};
