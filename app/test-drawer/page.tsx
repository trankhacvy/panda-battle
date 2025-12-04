"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InstallAppDrawer } from "@/components/global/install-app-drawer";
import { NotificationPermissionDrawer } from "@/components/global/notification-permission-drawer";

export default function TestDrawerPage() {
  const [showInstallDrawer, setShowInstallDrawer] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-3xl font-bold text-white mb-6">Test Drawers</h1>
      
      <div className="flex flex-col gap-4 w-full max-w-md">
        <Button
          variant="primary"
          size="lg"
          onClick={() => setShowInstallDrawer(true)}
          className="w-full"
        >
          Show Install App Drawer
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={() => setShowNotificationDrawer(true)}
          className="w-full"
        >
          Show Notification Drawer
        </Button>
      </div>

      {showInstallDrawer && (
        <InstallAppDrawer 
          isOpen={showInstallDrawer}
          onClose={() => setShowInstallDrawer(false)}
        />
      )}

      {showNotificationDrawer && (
        <NotificationPermissionDrawer
          isOpen={showNotificationDrawer}
          onClose={() => setShowNotificationDrawer(false)}
        />
      )}
    </div>
  );
}
