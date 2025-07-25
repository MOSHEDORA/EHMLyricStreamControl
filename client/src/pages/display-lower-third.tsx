import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { Session } from "@shared/schema";

// Helper function to get lower-third-specific settings
function getLowerThirdSettings(session: Session) {
  if (session.separateDisplaySettings) {
    return {
      displayLines: session.lowerThirdDisplayLines,
      fontSize: session.lowerThirdFontSize,
      fontFamily: session.lowerThirdFontFamily,
      textColor: session.lowerThirdTextColor,
      textAlign: session.lowerThirdTextAlign,
      showBackground: session.lowerThirdShowBackground,
      backgroundColor: session.lowerThirdBackgroundColor,
      backgroundOpacity: session.lowerThirdBackgroundOpacity,
    };
  }
  return {
    displayLines: session.displayLines,
    fontSize: session.fontSize,
    fontFamily: session.fontFamily,
    textColor: session.textColor,
    textAlign: session.textAlign,
    showBackground: session.showBackground,
    backgroundColor: session.backgroundColor,
    backgroundOpacity: session.backgroundOpacity,
  };
}

export default function DisplayLowerThird() {
  const sessionId = "default";
  const { session, lyricsArray } = useWebSocket(sessionId);
  const [currentDisplayLines, setCurrentDisplayLines] = useState<string[]>([]);

  // Update display lines when session or lyrics change
  useEffect(() => {
    if (!session || !lyricsArray.length) {
      setCurrentDisplayLines([]);
      return;
    }
    
    const settings = getLowerThirdSettings(session);
    const startLine = session.currentLine;
    const endLine = Math.min(startLine + settings.displayLines, lyricsArray.length);
    const lines = lyricsArray.slice(startLine, endLine);
    setCurrentDisplayLines(lines);
  }, [session, lyricsArray]);

  if (!session) {
    return (
      <div className="min-h-screen bg-transparent flex items-end justify-center pb-16">
        <div className="text-white text-xl opacity-50">Connecting...</div>
      </div>
    );
  }

  const settings = getLowerThirdSettings(session);
  const backgroundStyle = settings.showBackground
    ? {
        backgroundColor: settings.backgroundColor,
        opacity: settings.backgroundOpacity / 100,
      }
    : {};

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      {/* Lower third positioning */}
      <div className="absolute bottom-0 left-0 right-0 pb-12 px-8">
        {/* Background overlay if enabled */}
        {settings.showBackground && (
          <div 
            className="absolute inset-0 rounded-lg"
            style={backgroundStyle}
          />
        )}
        
        {/* Main content */}
        <div className="relative z-10">
          <div 
            className="w-full"
            style={{ 
              textAlign: settings.textAlign as any,
            }}
          >
            {currentDisplayLines.length > 0 ? (
              <div className="space-y-2">
                {currentDisplayLines.map((line, index) => (
                  <div 
                    key={index}
                    className="transition-all duration-500 leading-tight drop-shadow-lg"
                    style={{
                      fontSize: `${settings.fontSize}px`,
                      fontFamily: settings.fontFamily,
                      color: settings.textColor,
                      opacity: index === 0 ? 1 : 0.9,
                      textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                    }}
                  >
                    {line}
                  </div>
                ))}
              </div>
            ) : (
              <div 
                className="text-gray-500 text-center opacity-50"
                style={{ 
                  fontSize: `${Math.max(settings.fontSize * 0.75, 24)}px`,
                  fontFamily: settings.fontFamily,
                  textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                }}
              >
                No lyrics loaded
              </div>
            )}
            
            {/* Song title in lower third style */}
            {session.songTitle && (
              <div 
                className="mt-3 text-gray-300 opacity-80"
                style={{ 
                  fontSize: `${Math.max(settings.fontSize * 0.4, 16)}px`,
                  fontFamily: settings.fontFamily,
                  textAlign: settings.textAlign as any,
                  textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                }}
              >
                {session.songTitle}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Corner indicator for OBS */}
      <div className="absolute top-4 right-4 bg-blue-600 text-white px-2 py-1 rounded text-xs font-mono opacity-75">
        LOWER THIRD
      </div>
      
      <div className="absolute bottom-4 left-4 text-gray-400 text-xs font-mono opacity-50">
        {settings.displayLines} Lines | {settings.fontSize}px | Line {session.currentLine + 1}/{lyricsArray.length}
      </div>
    </div>
  );
}