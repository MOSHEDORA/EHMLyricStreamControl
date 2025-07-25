// Font detection utility to get locally installed fonts
export class FontDetector {
  private static instance: FontDetector;
  private detectedFonts: string[] = [];
  private isDetecting = false;

  static getInstance(): FontDetector {
    if (!FontDetector.instance) {
      FontDetector.instance = new FontDetector();
    }
    return FontDetector.instance;
  }

  // Common system fonts to test for
  private commonFonts = [
    'Arial', 'Arial Black', 'Arial Narrow', 'Arial Unicode MS',
    'Calibri', 'Cambria', 'Candara', 'Comic Sans MS', 'Consolas',
    'Constantia', 'Corbel', 'Courier New', 'Franklin Gothic Medium',
    'Garamond', 'Georgia', 'Helvetica', 'Helvetica Neue', 'Impact',
    'Lucida Console', 'Lucida Grande', 'Lucida Sans Unicode',
    'Microsoft Sans Serif', 'Palatino', 'Segoe UI', 'Tahoma',
    'Times', 'Times New Roman', 'Trebuchet MS', 'Verdana',
    // Google Fonts commonly installed
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro',
    'Raleway', 'PT Sans', 'Lora', 'Merriweather', 'Nunito',
    'Poppins', 'Playfair Display', 'Oswald', 'Crimson Text',
    'Droid Sans', 'Ubuntu', 'Fira Sans', 'Work Sans', 'Cabin',
    // Creative/Display fonts
    'Bebas Neue', 'Anton', 'Archivo Black', 'Barlow', 'Quicksand',
    'Righteous', 'Russo One', 'Yanone Kaffeesatz', 'Permanent Marker',
    'Creepster', 'Orbitron', 'Bungee', 'Lobster', 'Pacifico'
  ];

  // Test if a font is available by measuring text width
  private isFontAvailable(fontName: string): boolean {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return false;

    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';
    const baselineFont = 'monospace';

    // Measure baseline font
    context.font = `${testSize} ${baselineFont}`;
    const baselineWidth = context.measureText(testString).width;

    // Measure test font with fallback
    context.font = `${testSize} "${fontName}", ${baselineFont}`;
    const testWidth = context.measureText(testString).width;

    // If widths differ, the font is available
    return baselineWidth !== testWidth;
  }

  // Use Font Access API if available (Chrome 103+)
  private async detectFontsWithAPI(): Promise<string[]> {
    try {
      // @ts-ignore - Font Access API is experimental
      if ('queryLocalFonts' in window && typeof window.queryLocalFonts === 'function') {
        // @ts-ignore
        const fonts = await window.queryLocalFonts();
        return fonts.map((font: any) => font.family).filter((family: string, index: number, arr: string[]) => 
          arr.indexOf(family) === index // Remove duplicates
        ).sort();
      }
    } catch (error) {
      console.log('Font Access API not available or permission denied');
    }
    return [];
  }

  // Fallback detection using canvas text measurement
  private detectFontsWithCanvas(): string[] {
    const availableFonts: string[] = [];
    
    for (const font of this.commonFonts) {
      if (this.isFontAvailable(font)) {
        availableFonts.push(font);
      }
    }
    
    return availableFonts.sort();
  }

  // Main detection method
  async detectFonts(): Promise<string[]> {
    if (this.isDetecting) {
      return this.detectedFonts;
    }

    this.isDetecting = true;

    try {
      // Try Font Access API first
      let fonts = await this.detectFontsWithAPI();
      
      // Fallback to canvas detection
      if (fonts.length === 0) {
        fonts = this.detectFontsWithCanvas();
      }

      // Always include basic web-safe fonts
      const webSafeFonts = ['Arial', 'Georgia', 'Times New Roman', 'Helvetica', 'Verdana'];
      const allFonts = [...new Set([...webSafeFonts, ...fonts])].sort();

      this.detectedFonts = allFonts;
      return allFonts;
    } finally {
      this.isDetecting = false;
    }
  }

  // Get cached fonts if available
  getCachedFonts(): string[] {
    return this.detectedFonts;
  }

  // Clear cache and re-detect
  async refresh(): Promise<string[]> {
    this.detectedFonts = [];
    return this.detectFonts();
  }
}

// Hook for React components
import { useState, useEffect } from 'react';

export function useLocalFonts() {
  const [fonts, setFonts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detector = FontDetector.getInstance();
    
    // Check if we have cached fonts
    const cached = detector.getCachedFonts();
    if (cached.length > 0) {
      setFonts(cached);
      setIsLoading(false);
      return;
    }

    // Detect fonts
    detector.detectFonts()
      .then((detectedFonts) => {
        setFonts(detectedFonts);
        setError(null);
      })
      .catch((err) => {
        console.error('Font detection error:', err);
        setError('Failed to detect fonts');
        // Fallback to basic fonts
        setFonts(['Arial', 'Georgia', 'Times New Roman', 'Helvetica', 'Verdana']);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const detector = FontDetector.getInstance();
      const newFonts = await detector.refresh();
      setFonts(newFonts);
    } catch (err) {
      setError('Failed to refresh fonts');
    } finally {
      setIsLoading(false);
    }
  };

  return { fonts, isLoading, error, refresh };
}