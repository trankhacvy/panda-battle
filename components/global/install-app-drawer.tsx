"use client";

import { Share } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Button } from "../ui/button";
import { Drawer, DrawerContent, DrawerTitle } from "../ui/drawer";
import { useIsRunningInPWA } from "@/hooks/use-is-running-in-pwa";
import { Typography } from "../ui/typography";

const LOCAL_STORAGE_KEY = "SHOW_INSTALL_APP_DRAWER";

interface InstallAppDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const InstallAppDrawer = ({ isOpen, onClose }: InstallAppDrawerProps = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const isRunningInPWA = useIsRunningInPWA();
  const isControlled = isOpen !== undefined;

  const handlePermanentClose = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, "false");
    if (isControlled && onClose) {
      onClose();
    } else {
      setIsVisible(false);
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();

      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        handlePermanentClose();
      }

      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    const shouldShow =
      localStorage.getItem(LOCAL_STORAGE_KEY) !== "false" && !isRunningInPWA;
    setIsVisible(shouldShow);
  }, [isRunningInPWA]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
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
  
  const open = isControlled ? isOpen : isVisible;
  
  return (
    <Drawer
      open={open}
      onOpenChange={(open) => {
        if (!open) handlePermanentClose();
      }}
    >
      <DrawerContent className="bg-white px-5">
        <DrawerTitle
          onClose={handlePermanentClose}
          className="w-full text-center text-gray-900"
        >
          Install Panda Battle
        </DrawerTitle>
        <div className="flex flex-col items-center gap-6 pt-6">
          <div className="relative animate-bounce-slow">
            <Image
              src="/images/panda-dowload-require.png"
              alt="Panda Fighter"
              width={400}
              height={400}
              className="relative z-10 drop-shadow-2xl"
            />
          </div>
          <div className="text-center space-y-3">
            <Typography variant="h4" className="font-black text-gray-900">
              Take the battle with you! 🐾
            </Typography>
            <div className="flex items-center justify-center gap-[1ch] flex-wrap">
              <Typography variant="small" className="text-gray-700">
                Tap
              </Typography>
              <Share size={18} className="text-gray-700" />
              <Typography
                variant="small"
                className="text-gray-700 font-mono"
              >
                then &apos;Add to Home Screen&apos;
              </Typography>
            </div>
            <Typography variant="small" className="text-gray-600 mt-2">
              Fight anytime, anywhere!
            </Typography>
          </div>
          {deferredPrompt ? (
            <div className="w-full space-y-2">
              <Button
                variant="primary"
                onClick={handleInstallClick}
                className="w-full"
                size="lg"
              >
                Install Now
              </Button>
              <Button
                variant="secondary"
                onClick={() => setIsVisible(false)}
                className="w-full"
                size="lg"
              >
                Remind me later
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              onClick={() => setIsVisible(false)}
              className="w-full"
              size="lg"
            >
              Got it!
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
