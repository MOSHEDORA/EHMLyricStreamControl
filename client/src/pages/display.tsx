import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";

export default function Display() {
  const sessionId = "default";
  const { session, lyricsArray } = useWebSocket(sessionId);
  const [currentDisplayLines, setCurrentDisplayLines] = useState<string[]>([]);

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
        <div className="text-white text-2xl">Connecting...</div>
      </div>
    );
  }

  const backgroundStyle = session.showBackground
    ? {
        backgroundColor: session.backgroundColor,
        opacity: session.backgroundOpacity / 100,
      }
    : {};

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background overlay if enabled */}
      {session.showBackground && (
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
            textAlign: session.textAlign as any,
          }}
        >
          {currentDisplayLines.length > 0 ? (
            <div className="space-y-4">
              {currentDisplayLines.map((line, index) => (
                <div 
                  key={index}
                  className="transition-all duration-500 leading-relaxed"
                  style={{
                    fontSize: `${session.fontSize}px`,
                    fontFamily: session.fontFamily,
                    color: session.textColor,
                    opacity: index === 0 ? 1 : 0.8,
                    transform: index === 0 ? 'scale(1.02)' : 'scale(1)',
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
                fontSize: `${Math.max(session.fontSize * 0.75, 24)}px`,
                fontFamily: session.fontFamily,
              }}
            >
              No lyrics loaded
            </div>
          )}
          
          {/* Song title */}
          {session.songTitle && (
            <div 
              className="mt-12 text-gray-400 text-center"
              style={{ 
                fontSize: `${Math.max(session.fontSize * 0.5, 18)}px`,
                fontFamily: session.fontFamily,
              }}
            >
              {session.songTitle}
            </div>
          )}
        </div>
      </div>

      {/* Corner indicators for OBS */}
      <div className="absolute top-4 right-4 bg-red-600 text-white px-2 py-1 rounded text-xs font-mono">
        LIVE
      </div>
      
      <div className="absolute bottom-4 left-4 text-gray-500 text-xs font-mono">
        {session.displayLines} Lines | {session.fontSize}px | Line {session.currentLine + 1}/{lyricsArray.length}
      </div>
    </div>
  );
}
