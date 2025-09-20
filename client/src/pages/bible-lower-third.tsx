import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useAutoFontSize } from "@/hooks/use-auto-font-size";
import { useScreenSettings } from "@/hooks/use-screen-settings";
import { loadDisplaySettings, getDisplayStyle, getBackgroundStyle } from "@/utils/display-settings";

export default function BibleLowerThird() {
  const sessionId = "default";
  const { session, lyricsArray } = useWebSocket(sessionId);
  const [currentDisplayLines, setCurrentDisplayLines] = useState<string[]>([]);
  const [displaySettings, setDisplaySettings] = useState(() => 
    loadDisplaySettings('bible-lower-third')
  );

  // Screen settings for auto-sizing
  const { settings: screenSettings } = useScreenSettings();

  // Auto font sizing for lower third
  const baseStyle = getDisplayStyle(displaySettings);
  const { containerRef, measureRef, fontSize, autoSizeEnabled } = useAutoFontSize({
    lines: currentDisplayLines,
    baseStyles: baseStyle,
    isLowerThird: true,
    enabled: true,
  });

  // Load display settings on mount and when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setDisplaySettings(loadDisplaySettings('bible-lower-third'));
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update display lines when session or lyrics change
  useEffect(() => {
    if (!session || !lyricsArray.length) {
      setCurrentDisplayLines([]);
      return;
    }

    // Check if content looks like Bible verses (starts with number followed by period)
    const isBibleContent = lyricsArray.some(line => /^\d+\.\s/.test(line));
    
    if (isBibleContent) {
      // For Bible content, show all lines to display the complete verse
      setCurrentDisplayLines(lyricsArray);
    } else {
      // For lyrics content, use the displayLines setting
      const startLine = session.currentLine;
      const endLine = Math.min(startLine + session.displayLines, lyricsArray.length);
      const lines = lyricsArray.slice(startLine, endLine);
      setCurrentDisplayLines(lines);
    }
  }, [session, lyricsArray]);

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Connecting...</div>
      </div>
    );
  }

  // Hide display if bible output is disabled and no content is loaded
  if (!session.bibleOutputEnabled && currentDisplayLines.length === 0) {
    return null; // Completely hidden - no background
  }

  const textStyle = {
    ...getDisplayStyle(displaySettings),
    fontSize: autoSizeEnabled ? fontSize : getDisplayStyle(displaySettings).fontSize,
  };
  const backgroundStyle = getBackgroundStyle(displaySettings);

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      {/* Background overlay if enabled */}
      {displaySettings.backgroundEnabled && (
        <div 
          className="absolute inset-0"
          style={backgroundStyle}
        />
      )}

      {/* Hidden measurer for auto-sizing */}
      <div
        ref={measureRef}
        className="absolute -top-full left-0 opacity-0 pointer-events-none whitespace-pre-wrap"
        style={{
          visibility: 'hidden',
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
        }}
      />

      {/* Lower third positioned content */}
      <div 
        className="absolute bottom-0 left-0 right-0 z-10"
        style={{
          height: `${screenSettings.lowerThirdHeightPercent || 25}%`,
        }}
      >
        <div 
          ref={containerRef}
          className="w-full h-full"
          style={{ 
            textAlign: displaySettings.textAlign,
            padding: `${screenSettings.margins || 40}px`,
          }}
        >
          {currentDisplayLines.length > 0 ? (
            <div className="space-y-2">
              {currentDisplayLines.map((line, index) => {
                // Check if this looks like a Bible verse (starts with number)
                const verseMatch = line.match(/^(\d+)\.\s*(.+)/);
                const isBibleVerse = !!verseMatch;

                return (
                  <div 
                    key={index}
                    className="transition-all duration-500"
                    style={{
                      ...textStyle,
                      lineHeight: displaySettings.lineHeight,
                      opacity: index === 0 ? 1 : 0.8,
                      transform: index === 0 ? 'scale(1.02)' : 'scale(1)',
                    }}
                    data-testid={`text-bible-verse-${index}`}
                  >
                    {isBibleVerse ? (
                      <>
                        <span className="text-yellow-300 font-bold mr-2">{verseMatch![1]}.</span>
                        <span>{verseMatch![2]}</span>
                      </>
                    ) : (
                      line
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}