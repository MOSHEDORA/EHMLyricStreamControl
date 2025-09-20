import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";

export default function LyricsFullscreen() {
  const sessionId = "lyrics-fullscreen";
  const { session, lyricsArray } = useWebSocket(sessionId);
  const [currentDisplayLines, setCurrentDisplayLines] = useState<string[]>([]);
  // Hardcoded settings
  const settings = {
    displayLines: 4,
    fontSize: 48,
    fontFamily: 'Arial',
    textColor: '#ffffff',
    textAlign: 'center' as const,
    lineHeight: 1.3,
    fontWeight: 'normal' as const,
    textTransform: 'none' as const,
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    padding: 40,
    margin: 40
  };

  // Update display lines when session or lyrics change - following Lyrics to Display rule
  useEffect(() => {
    if (!session || !lyricsArray.length) {
      setCurrentDisplayLines([]);
      return;
    }

    // Implement proper Lyrics to Display rule with control group logic
    const controlGroup = settings.displayLines;
    const groupIndex = Math.floor(session.currentLine / controlGroup);
    const start = groupIndex * controlGroup;
    
    // Use fullscreen-specific count
    const variantCount = settings.displayLines;
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

  // Hide display if no content is loaded
  if (currentDisplayLines.length === 0) {
    return null; // Completely hidden - no background
  }

  const textStyle = {
    fontSize: `${settings.fontSize}px`,
    fontFamily: settings.fontFamily,
    color: settings.textColor,
    textAlign: settings.textAlign,
    lineHeight: settings.lineHeight,
    fontWeight: settings.fontWeight,
    textTransform: settings.textTransform,
    textShadow: settings.textShadow,
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div 
          className="w-full h-full"
          style={{ 
            padding: `${settings.padding}px`,
            margin: `${settings.margin}px`,
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