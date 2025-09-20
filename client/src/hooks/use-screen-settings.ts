import { useState, useEffect } from 'react';
import { loadScreenSettings, saveScreenSettings, type ScreenSettings } from '@/utils/screen-settings';

export function useScreenSettings() {
  const [settings, setSettings] = useState<ScreenSettings>(() => loadScreenSettings());

  // Listen for storage changes from other windows/tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'global-screen-settings' && event.newValue) {
        try {
          const newSettings = JSON.parse(event.newValue);
          setSettings(newSettings);
        } catch (error) {
          console.warn('Failed to parse screen settings from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update settings and persist to localStorage
  const updateSettings = (updates: Partial<ScreenSettings>) => {
    const current = loadScreenSettings();
    const updated = { ...current, ...updates };
    
    // If preset changed, update dimensions
    if (updates.preset && updates.preset !== 'custom') {
      const presets = {
        '720p (HD)': { width: 1280, height: 720 },
        '1080p (Full HD)': { width: 1920, height: 1080 },
        '1440p (2K)': { width: 2560, height: 1440 },
        '4K (Ultra HD)': { width: 3840, height: 2160 },
        '1366x768': { width: 1366, height: 768 },
        '1600x900': { width: 1600, height: 900 },
      } as const;
      
      const preset = presets[updates.preset as keyof typeof presets];
      if (preset) {
        updated.width = preset.width;
        updated.height = preset.height;
      }
    }
    
    setSettings(updated);
    saveScreenSettings(updated);
  };

  return {
    settings,
    updateSettings,
  };
}