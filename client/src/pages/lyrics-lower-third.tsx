import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { loadDisplaySettings, getDisplayStyle, getBackgroundStyle } from "@/utils/display-settings";

export default function LyricsLowerThird() {
  const sessionId = "lyrics-lower-third";
  const { session, lyricsArray } = useWebSocket(sessionId);
  const [currentDisplayLines, setCurrentDisplayLines] = useState<string[]>([]);
  const [displaySettings, setDisplaySettings] = useState(() => 
    loadDisplaySettings('lyrics-lower-third')
  );

  // Load display settings on mount and when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setDisplaySettings(loadDisplaySettings('lyrics-lower-third'));
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

    const startLine = session.currentLine;
    const endLine = Math.min(startLine + session.displayLines, lyricsArray.length);
    const lines = lyricsArray.slice(startLine, endLine);
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

  const textStyle = getDisplayStyle(displaySettings);
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

      {/* Lower third positioned content */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-8">
        <div 
          className="w-full max-w-6xl mx-auto"
          style={{ 
            textAlign: displaySettings.textAlign,
          }}
        >
          {currentDisplayLines.length > 0 ? (
            <div className="space-y-2">
              {currentDisplayLines.map((line, index) => (
                <div 
                  key={index}
                  className="transition-all duration-500"
                  style={{
                    ...textStyle,
                    lineHeight: displaySettings.lineHeight,
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