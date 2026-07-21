"use client";

import { useEffect, useState } from "react";

const SPLASH_LIFETIME_MS = 760;

export function AppLaunchSplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), SPLASH_LIFETIME_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="app-launch-splash" aria-hidden="true">
      <div className="app-launch-wordmark">
        <span>Study</span><span>Scroll</span>
      </div>
    </div>
  );
}
