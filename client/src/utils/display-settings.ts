export interface DisplaySettings {
  // Text styling
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  textColor: string;
  strokeWidth: number;
  strokeColor: string;
  lineHeight: number;
  letterSpacing: number;
  textAlign: 'left' | 'center' | 'right';
  
  // Background settings
  backgroundEnabled: boolean;
  backgroundType: 'color' | 'gradient' | 'image';
  backgroundColor: string;
  gradientStart: string;
  gradientEnd: string;
  gradientDirection: string;
  backgroundImage: string;
  backgroundOpacity: number;
  backgroundSize: 'cover' | 'contain' | 'auto';
  backgroundPosition: string;
  
  // Shadow and effects
  textShadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
}

const defaultSettings: DisplaySettings = {
  fontSize: 24,
  fontFamily: 'Arial',
  fontWeight: 'normal',
  textColor: '#ffffff',
  strokeWidth: 0,
  strokeColor: '#000000',
  lineHeight: 1.5,
  letterSpacing: 0,
  textAlign: 'center',
  
  backgroundEnabled: false,
  backgroundType: 'color',
  backgroundColor: '#000000',
  gradientStart: '#000000',
  gradientEnd: '#333333',
  gradientDirection: 'to bottom',
  backgroundImage: '',
  backgroundOpacity: 100,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  
  textShadow: false,
  shadowColor: '#000000',
  shadowBlur: 4,
  shadowOffsetX: 2,
  shadowOffsetY: 2,
};

export function loadDisplaySettings(urlType: string): DisplaySettings {
  try {
    const saved = localStorage.getItem(`display-settings-${urlType}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultSettings, ...parsed };
    }
  } catch (error) {
    console.error('Failed to load display settings:', error);
  }
  return defaultSettings;
}

export function getDisplayStyle(settings: DisplaySettings): React.CSSProperties {
  const style: React.CSSProperties = {
    fontSize: `${settings.fontSize}px`,
    fontFamily: settings.fontFamily,
    fontWeight: settings.fontWeight,
    color: settings.textColor,
    lineHeight: settings.lineHeight,
    letterSpacing: `${settings.letterSpacing}px`,
    textAlign: settings.textAlign,
  };

  // Text stroke
  if (settings.strokeWidth > 0) {
    style.WebkitTextStroke = `${settings.strokeWidth}px ${settings.strokeColor}`;
  }

  // Text shadow
  if (settings.textShadow) {
    style.textShadow = `${settings.shadowOffsetX}px ${settings.shadowOffsetY}px ${settings.shadowBlur}px ${settings.shadowColor}`;
  }

  return style;
}

export function getBackgroundStyle(settings: DisplaySettings): React.CSSProperties {
  const style: React.CSSProperties = {};

  if (settings.backgroundEnabled) {
    switch (settings.backgroundType) {
      case 'color':
        style.backgroundColor = settings.backgroundColor;
        break;
      case 'gradient':
        style.background = `linear-gradient(${settings.gradientDirection}, ${settings.gradientStart}, ${settings.gradientEnd})`;
        break;
      case 'image':
        if (settings.backgroundImage) {
          style.backgroundImage = `url(${settings.backgroundImage})`;
          style.backgroundSize = settings.backgroundSize;
          style.backgroundPosition = settings.backgroundPosition;
          style.backgroundRepeat = 'no-repeat';
        }
        break;
    }
    
    if (settings.backgroundOpacity < 100) {
      style.opacity = settings.backgroundOpacity / 100;
    }
  }

  return style;
}