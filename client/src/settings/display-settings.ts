// General Display URL-specific settings
export interface DisplaySettings {
  // Base display configuration
  fontSize: number;
  fontFamily: string;
  textColor: string;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
  
  // Layout
  displayLines: number;
  padding: number;
  margin: number;
  width: string;
  height: string;
  
  // Background
  showBackground: boolean;
  backgroundColor: string;
  backgroundOpacity: number;
  backgroundImage: string;
  
  // Effects
  textShadow: string;
  borderRadius: number;
  border: string;
  
  // Responsive behavior
  autoScale: boolean;
  minFontSize: number;
  maxFontSize: number;
  
  // Display mode
  mode: 'lyrics' | 'bible' | 'custom';
  refreshRate: number;
}

export const defaultDisplaySettings: DisplaySettings = {
  fontSize: 36,
  fontFamily: 'Arial',
  textColor: '#ffffff',
  textAlign: 'center',
  lineHeight: 1.4,
  displayLines: 3,
  padding: 30,
  margin: 30,
  width: '100%',
  height: '100%',
  showBackground: false,
  backgroundColor: '#000000',
  backgroundOpacity: 50,
  backgroundImage: '',
  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
  borderRadius: 0,
  border: 'none',
  autoScale: true,
  minFontSize: 16,
  maxFontSize: 200,
  mode: 'lyrics',
  refreshRate: 1000,
};