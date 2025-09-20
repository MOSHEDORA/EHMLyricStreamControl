// Bible Navigator URL-specific settings
export interface BibleNavigatorSettings {
  // Display preferences
  defaultBible: string;
  defaultLanguage: 'english' | 'telugu';
  showBothLanguages: boolean;
  languageTogglePosition: 'top' | 'side' | 'bottom';
  
  // Navigation
  showBookList: boolean;
  showChapterNumbers: boolean;
  showVerseNumbers: boolean;
  quickNavigation: boolean;
  bookmarkSupport: boolean;
  recentlyViewed: boolean;
  maxRecentItems: number;
  
  // Layout and appearance
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  textColor: string;
  backgroundColor: string;
  
  // Reading experience
  verseSpacing: number;
  paragraphMode: boolean;
  highlightCurrentVerse: boolean;
  currentVerseColor: string;
  readingMode: 'normal' | 'focused' | 'presentation';
  
  // Search and references
  enableSearch: boolean;
  showCrossReferences: boolean;
  showFootnotes: boolean;
  searchResultLimit: number;
  
  // Performance
  lazyLoading: boolean;
  cacheChapters: boolean;
  preloadAdjacent: boolean;
  
  // Audio support
  enableAudio: boolean;
  audioSpeed: number;
  autoPlay: boolean;
  audioLanguage: 'english' | 'telugu';
}

export const defaultBibleNavigatorSettings: BibleNavigatorSettings = {
  defaultBible: 'EnglishESVBible',
  defaultLanguage: 'english',
  showBothLanguages: false,
  languageTogglePosition: 'top',
  showBookList: true,
  showChapterNumbers: true,
  showVerseNumbers: true,
  quickNavigation: true,
  bookmarkSupport: true,
  recentlyViewed: true,
  maxRecentItems: 10,
  fontSize: 16,
  fontFamily: 'Georgia',
  lineHeight: 1.6,
  textColor: '#333333',
  backgroundColor: '#ffffff',
  verseSpacing: 8,
  paragraphMode: false,
  highlightCurrentVerse: true,
  currentVerseColor: '#ffff99',
  readingMode: 'normal',
  enableSearch: true,
  showCrossReferences: false,
  showFootnotes: false,
  searchResultLimit: 50,
  lazyLoading: true,
  cacheChapters: true,
  preloadAdjacent: true,
  enableAudio: false,
  audioSpeed: 1.0,
  autoPlay: false,
  audioLanguage: 'english',
};