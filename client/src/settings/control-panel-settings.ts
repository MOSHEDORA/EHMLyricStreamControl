// Control Panel URL-specific settings
export interface ControlPanelSettings {
  // Display preferences
  compactMode: boolean;
  showAdvancedControls: boolean;
  defaultDisplayLines: number;
  autoRefresh: boolean;
  refreshInterval: number; // milliseconds
  
  // UI layout
  sidebarWidth: number;
  panelLayout: 'horizontal' | 'vertical';
  fontSize: number;
  fontFamily: string;
  
  // Session management
  defaultSessionId: string;
  autoCreateSession: boolean;
  showSessionInfo: boolean;
}

export const defaultControlPanelSettings: ControlPanelSettings = {
  compactMode: false,
  showAdvancedControls: true,
  defaultDisplayLines: 2,
  autoRefresh: true,
  refreshInterval: 1000,
  sidebarWidth: 300,
  panelLayout: 'horizontal',
  fontSize: 14,
  fontFamily: 'Arial',
  defaultSessionId: 'default',
  autoCreateSession: true,
  showSessionInfo: true,
};