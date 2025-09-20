// Lyrics Lower Third URL-specific settings
export interface LyricsLowerThirdSettings {
  // Text appearance
  fontSize: number;
  fontFamily: string;
  textColor: string;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
  fontWeight: 'normal' | 'bold' | '300' | '400' | '500' | '600' | '700';
  
  // Lyrics-specific layout
  displayLines: number;
  lineSpacing: number;
  currentLineHighlight: boolean;
  currentLineColor: string;
  upcomingLineOpacity: number;
  
  // Position and sizing
  bottomOffset: number;
  width: string;
  padding: number;
  maxHeight: string;
  
  // Background styling
  showBackground: boolean;
  backgroundColor: string;
  backgroundOpacity: number;
  borderRadius: number;
  border: string;
  
  // Scrolling behavior
  autoScroll: boolean;
  scrollSpeed: number;
  smoothScrolling: boolean;
}

export const defaultLyricsLowerThirdSettings: LyricsLowerThirdSettings = {
  fontSize: 28,
  fontFamily: 'Arial',
  textColor: '#ffffff',
  textAlign: 'center',
  lineHeight: 1.4,
  fontWeight: 'normal',
  displayLines: 2,
  lineSpacing: 8,
  currentLineHighlight: true,
  currentLineColor: '#ffff00',
  upcomingLineOpacity: 0.7,
  bottomOffset: 60,
  width: '90%',
  padding: 16,
  maxHeight: '25%',
  showBackground: true,
  backgroundColor: '#000000',
  backgroundOpacity: 60,
  borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.2)',
  autoScroll: true,
  scrollSpeed: 500,
  smoothScrolling: true,
};