// Resolution types and presets for display scaling
export interface Resolution {
  width: number;
  height: number;
  scaleMode: 'fit' | 'fill' | 'stretch' | '1:1';
  name: string;
}

export type DisplayType = 
  | 'lyrics:lower-third'
  | 'lyrics:fullscreen' 
  | 'bible:lower-third'
  | 'bible:fullscreen';

export const RESOLUTION_PRESETS: Record<string, Resolution> = {
  '720p': {
    width: 1280,
    height: 720,
    scaleMode: 'fit',
    name: 'HD (720p) - 1280x720'
  },
  '1080p': {
    width: 1920,
    height: 1080,
    scaleMode: 'fit',
    name: 'Full HD (1080p) - 1920x1080'
  },
  '1440p': {
    width: 2560,
    height: 1440,
    scaleMode: 'fit',
    name: 'QHD (1440p) - 2560x1440'
  },
  '4k': {
    width: 3840,
    height: 2160,
    scaleMode: 'fit',
    name: '4K UHD - 3840x2160'
  },
  'custom': {
    width: 1920,
    height: 1080,
    scaleMode: 'fit',
    name: 'Custom Resolution'
  }
};

export const DEFAULT_RESOLUTION: Resolution = RESOLUTION_PRESETS['1080p'];

export function createCustomResolution(width: number, height: number, scaleMode: Resolution['scaleMode'] = 'fit'): Resolution {
  return {
    width,
    height,
    scaleMode,
    name: `Custom - ${width}x${height}`
  };
}

export function getAspectRatio(resolution: Resolution): number {
  return resolution.width / resolution.height;
}

export function isPortrait(resolution: Resolution): boolean {
  return resolution.height > resolution.width;
}

export function isLandscape(resolution: Resolution): boolean {
  return resolution.width > resolution.height;
}