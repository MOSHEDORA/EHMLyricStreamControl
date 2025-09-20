import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";

export default function LyricsFullscreen() {
  const sessionId = "lyrics-fullscreen";
  const { session, lyricsArray } = useWebSocket(sessionId);
  const [currentDisplayLines, setCurrentDisplayLines] = useState<string[]>([]);
  // Default display settings
  const displaySettings = {
    fontSize: 32,
    fontFamily: 'Arial',
    textColor: '#ffffff',
    textAlign: 'center' as const,
    backgroundEnabled: false
  };

  // Default screen settings
  const screenSettings = {
    margins: 40
  };



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
    fontSize: `${displaySettings.fontSize}px`,
    fontFamily: displaySettings.fontFamily,
    color: displaySettings.textColor,
    textAlign: displaySettings.textAlign,
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">


      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div 
          className="w-full h-full"
          style={{ 
            padding: `${screenSettings.margins}px`,
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