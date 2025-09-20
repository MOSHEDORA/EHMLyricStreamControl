// Display Lower Third URL-specific settings
export interface DisplayLowerThirdSettings {
  // Text appearance
  fontSize: number;
  fontFamily: string;
  textColor: string;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
  letterSpacing: number;
  
  // Layout
  displayLines: number;
  padding: number;
  marginBottom: number;
  height: string; // CSS height value
  width: string; // CSS width value
  
  // Background
  showBackground: boolean;
  backgroundColor: string;
  backgroundOpacity: number;
  borderRadius: number;
  
  // Animation
  animationDuration: number;
  fadeInDelay: number;
  slideDirection: 'up' | 'down' | 'left' | 'right' | 'none';
  
  // Auto Font Size and Auto Fit
  autoFontSize: boolean;
  minFontSize: number;
  maxFontSize: number;
  autoFit: boolean;
  autoFitMargins: number;
}

export const defaultDisplayLowerThirdSettings: DisplayLowerThirdSettings = {
  fontSize: 32,
  fontFamily: 'Arial',
  textColor: '#ffffff',
  textAlign: 'center',
  lineHeight: 1.2,
  letterSpacing: 0,
  displayLines: 2,
  padding: 20,
  marginBottom: 40,
  height: '30%',
  width: '100%',
  showBackground: false,
  backgroundColor: '#000000',
  backgroundOpacity: 50, // 0-100 scale
  borderRadius: 8,
  animationDuration: 300,
  fadeInDelay: 0,
  slideDirection: 'up',
  autoFontSize: true,
  minFontSize: 14,
  maxFontSize: 150,
  autoFit: true,
  autoFitMargins: 20,
};