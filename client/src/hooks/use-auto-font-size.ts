import { useState, useEffect, useRef, useCallback } from 'react';
import { useScreenSettings } from './use-screen-settings';
import { getContentArea } from '@/utils/screen-settings';

interface UseAutoFontSizeProps {
  lines: string[];
  baseStyles: React.CSSProperties;
  isLowerThird?: boolean;
  enabled?: boolean;
}

export function useAutoFontSize({
  lines,
  baseStyles,
  isLowerThird = false,
  enabled = true,
}: UseAutoFontSizeProps) {
  const { settings } = useScreenSettings();
  const [fontSize, setFontSize] = useState(baseStyles.fontSize || 32);
  const [isCalculating, setIsCalculating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  // Throttle function to prevent excessive calculations
  const throttle = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    let lastExecTime = 0;
    return (...args: any[]) => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }, []);

  // Binary search to find optimal font size
  const calculateOptimalFontSize = useCallback(() => {
    if (!enabled || !settings.autoSizeEnabled || !containerRef.current || !measureRef.current || lines.length === 0) {
      setFontSize(baseStyles.fontSize as number || 32);
      return;
    }

    setIsCalculating(true);

    const container = containerRef.current;
    const measurer = measureRef.current;
    
    // Use actual container dimensions instead of preset dimensions
    const containerRect = container.getBoundingClientRect();
    const margins = settings.margins;
    
    // Calculate available area based on actual container size
    const contentArea = {
      width: Math.max(100, containerRect.width - (margins * 2)),
      height: Math.max(50, containerRect.height - (margins * 2)),
    };

    let low = settings.minFontSize;
    let high = settings.maxFontSize;
    let optimalSize = low;

    // Binary search for optimal font size
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      
      // Apply test font size to measurer
      measurer.style.fontSize = `${mid}px`;
      measurer.style.lineHeight = baseStyles.lineHeight as string || '1.2';
      measurer.style.fontFamily = baseStyles.fontFamily as string || 'Arial';
      measurer.style.fontWeight = baseStyles.fontWeight as string || 'normal';
      measurer.style.width = `${contentArea.width}px`;
      
      // Clear and add test content
      measurer.innerHTML = '';
      lines.forEach((line, index) => {
        const lineDiv = document.createElement('div');
        lineDiv.textContent = line;
        lineDiv.style.marginBottom = index < lines.length - 1 ? '0.5em' : '0';
        measurer.appendChild(lineDiv);
      });

      const measuredHeight = measurer.scrollHeight;
      const measuredWidth = measurer.scrollWidth;

      // Check if content fits within the available area with some padding
      const fitsWidth = measuredWidth <= contentArea.width;
      const fitsHeight = measuredHeight <= contentArea.height;
      
      if (fitsWidth && fitsHeight) {
        optimalSize = mid;
        low = mid + 1; // Try larger size
      } else {
        high = mid - 1; // Try smaller size
      }
    }

    setFontSize(optimalSize);
    setIsCalculating(false);
  }, [enabled, settings, lines, baseStyles, isLowerThird]);

  // Throttled version of the calculation
  const throttledCalculate = useCallback(
    throttle(calculateOptimalFontSize, 100),
    [calculateOptimalFontSize]
  );

  // Recalculate when dependencies change
  useEffect(() => {
    throttledCalculate();
  }, [throttledCalculate, lines, settings, baseStyles, enabled]);

  // ResizeObserver for container size changes
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      throttledCalculate();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [throttledCalculate]);

  // Return the calculated font size or fall back to base style
  const finalFontSize = enabled && settings.autoSizeEnabled ? fontSize : (baseStyles.fontSize as number || 32);

  return {
    containerRef,
    measureRef,
    fontSize: finalFontSize,
    isCalculating,
    autoSizeEnabled: enabled && settings.autoSizeEnabled,
  };
}