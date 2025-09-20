import { useState, useEffect, useCallback } from 'react';
import { DisplayType, DEFAULT_RESOLUTION, type Resolution } from '@/settings/resolution';
import { defaultLyricsLowerThirdSettings } from '@/settings/lyrics-lower-third-settings';
import { defaultLyricsFullscreenSettings } from '@/settings/lyrics-fullscreen-settings';
import { defaultBibleLowerThirdSettings } from '@/settings/bible-lower-third-settings';
import { defaultBibleFullscreenSettings } from '@/settings/bible-fullscreen-settings';

// Generic hook for managing display-type-specific settings with localStorage persistence
export function useDisplaySettings<T extends Record<string, any>>(
  displayType: DisplayType,
  defaultSettings: T & { displayResolution?: Resolution }
) {
  const storageKey = `displaySettings:${displayType}`;
  
  // Merge default settings with default resolution if not provided
  const settingsWithResolution = {
    displayResolution: DEFAULT_RESOLUTION,
    ...defaultSettings
  };

  const [settings, setSettings] = useState<T & { displayResolution: Resolution }>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all properties exist
        return { ...settingsWithResolution, ...parsed };
      }
    } catch (error) {
      console.warn(`Failed to load settings for ${displayType}:`, error);
    }
    return settingsWithResolution;
  });

  const updateSettings = useCallback((updates: Partial<T & { displayResolution: Resolution }>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      try {
        localStorage.setItem(storageKey, JSON.stringify(newSettings));
      } catch (error) {
        console.warn(`Failed to save settings for ${displayType}:`, error);
      }
      return newSettings;
    });
  }, [displayType, storageKey]);

  const resetSettings = useCallback(() => {
    setSettings(settingsWithResolution);
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn(`Failed to reset settings for ${displayType}:`, error);
    }
  }, [displayType, storageKey, settingsWithResolution]);

  const exportSettings = useCallback(() => {
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  const importSettings = useCallback((jsonString: string) => {
    try {
      const imported = JSON.parse(jsonString);
      const merged = { ...settingsWithResolution, ...imported };
      updateSettings(merged);
      return true;
    } catch (error) {
      console.warn(`Failed to import settings for ${displayType}:`, error);
      return false;
    }
  }, [displayType, settingsWithResolution, updateSettings]);

  return {
    settings,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings
  };
}

// Convenience hooks for each display type
export function useLyricsLowerThirdSettings() {
  return useDisplaySettings('lyrics:lower-third', defaultLyricsLowerThirdSettings);
}

export function useLyricsFullscreenSettings() {
  return useDisplaySettings('lyrics:fullscreen', defaultLyricsFullscreenSettings);
}

export function useBibleLowerThirdSettings() {
  return useDisplaySettings('bible:lower-third', defaultBibleLowerThirdSettings);
}

export function useBibleFullscreenSettings() {
  return useDisplaySettings('bible:fullscreen', defaultBibleFullscreenSettings);
}