import { type Resolution, DEFAULT_RESOLUTION } from './resolution';

// Bible Fullscreen URL-specific settings
export interface BibleFullscreenSettings {
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
  verseNumberSize: number; // relative to fontSize
  showReference: boolean;
  referenceColor: string;
  referenceSize: number; // relative to fontSize
  referencePosition: 'top' | 'bottom' | 'header' | 'footer';
  
  // Chapter display
  showChapterTitle: boolean;
  chapterTitleColor: string;
  chapterTitleSize: number;
  versesPerScreen: number;
  
  // Layout and positioning
  padding: number;
  margin: number;
  verticalAlign: 'top' | 'center' | 'bottom';
  columnLayout: boolean;
  columnGap: number;
  
  // Background and styling
  showBackground: boolean;
  backgroundColor: string;
  backgroundOpacity: number;
  backgroundImage: string;
  textOutline: boolean;
  outlineColor: string;
  outlineWidth: number;
  textShadow: string;
  
  // Language support
  primaryLanguage: 'english' | 'telugu';
  showBothLanguages: boolean;
  languageLayout: 'side-by-side' | 'stacked' | 'alternating';
  secondaryLanguageSize: number; // relative to primary
  languageSeparator: string;
  
  // Auto Font Size and Auto Fit
  autoFontSize: boolean;
  minFontSize: number;
  maxFontSize: number;
  autoFit: boolean;
  autoFitMargins: number;
}

export const defaultBibleFullscreenSettings: BibleFullscreenSettings = {
  displayResolution: DEFAULT_RESOLUTION,
  fontSize: 42,
  fontFamily: 'Georgia',
  textColor: '#ffffff',
  textAlign: 'left',
  lineHeight: 1.6,
  fontWeight: 'normal',
  showVerseNumbers: true,
  verseNumberColor: '#aaccff',
  verseNumberSize: 0.8,
  showReference: true,
  referenceColor: '#ffcc66',
  referenceSize: 0.9,
  referencePosition: 'header',
  showChapterTitle: true,
  chapterTitleColor: '#ffcc66',
  chapterTitleSize: 1.3,
  versesPerScreen: 6,
  padding: 60,
  margin: 40,
  verticalAlign: 'top',
  columnLayout: false,
  columnGap: 40,
  showBackground: true,
  backgroundColor: '#001133',
  backgroundOpacity: 80, // 0-100 scale
  backgroundImage: '',
  textOutline: false,
  outlineColor: '#000000',
  outlineWidth: 1,
  textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
  primaryLanguage: 'english',
  showBothLanguages: false,
  languageLayout: 'side-by-side',
  secondaryLanguageSize: 0.9,
  languageSeparator: ' | ',
  autoFontSize: true,
  minFontSize: 18,
  maxFontSize: 180,
  autoFit: true,
  autoFitMargins: 60,
};