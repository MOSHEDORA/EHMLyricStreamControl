// Display Fullscreen URL-specific settings
export interface DisplayFullscreenSettings {
  // Text appearance
  fontSize: number;
  fontFamily: string;
  textColor: string;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
  letterSpacing: number;
  textShadow: string;
  
  // Layout
  displayLines: number;
  padding: number;
  margin: number;
  verticalAlign: 'top' | 'center' | 'bottom';
  
  // Background
  showBackground: boolean;
  backgroundColor: string;
  backgroundOpacity: number;
  backgroundImage: string;
  backgroundSize: 'cover' | 'contain' | 'auto';
  
  // Effects
  textOutline: boolean;
  outlineColor: string;
  outlineWidth: number;
  dropShadow: boolean;
  shadowColor: string;
  shadowBlur: number;
}

export const defaultDisplayFullscreenSettings: DisplayFullscreenSettings = {
  fontSize: 48,
  fontFamily: 'Arial',
  textColor: '#ffffff',
  textAlign: 'center',
  lineHeight: 1.3,
  letterSpacing: 1,
  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
  displayLines: 4,
  padding: 40,
  margin: 40,
  verticalAlign: 'center',
  showBackground: false,
  backgroundColor: '#000000',
  backgroundOpacity: 70, // 0-100 scale
  backgroundImage: '',
  backgroundSize: 'cover',
  textOutline: true,
  outlineColor: '#000000',
  outlineWidth: 2,
  dropShadow: true,
  shadowColor: '#000000',
  shadowBlur: 4,
};