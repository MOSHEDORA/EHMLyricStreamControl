import { useMemo } from 'react';
import { type Resolution } from '@/settings/resolution';

interface ScalerResult {
  canvasStyle: React.CSSProperties;
  wrapperStyle: React.CSSProperties;
  scale: number;
}

export function useResolutionScaler(resolution: Resolution): ScalerResult {
  return useMemo(() => {
    const { width, height, scaleMode } = resolution;
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate scale based on mode
    let scaleX = viewportWidth / width;
    let scaleY = viewportHeight / height;
    let scale: number;
    
    switch (scaleMode) {
      case 'fit':
        // Scale to fit entire canvas in viewport (letterbox/pillarbox if needed)
        scale = Math.min(scaleX, scaleY);
        break;
      case 'fill':
        // Scale to fill entire viewport (crop if needed)
        scale = Math.max(scaleX, scaleY);
        break;
      case 'stretch':
        // Stretch to viewport (may distort aspect ratio)
        scaleX = scaleX;
        scaleY = scaleY;
        scale = 1; // Use different X/Y transforms
        break;
      case '1:1':
        // No scaling - show at actual resolution
        scale = 1;
        break;
      default:
        scale = Math.min(scaleX, scaleY);
    }
    
    // Calculate canvas style - this is the inner container with exact resolution
    const canvasStyle: React.CSSProperties = {
      width: `${width}px`,
      height: `${height}px`,
      position: 'relative',
      overflow: 'hidden',
      transformOrigin: 'center',
      transform: scaleMode === 'stretch' 
        ? `scaleX(${scaleX}) scaleY(${scaleY})`
        : `scale(${scale})`,
    };
    
    // Calculate wrapper style - this centers the canvas in the viewport
    const wrapperStyle: React.CSSProperties = {
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000000', // Black letterbox/pillarbox
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
    };
    
    return {
      canvasStyle,
      wrapperStyle,
      scale: scaleMode === 'stretch' ? Math.min(scaleX, scaleY) : scale,
    };
  }, [resolution]);
}

// Hook to get responsive canvas dimensions for lower-third displays
export function useLowerThirdScaler(resolution: Resolution): ScalerResult {
  return useMemo(() => {
    const baseScaler = useResolutionScaler(resolution);
    
    // For lower third, we still want full viewport width but scaled height
    const lowerThirdStyle: React.CSSProperties = {
      ...baseScaler.canvasStyle,
      width: '100vw', // Full viewport width for lower third
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
    };
    
    return {
      ...baseScaler,
      canvasStyle: lowerThirdStyle,
    };
  }, [resolution]);
}