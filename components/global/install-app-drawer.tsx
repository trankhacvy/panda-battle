"use client";

import { Share } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Button } from "../ui/button";
import { Drawer, DrawerContent, DrawerTitle } from "../ui/drawer";
import { useIsRunningInPWA } from "@/hooks/use-is-running-in-pwa";
import { Typography } from "../ui/typography";

const LOCAL_STORAGE_KEY = "SHOW_INSTALL_APP_DRAWER";

export const InstallAppDrawer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const isRunningInPWA = useIsRunningInPWA();

  const handlePermanentClose = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, "false");
    setIsVisible(false);
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user's response
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        // User accepted the install prompt
        handlePermanentClose();
      }

      // Clear the deferredPrompt
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    // Only show if:
    // 1. User hasn't permanently closed it
    // 2. Not running in PWA mode
    const shouldShow =
      localStorage.getItem(LOCAL_STORAGE_KEY) !== "false" && !isRunningInPWA;
    setIsVisible(shouldShow);
  }, [isRunningInPWA]);

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default install dialog
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);
  return (
    <Drawer
      open={isVisible}
      onOpenChange={(open) => {
        if (!open) handlePermanentClose();
      }}
    >
      <DrawerContent className="bg-[#75E536] px-5">
        <DrawerTitle
          onClose={handlePermanentClose}
          className="w-full text-center"
        >
          Install Panda Battle
        </DrawerTitle>
        <div className="flex flex-col items-center gap-6 pt-6">
          <div className="relative animate-bounce-slow">
            <Image
              src="/images/sample-panda.png"
              alt="Panda Fighter"
              width={120}
              height={120}
              className="relative z-10 drop-shadow-2xl"
            />
          </div>
          <div className="text-center space-y-3">
            <Typography variant="h4" className="font-black">
              Take the battle with you! 🐾
            </Typography>
            <div className="flex items-center justify-center gap-[1ch] flex-wrap">
              <Typography variant="small" className="text-ds-gray-700">
                Tap
              </Typography>
              <Share size={18} />
              <Typography
                variant="small"
                className="text-ds-gray-700 font-mono"
              >
                then &apos;Add to Home Screen&apos;
              </Typography>
            </div>
            <Typography variant="small" className="text-ds-gray-600 mt-2">
              Fight anytime, anywhere!
            </Typography>
          </div>
          {deferredPrompt ? (
            <div className="w-full space-y-2">
              <Button
                variant="primary"
                onClick={handleInstallClick}
                className="w-full"
              >
                Install Now
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsVisible(false)}
                className="w-full"
              >
                Remind me later
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              onClick={() => setIsVisible(false)}
              className="w-full"
            >
              Got it!
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
