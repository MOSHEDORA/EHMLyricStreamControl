import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { loadDisplaySettings, getDisplayStyle, getBackgroundStyle } from "@/utils/display-settings";

export default function BibleFullscreen() {
  const sessionId = "bible-fullscreen";
  const { session, lyricsArray } = useWebSocket(sessionId);
  const [currentDisplayLines, setCurrentDisplayLines] = useState<string[]>([]);
  const [displaySettings, setDisplaySettings] = useState(() => 
    loadDisplaySettings('bible-fullscreen')
  );

  // Load display settings on mount and when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setDisplaySettings(loadDisplaySettings('bible-fullscreen'));
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

  // Hide display if bible output is disabled and no content is loaded
  if (!session.bibleOutputEnabled && currentDisplayLines.length === 0) {
    return null; // Completely hidden - no background
  }

  const textStyle = getDisplayStyle(displaySettings);
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

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div 
          className="w-full max-w-6xl"
          style={{ 
            textAlign: displaySettings.textAlign,
          }}
        >
          {currentDisplayLines.length > 0 ? (
            <div className="space-y-4">
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