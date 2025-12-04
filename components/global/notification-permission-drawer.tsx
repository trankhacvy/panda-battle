"use client";

import { Bell } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Button } from "../ui/button";
import { Drawer, DrawerContent, DrawerTitle } from "../ui/drawer";
import { Typography } from "../ui/typography";

const LOCAL_STORAGE_KEY = "";

export const NotificationPermissionDrawer = () => {
  const [isVisible, setIsVisible] = useState(false);

  const handleDismiss = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, "true");
    setIsVisible(false);
  };

  const handleEnableNotifications = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        handleDismiss();
      }
    } else {
      handleDismiss();
    }
  };

  useEffect(() => {
    const isDismissed = localStorage.getItem(LOCAL_STORAGE_KEY) === "true";
    const notificationSupported = "Notification" in window;
    const permissionNotGranted = notificationSupported && Notification.permission !== "granted";

    const timer = setTimeout(() => {
      setIsVisible(!isDismissed && permissionNotGranted);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Drawer
      open={isVisible}
      onOpenChange={(open) => {
        if (!open) handleDismiss();
      }}
    >
      <DrawerContent className="bg-white px-5">
        <DrawerTitle
          onClose={handleDismiss}
          className="w-full text-center text-gray-900"
        >
          Stay Updated! 🔔
        </DrawerTitle>
        <div className="flex flex-col items-center gap-6 pt-6">
          <div className="relative">
            <Image
              src="/images/panda-noti-require.png"
              alt="Panda Notification"
              width={400}
              height={400}
              className="drop-shadow-2xl"
            />
          </div>
          <div className="text-center space-y-3">
            <Typography variant="h4" className="font-black text-gray-900">
              Enable Notifications
            </Typography>
            <Typography variant="small" className="text-gray-600">
              Get notified about battles, rewards, and important updates!
            </Typography>
           
          </div>
          <div className="w-full space-y-2">
            <Button
              variant="primary"
              onClick={handleEnableNotifications}
              className="w-full"
              size="lg"
            >
              Enable Notifications
            </Button>
            <Button
              variant="secondary"
              onClick={handleDismiss}
              className="w-full"
              size="lg"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
