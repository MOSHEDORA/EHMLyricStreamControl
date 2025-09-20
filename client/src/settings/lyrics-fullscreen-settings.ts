import { type Resolution, DEFAULT_RESOLUTION } from './resolution';

// Lyrics Fullscreen URL-specific settings
export interface LyricsFullscreenSettings {
  // Display resolution and scaling
  displayResolution: Resolution;
  // Text appearance
  fontSize: number;
  fontFamily: string;
  textColor: string;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
  fontWeight: 'normal' | 'bold' | '300' | '400' | '500' | '600' | '700';
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  
  // Lyrics display
  displayLines: number;
  maxLines: number;
  currentLineHighlight: boolean;
  currentLineColor: string;
  currentLineSize: number; // multiplier for current line
  upcomingLineOpacity: number;
  
  // Layout and positioning
  padding: number;
  margin: number;
  verticalAlign: 'top' | 'center' | 'bottom';
  horizontalAlign: 'left' | 'center' | 'right';
  
  // Background and effects
  showBackground: boolean;
  backgroundColor: string;
  backgroundOpacity: number;
  backgroundBlur: number;
  textOutline: boolean;
  outlineColor: string;
  outlineWidth: number;
  textShadow: string;
  
  // Animation and transitions
  transitionDuration: number;
  fadeTransition: boolean;
  slideTransition: boolean;
  slideDirection: 'up' | 'down' | 'left' | 'right';
  
  // Auto Font Size and Auto Fit
  autoFontSize: boolean;
  minFontSize: number;
  maxFontSize: number;
  autoFit: boolean;
  autoFitMargins: number;
}

export const defaultLyricsFullscreenSettings: LyricsFullscreenSettings = {
  displayResolution: DEFAULT_RESOLUTION,
  fontSize: 54,
  fontFamily: 'Arial',
  textColor: '#ffffff',
  textAlign: 'center',
  lineHeight: 1.5,
  fontWeight: 'bold',
  textTransform: 'none',
  displayLines: 4,
  maxLines: 8,
  currentLineHighlight: true,
  currentLineColor: '#ffff66',
  currentLineSize: 1.2,
  upcomingLineOpacity: 0.8,
  padding: 50,
  margin: 50,
  verticalAlign: 'center',
  horizontalAlign: 'center',
  showBackground: false,
  backgroundColor: '#000000',
  backgroundOpacity: 50,
  backgroundBlur: 0,
  textOutline: true,
  outlineColor: '#000000',
  outlineWidth: 3,
  textShadow: '3px 3px 6px rgba(0,0,0,0.9)',
  transitionDuration: 400,
  fadeTransition: true,
  slideTransition: false,
  slideDirection: 'up',
  autoFontSize: true,
  minFontSize: 20,
  maxFontSize: 200,
  autoFit: true,
  autoFitMargins: 50,
};