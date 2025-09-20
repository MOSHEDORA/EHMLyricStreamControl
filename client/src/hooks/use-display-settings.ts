import { useQuery } from "@tanstack/react-query";
import type { 
  LyricsLowerThirdSettings, 
  LyricsFullscreenSettings, 
  BibleLowerThirdSettings, 
  BibleFullscreenSettings, 
  ControlPanelSettings, 
  OBSDockSettings 
} from "@shared/schema";

type DisplayType = 'lyrics-lower-third' | 'lyrics-fullscreen' | 'bible-lower-third' | 'bible-fullscreen' | 'control-panel' | 'obs-dock';

type DisplaySettingsMap = {
  'lyrics-lower-third': LyricsLowerThirdSettings;
  'lyrics-fullscreen': LyricsFullscreenSettings;
  'bible-lower-third': BibleLowerThirdSettings;
  'bible-fullscreen': BibleFullscreenSettings;
  'control-panel': ControlPanelSettings;
  'obs-dock': OBSDockSettings;
};

// Helper function to make API requests
async function fetchDisplaySettings(displayType: DisplayType): Promise<any> {
  const response = await fetch(`/api/display-settings/${displayType}`, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch settings: ${response.statusText}`);
  }

  return response.json();
}

export function useDisplaySettings<T extends DisplayType>(
  displayType: T
): {
  settings: DisplaySettingsMap[T] | undefined;
  isLoading: boolean;
  error: Error | null;
} {
  const { data, isLoading, error } = useQuery({
    queryKey: ['display-settings', displayType],
    queryFn: () => fetchDisplaySettings(displayType),
    staleTime: 5000, // Settings can change, cache for 5 seconds for better responsiveness
    refetchOnWindowFocus: true, // Refetch when user switches tabs to catch updates
  });

  return {
    settings: data?.settings,
    isLoading,
    error: error as Error | null,
  };
}

// Default settings for each display type
export const defaultSettings = {
  'lyrics-lower-third': {
    displayLines: 2,
    fontSize: 32,
    fontFamily: 'Arial',
    textColor: '#ffffff',
    textAlign: 'center' as const,
    lineHeight: 1.2,
    fontWeight: 'normal' as const,
    maxHeight: '200px',
    padding: 20,
  } as LyricsLowerThirdSettings,
  
  'lyrics-fullscreen': {
    displayLines: 4,
    fontSize: 48,
    fontFamily: 'Arial',
    textColor: '#ffffff',
    textAlign: 'center' as const,
    lineHeight: 1.3,
    fontWeight: 'normal' as const,
    textTransform: 'none' as const,
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    padding: 40,
    margin: 40,
  } as LyricsFullscreenSettings,
  
  'bible-lower-third': {
    displayLines: 2,
    fontSize: 32,
    fontFamily: 'Arial',
    textColor: '#ffffff',
    textAlign: 'center' as const,
    lineHeight: 1.2,
    fontWeight: 'normal' as const,
    maxHeight: '200px',
    padding: 20,
  } as BibleLowerThirdSettings,
  
  'bible-fullscreen': {
    versesPerScreen: 4,
    fontSize: 48,
    fontFamily: 'Arial',
    textColor: '#ffffff',
    textAlign: 'center' as const,
    lineHeight: 1.3,
    fontWeight: 'normal' as const,
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    padding: 40,
    margin: 40,
  } as BibleFullscreenSettings,
  
  'control-panel': {
    fontSize: 14,
    fontFamily: 'Arial',
    backgroundColor: '#ffffff',
  } as ControlPanelSettings,
  
  'obs-dock': {
    fontSize: 14,
    fontFamily: 'Arial',
    compactMode: false,
  } as OBSDockSettings,
};