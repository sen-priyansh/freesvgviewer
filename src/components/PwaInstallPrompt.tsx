'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      return;
    }

    // Check if dismissed recently (within 7 days)
    const dismissedTime = localStorage.getItem('pwa_prompt_dismissed');
    if (dismissedTime) {
      const daysSinceDismissed =
        (Date.now() - parseInt(dismissedTime, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Small timeout for smooth non-jarring appearance
      setTimeout(() => {
        setIsVisible(true);
      }, 1500);
    };

    const handleAppInstalled = () => {
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        setIsVisible(false);
        setDeferredPrompt(null);
      } else {
        handleDismiss();
      }
    } catch {
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <aside
      className="pwa-install-banner"
      role="region"
      aria-label="Install Free SVG Viewer as an application"
    >
      <div className="pwa-banner-main">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/freesvg.svg"
          alt="SVG Viewer"
          width="22"
          height="22"
          className="pwa-banner-icon"
        />
        <div className="pwa-banner-info">
          <span className="pwa-banner-title">Install App</span>
          <span className="pwa-banner-desc">Offline ready</span>
        </div>
      </div>
      <div className="pwa-banner-actions">
        <button
          type="button"
          className="pwa-btn-dismiss"
          onClick={handleDismiss}
          aria-label="Dismiss installation prompt"
        >
          Later
        </button>
        <button
          type="button"
          className="pwa-btn-install"
          onClick={handleInstallClick}
        >
          Install
        </button>
      </div>
    </aside>
  );
}
