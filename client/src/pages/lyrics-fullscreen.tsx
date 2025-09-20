import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useAutoFontSize } from "@/hooks/use-auto-font-size";
import { useScreenSettings } from "@/hooks/use-screen-settings";
import { loadDisplaySettings, getDisplayStyle, getBackgroundStyle } from "@/utils/display-settings";

export default function LyricsFullscreen() {
  const sessionId = "default";
  const { session, lyricsArray } = useWebSocket(sessionId);
  const [currentDisplayLines, setCurrentDisplayLines] = useState<string[]>([]);
  const [displaySettings, setDisplaySettings] = useState(() => 
    loadDisplaySettings('lyrics-fullscreen')
  );

  // Screen settings for auto-sizing
  const { settings: screenSettings } = useScreenSettings();

  // Auto font sizing
  const baseStyle = getDisplayStyle(displaySettings);
  const { containerRef, measureRef, fontSize, autoSizeEnabled } = useAutoFontSize({
    lines: currentDisplayLines,
    baseStyles: baseStyle,
    isLowerThird: false,
    enabled: true,
  });

  // Load display settings on mount and when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setDisplaySettings(loadDisplaySettings('lyrics-fullscreen'));
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update display lines when session or lyrics change - following Lyrics to Display rule
  useEffect(() => {
    if (!session || !lyricsArray.length) {
      setCurrentDisplayLines([]);
      return;
    }

    // Implement proper Lyrics to Display rule with control group logic
    const controlGroup = session.displayLines;
    const groupIndex = Math.floor(session.currentLine / controlGroup);
    const start = groupIndex * controlGroup;
    
    // Use fullscreen-specific count if separate display settings are enabled
    const variantCount = session.separateDisplaySettings ? session.fullscreenDisplayLines : controlGroup;
    const end = Math.min(start + variantCount, lyricsArray.length);
    
    const lines = lyricsArray.slice(start, end);
    setCurrentDisplayLines(lines);
  }, [session, lyricsArray]);

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Connecting...</div>
      </div>
    );
  }

  // Hide display if lyrics output is disabled and no content is loaded
  if (!session.lyricsOutputEnabled && currentDisplayLines.length === 0) {
    return null; // Completely hidden - no background
  }

  const textStyle = {
    ...getDisplayStyle(displaySettings),
    fontSize: autoSizeEnabled ? fontSize : getDisplayStyle(displaySettings).fontSize,
  };
  const backgroundStyle = getBackgroundStyle(displaySettings);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
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

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div 
          ref={containerRef}
          className="w-full h-full"
          style={{ 
            padding: `${screenSettings.margins || 40}px`,
          }}
        >
          {currentDisplayLines.length > 0 ? (
            <div className="space-y-4">
              {currentDisplayLines.map((line, index) => (
                <div 
                  key={index}
                  className="transition-all duration-500"
                  style={{
                    ...textStyle,
                    opacity: index === 0 ? 1 : 0.8,
                    transform: index === 0 ? 'scale(1.02)' : 'scale(1)',
                  }}
                  data-testid={`text-lyrics-line-${index}`}
                >
                  {line}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}