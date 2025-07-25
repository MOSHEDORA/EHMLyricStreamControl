import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { Session } from "@shared/schema";

// Helper function to get fullscreen-specific settings
function getFullscreenSettings(session: Session) {
  if (session.separateDisplaySettings) {
    return {
      displayLines: session.fullscreenDisplayLines,
      fontSize: session.fullscreenFontSize,
      fontFamily: session.fullscreenFontFamily,
      textColor: session.fullscreenTextColor,
      textAlign: session.fullscreenTextAlign,
      showBackground: session.fullscreenShowBackground,
      backgroundColor: session.fullscreenBackgroundColor,
      backgroundOpacity: session.fullscreenBackgroundOpacity,
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

export default function DisplayFullscreen() {
  const sessionId = "default";
  const { session, lyricsArray } = useWebSocket(sessionId);
  const [currentDisplayLines, setCurrentDisplayLines] = useState<string[]>([]);

  // Update display lines when session or lyrics change
  useEffect(() => {
    if (!session || !lyricsArray.length) {
      setCurrentDisplayLines([]);
      return;
    }
    
    const settings = getFullscreenSettings(session);
    const startLine = session.currentLine;
    const endLine = Math.min(startLine + settings.displayLines, lyricsArray.length);
    const lines = lyricsArray.slice(startLine, endLine);
    setCurrentDisplayLines(lines);
  }, [session, lyricsArray]);

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-4xl">Connecting...</div>
      </div>
    );
  }

  const settings = getFullscreenSettings(session);
  const backgroundStyle = settings.showBackground
    ? {
        backgroundColor: settings.backgroundColor,
        opacity: settings.backgroundOpacity / 100,
      }
    : {};

  // Scale font size for fullscreen display
  const fullscreenFontSize = Math.max(settings.fontSize * 1.5, 48);
  const titleFontSize = Math.max(settings.fontSize * 0.8, 32);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background overlay if enabled */}
      {settings.showBackground && (
        <div 
          className="absolute inset-0"
          style={backgroundStyle}
        />
      )}
      
      {/* Main content centered for fullscreen - use almost full width */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        {/* Song title at top for fullscreen */}
        {session.songTitle && (
          <div 
            className="mb-12 text-gray-300 text-center"
            style={{ 
              fontSize: `${titleFontSize}px`,
              fontFamily: settings.fontFamily,
              textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
            }}
          >
            {session.songTitle}
          </div>
        )}

        <div 
          className="w-full max-w-full px-4"
          style={{ 
            textAlign: settings.textAlign as any,
          }}
        >
          {currentDisplayLines.length > 0 ? (
            <div className="space-y-6">
              {currentDisplayLines.map((line, index) => (
                <div 
                  key={index}
                  className="transition-all duration-500 leading-relaxed"
                  style={{
                    fontSize: `${fullscreenFontSize}px`,
                    fontFamily: settings.fontFamily,
                    color: settings.textColor,
                    opacity: index === 0 ? 1 : 0.85,
                    transform: index === 0 ? 'scale(1.05)' : 'scale(1)',
                    textShadow: "3px 3px 6px rgba(0,0,0,0.8)",
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          ) : (
            <div 
              className="text-gray-500 text-center"
              style={{ 
                fontSize: `${Math.max(fullscreenFontSize * 0.75, 36)}px`,
                fontFamily: settings.fontFamily,
                textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
              }}
            >
              No lyrics loaded
            </div>
          )}
        </div>

        {/* Progress indicator for fullscreen */}
        <div className="mt-12 w-full max-w-md">
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${((session.currentLine + 1) / lyricsArray.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-gray-400 text-sm mt-2">
            <span>Line {session.currentLine + 1}</span>
            <span>{lyricsArray.length} total</span>
          </div>
        </div>
      </div>

      {/* Corner indicators for fullscreen */}
      <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-2 rounded text-sm font-mono">
        FULLSCREEN TV
      </div>
      
      <div className="absolute bottom-4 left-4 text-gray-500 text-sm font-mono">
        {session.displayLines} Lines | {fullscreenFontSize}px | {session.fontFamily}
      </div>
    </div>
  );
}