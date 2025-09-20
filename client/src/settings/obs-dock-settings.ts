// OBS Dock URL-specific settings
export interface ObsDockSettings {
  // Layout preferences
  compactMode: boolean;
  showPreview: boolean;
  previewHeight: number;
  controlsPosition: 'top' | 'bottom' | 'side';
  
  // Control panel
  fontSize: number;
  fontFamily: string;
  buttonSize: 'small' | 'medium' | 'large';
  showAdvancedControls: boolean;
  quickActionButtons: string[];
  
  // Display settings
  autoRefresh: boolean;
  refreshInterval: number;
  showConnectionStatus: boolean;
  showSessionInfo: boolean;
  
  // OBS integration
  obsWebSocketPort: number;
  obsPassword: string;
  autoConnectObs: boolean;
  syncWithObs: boolean;
  
  // Visual customization
  theme: 'dark' | 'light' | 'obs';
  accentColor: string;
  backgroundColor: string;
  borderColor: string;
  
  // Shortcuts and hotkeys
  enableHotkeys: boolean;
  hotkeyModifier: 'ctrl' | 'alt' | 'shift';
  playPauseKey: string;
  nextKey: string;
  previousKey: string;
}

export const defaultObsDockSettings: ObsDockSettings = {
  compactMode: true,
  showPreview: false,
  previewHeight: 200,
  controlsPosition: 'bottom',
  fontSize: 12,
  fontFamily: 'Arial',
  buttonSize: 'small',
  showAdvancedControls: false,
  quickActionButtons: ['play', 'pause', 'next', 'previous'],
  autoRefresh: true,
  refreshInterval: 2000,
  showConnectionStatus: true,
  showSessionInfo: false,
  obsWebSocketPort: 4455,
  obsPassword: '',
  autoConnectObs: false,
  syncWithObs: true,
  theme: 'dark',
  accentColor: '#0078d4',
  backgroundColor: '#1e1e1e',
  borderColor: '#333333',
  enableHotkeys: true,
  hotkeyModifier: 'ctrl',
  playPauseKey: 'space',
  nextKey: 'arrowright',
  previousKey: 'arrowleft',
};