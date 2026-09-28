'use client';

import { useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    pwaInstallAvailable?: boolean;
  }
}

export default function PwaInstallPrompt() {
  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) return;

    let deferredPrompt: BeforeInstallPromptEvent | null = null;

    const setAvailability = (available: boolean) => {
      window.pwaInstallAvailable = available;
      window.dispatchEvent(new Event(available ? 'pwa-install-available' : 'pwa-install-unavailable'));
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      deferredPrompt = event as BeforeInstallPromptEvent;
      setAvailability(true);
    };

    const handleInstallRequest = async () => {
      if (!deferredPrompt) return;

      try {
        await deferredPrompt.prompt();
        await deferredPrompt.userChoice;
      } finally {
        deferredPrompt = null;
        setAvailability(false);
      }
    };

    const handleAppInstalled = () => {
      deferredPrompt = null;
      setAvailability(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-install-request', handleInstallRequest);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-install-request', handleInstallRequest);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return null;
}
