import { type Resolution, DEFAULT_RESOLUTION } from './resolution';

// Bible Lower Third URL-specific settings
export interface BibleLowerThirdSettings {
  // Display resolution and scaling
  displayResolution: Resolution;
  // Text appearance
  fontSize: number;
  fontFamily: string;
  textColor: string;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
  fontWeight: 'normal' | 'bold' | '300' | '400' | '500' | '600' | '700';
  
  // Bible-specific display
  showVerseNumbers: boolean;
  verseNumberColor: string;
  showReference: boolean;
  referenceColor: string;
  referencePosition: 'top' | 'bottom' | 'inline';
  
  // Layout
  displayLines: number;
  verseSpacing: number;
  padding: number;
  bottomOffset: number;
  width: string;
  maxHeight: string;
  
  // Background styling
  showBackground: boolean;
  backgroundColor: string;
  backgroundOpacity: number;
  borderRadius: number;
  border: string;
  
  // Language support
  primaryLanguage: 'english' | 'telugu';
  showBothLanguages: boolean;
  languageSeparator: string;
  secondaryLanguageOpacity: number;
  
  // Auto Font Size and Auto Fit
  autoFontSize: boolean;
  minFontSize: number;
  maxFontSize: number;
  autoFit: boolean;
  autoFitMargins: number;
}

export const defaultBibleLowerThirdSettings: BibleLowerThirdSettings = {
  displayResolution: DEFAULT_RESOLUTION,
  fontSize: 26,
  fontFamily: 'Arial',
  textColor: '#ffffff',
  textAlign: 'center',
  lineHeight: 1.4,
  fontWeight: 'normal',
  showVerseNumbers: true,
  verseNumberColor: '#cccccc',
  showReference: true,
  referenceColor: '#ffcc00',
  referencePosition: 'bottom',
  displayLines: 3,
  verseSpacing: 6,
  padding: 18,
  bottomOffset: 50,
  width: '85%',
  maxHeight: '30%',
  showBackground: true,
  backgroundColor: '#001122',
  backgroundOpacity: 75, // 0-100 scale
  borderRadius: 8,
  border: '2px solid rgba(255,204,0,0.3)',
  primaryLanguage: 'english',
  showBothLanguages: false,
  languageSeparator: ' | ',
  secondaryLanguageOpacity: 0.8,
  autoFontSize: true,
  minFontSize: 12,
  maxFontSize: 120,
  autoFit: true,
  autoFitMargins: 18,
};