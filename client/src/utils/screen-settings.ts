// Screen settings types and utilities for auto-sizing text across all display views

export interface ScreenPreset {
  name: string;
  width: number;
  height: number;
}

export interface ScreenSettings {
  // Screen dimensions
  preset: string | 'custom';
  width: number;
  height: number;
  
  // Auto-sizing configuration
  autoSizeEnabled: boolean;
  minFontSize: number;
  maxFontSize: number;
  
  // Layout configuration
  margins: number; // Margin in pixels around content
  lowerThirdHeightPercent: number; // Percentage of screen height for lower third
}

export const SCREEN_PRESETS: ScreenPreset[] = [
  { name: '720p (HD)', width: 1280, height: 720 },
  { name: '1080p (Full HD)', width: 1920, height: 1080 },
  { name: '1440p (2K)', width: 2560, height: 1440 },
  { name: '4K (Ultra HD)', width: 3840, height: 2160 },
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1600x900', width: 1600, height: 900 },
];

export const DEFAULT_SCREEN_SETTINGS: ScreenSettings = {
  preset: '1080p (Full HD)',
  width: 1920,
  height: 1080,
  autoSizeEnabled: true,
  minFontSize: 16,
  maxFontSize: 200,
  margins: 40,
  lowerThirdHeightPercent: 25,
};

const STORAGE_KEY = 'global-screen-settings';

export function loadScreenSettings(): ScreenSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle missing properties
      return { ...DEFAULT_SCREEN_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load screen settings from localStorage:', error);
  }
  return DEFAULT_SCREEN_SETTINGS;
}

export function saveScreenSettings(settings: ScreenSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    // Dispatch storage event for cross-window synchronization
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: JSON.stringify(settings),
      storageArea: localStorage,
    }));
  } catch (error) {
    console.error('Failed to save screen settings to localStorage:', error);
  }
}

export function getPresetByName(name: string): ScreenPreset | undefined {
  return SCREEN_PRESETS.find(preset => preset.name === name);
}

export function updateScreenSettings(updates: Partial<ScreenSettings>): ScreenSettings {
  const current = loadScreenSettings();
  const updated = { ...current, ...updates };
  
  // If preset changed, update dimensions
  if (updates.preset && updates.preset !== 'custom') {
    const preset = getPresetByName(updates.preset);
    if (preset) {
      updated.width = preset.width;
      updated.height = preset.height;
    }
  }
  
  saveScreenSettings(updated);
  return updated;
}

// Calculate available area for content based on screen settings
export function getContentArea(settings: ScreenSettings, isLowerThird: boolean) {
  const { width, height, margins, lowerThirdHeightPercent } = settings;
  
  if (isLowerThird) {
    const lowerThirdHeight = (height * lowerThirdHeightPercent) / 100;
    return {
      width: width - (margins * 2),
      height: lowerThirdHeight - (margins * 2),
    };
  }
  
  return {
    width: width - (margins * 2),
    height: height - (margins * 2),
  };
}