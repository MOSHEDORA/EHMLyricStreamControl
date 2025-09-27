import { useEffect, useRef, useState, useCallback } from "react";

interface DynamicTextProps {
  lines: string[];
  className?: string;
  style?: React.CSSProperties;
  baseFontSize?: number;
  minFontSize?: number;
  maxFontSize?: number;
  lineHeight?: number;
  fontFamily?: string;
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontWeight?: string;
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
  textShadow?: string;
  padding?: number;
  spacing?: number;
  renderLine?: (line: string, index: number, fontSize: number) => React.ReactNode;
  testId?: string;
}

export function DynamicText({
  lines,
  className = "",
  style = {},
  baseFontSize = 48,
  minFontSize = 16,
  maxFontSize = 120,
  lineHeight = 1.2,
  fontFamily = 'inherit',
  textColor = '#ffffff',
  textAlign = 'center',
  fontWeight = 'normal',
  textTransform = 'none',
  textShadow,
  padding = 0,
  spacing = 8,
  renderLine,
  testId = 'dynamic-text'
}: DynamicTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [calculatedFontSize, setCalculatedFontSize] = useState(baseFontSize);
  const [isVisible, setIsVisible] = useState(false);

  const calculateOptimalFontSize = useCallback(() => {
    if (!containerRef.current || !measureRef.current || lines.length === 0) {
      return baseFontSize;
    }

    const container = containerRef.current;
    const containerWidth = container.clientWidth - (padding * 2);
    const containerHeight = container.clientHeight - (padding * 2);
    
    if (containerWidth <= 0 || containerHeight <= 0) {
      return baseFontSize;
    }

    // Binary search for optimal font size
    let low = minFontSize;
    let high = maxFontSize;
    let optimalSize = baseFontSize;

    while (low <= high) {
      const testSize = Math.floor((low + high) / 2);
      
      // Apply test font size to measure element
      measureRef.current.style.fontSize = `${testSize}px`;
      measureRef.current.style.lineHeight = `${lineHeight}`;
      measureRef.current.style.fontFamily = fontFamily;
      measureRef.current.style.fontWeight = fontWeight;
      
      // Calculate required dimensions
      const lineElements = measureRef.current.children;
      let maxWidth = 0;
      let totalHeight = 0;

      for (let i = 0; i < lineElements.length; i++) {
        const element = lineElements[i] as HTMLElement;
        const rect = element.getBoundingClientRect();
        maxWidth = Math.max(maxWidth, rect.width);
        totalHeight += rect.height;
        
        // Add spacing between lines (except for last line)
        if (i < lineElements.length - 1) {
          totalHeight += spacing;
        }
      }

      // Check if text fits within container
      const fitsWidth = maxWidth <= containerWidth;
      const fitsHeight = totalHeight <= containerHeight;

      if (fitsWidth && fitsHeight) {
        optimalSize = testSize;
        low = testSize + 1; // Try larger size
      } else {
        high = testSize - 1; // Try smaller size
      }
    }

    return Math.max(minFontSize, Math.min(maxFontSize, optimalSize));
  }, [lines, baseFontSize, minFontSize, maxFontSize, lineHeight, fontFamily, fontWeight, padding, spacing]);

  const updateFontSize = useCallback(() => {
    const newSize = calculateOptimalFontSize();
    setCalculatedFontSize(newSize);
    setIsVisible(true);
  }, [calculateOptimalFontSize]);

  // Use ResizeObserver to respond to container size changes
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      updateFontSize();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateFontSize]);

  // Update font size when lines change
  useEffect(() => {
    updateFontSize();
  }, [lines, updateFontSize]);

  // Initialize on mount
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(updateFontSize, 50);
    return () => clearTimeout(timer);
  }, []);

  const textStyle: React.CSSProperties = {
    fontSize: `${calculatedFontSize}px`,
    lineHeight,
    fontFamily,
    color: textColor,
    textAlign,
    fontWeight,
    textTransform,
    textShadow,
    transition: 'font-size 0.3s ease-in-out, opacity 0.3s ease-in-out',
    opacity: isVisible ? 1 : 0,
    padding: `${padding}px`,
    ...style
  };

  if (lines.length === 0) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full ${className}`}
      style={{ position: 'relative' }}
    >
      {/* Visible content */}
      <div 
        className="w-full h-full flex flex-col justify-center items-center"
        style={{ gap: `${spacing}px` }}
      >
        {lines.map((line, index) => (
          <div 
            key={index}
            style={textStyle}
            data-testid={`${testId}-line-${index}`}
          >
            {renderLine ? renderLine(line, index, calculatedFontSize) : line}
          </div>
        ))}
      </div>

      {/* Hidden measurement element */}
      <div
        ref={measureRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          visibility: 'hidden',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        {lines.map((line, index) => (
          <div key={index}>
            {renderLine ? renderLine(line, index, calculatedFontSize) : line}
          </div>
        ))}
      </div>
    </div>
  );
}