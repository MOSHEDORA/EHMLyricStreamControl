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
  const [calculatedFontSize, setCalculatedFontSize] = useState(baseFontSize);
  const [isVisible, setIsVisible] = useState(false);

  const calculateOptimalFontSize = useCallback(() => {
    if (!containerRef.current || lines.length === 0) {
      return baseFontSize;
    }

    const container = containerRef.current;
    const containerWidth = container.clientWidth - (padding * 2);
    const containerHeight = container.clientHeight - (padding * 2);
    
    console.log('Dynamic Text Debug:', {
      containerWidth,
      containerHeight,
      lines: lines.length,
      linesContent: lines
    });
    
    if (containerWidth <= 0 || containerHeight <= 0) {
      console.log('Container dimensions invalid:', { containerWidth, containerHeight });
      return baseFontSize;
    }

    // Create temporary measurement element
    const measureEl = document.createElement('div');
    measureEl.style.position = 'fixed';
    measureEl.style.top = '-9999px';
    measureEl.style.left = '-9999px';
    measureEl.style.visibility = 'hidden';
    measureEl.style.whiteSpace = 'normal';
    measureEl.style.width = `${containerWidth}px`;
    measureEl.style.fontFamily = fontFamily;
    measureEl.style.fontWeight = fontWeight;
    measureEl.style.color = 'transparent';
    document.body.appendChild(measureEl);

    let optimalSize = baseFontSize;

    try {
      // Binary search for optimal font size
      let low = minFontSize;
      let high = maxFontSize;

      while (low <= high) {
        const testSize = Math.floor((low + high) / 2);
        
        // Apply test font size
        measureEl.style.fontSize = `${testSize}px`;
        measureEl.style.lineHeight = `${lineHeight}`;
        
        // Clear and populate with plain text lines
        measureEl.innerHTML = '';
        let totalHeight = 0;
        let maxWidth = 0;

        lines.forEach((line, index) => {
          const lineEl = document.createElement('div');
          lineEl.style.display = 'block';
          lineEl.style.margin = '0';
          lineEl.style.padding = '0';
          
          // Check if this line has a verse number and render accordingly
          const verseMatch = line.match(/^(\d+)\.\s*(.+)/);
          if (verseMatch) {
            // Create verse number span (bold with margin)
            const verseNumSpan = document.createElement('span');
            verseNumSpan.textContent = verseMatch[1] + '.';
            verseNumSpan.style.fontWeight = 'bold';
            verseNumSpan.style.marginRight = '0.5rem'; // equivalent to mr-2
            
            // Create verse text span
            const verseTextSpan = document.createElement('span');
            verseTextSpan.textContent = verseMatch[2];
            
            lineEl.appendChild(verseNumSpan);
            lineEl.appendChild(verseTextSpan);
          } else {
            // Regular line without verse number
            lineEl.textContent = line;
          }
          
          measureEl.appendChild(lineEl);
          
          // Force layout and measure
          const rect = lineEl.getBoundingClientRect();
          maxWidth = Math.max(maxWidth, rect.width);
          totalHeight += rect.height;
          
          // Add spacing between lines (except for last line)
          if (index < lines.length - 1) {
            totalHeight += spacing;
          }
        });

        // Check if text fits within container
        const fitsWidth = maxWidth <= containerWidth;
        const fitsHeight = totalHeight <= containerHeight;

        console.log(`Font size ${testSize}: maxWidth=${maxWidth}, totalHeight=${totalHeight}, fitsWidth=${fitsWidth}, fitsHeight=${fitsHeight}`);

        if (fitsWidth && fitsHeight) {
          optimalSize = testSize;
          low = testSize + 1; // Try larger size
        } else {
          high = testSize - 1; // Try smaller size
        }
      }
    } finally {
      document.body.removeChild(measureEl);
    }

    const finalSize = Math.max(minFontSize, Math.min(maxFontSize, optimalSize));
    console.log('Final font size calculated:', finalSize, 'from optimalSize:', optimalSize);
    return finalSize;
  }, [lines, baseFontSize, minFontSize, maxFontSize, lineHeight, fontFamily, fontWeight, padding, spacing]);

  const updateFontSize = useCallback(() => {
    const newSize = calculateOptimalFontSize();
    setCalculatedFontSize(newSize);
    setIsVisible(true);
  }, [calculateOptimalFontSize]);

  // Debounced update function to avoid excessive calculations
  const debouncedUpdateRef = useRef<ReturnType<typeof setTimeout>>();
  const debouncedUpdate = useCallback(() => {
    if (debouncedUpdateRef.current) {
      clearTimeout(debouncedUpdateRef.current);
    }
    debouncedUpdateRef.current = setTimeout(updateFontSize, 100);
  }, [updateFontSize]);

  // Use ResizeObserver to respond to container size changes with debouncing
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      debouncedUpdate();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (debouncedUpdateRef.current) {
        clearTimeout(debouncedUpdateRef.current);
      }
    };
  }, [debouncedUpdate]);

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

      {/* Measurement is now handled dynamically in calculateOptimalFontSize */}
    </div>
  );
}