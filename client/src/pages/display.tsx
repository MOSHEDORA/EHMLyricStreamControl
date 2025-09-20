import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { defaultDisplaySettings } from "@/settings/display-settings";

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
    const settings = defaultDisplaySettings;
    const endLine = Math.min(startLine + settings.displayLines, lyricsArray.length);
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

  // Hide display if no content is loaded
  if (currentDisplayLines.length === 0) {
    return null; // Completely hidden - no background
  }

  const settings = defaultDisplaySettings;
  const backgroundStyle = settings.showBackground
    ? {
        backgroundColor: settings.backgroundColor,
        opacity: settings.backgroundOpacity / 100,
      }
    : {};

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background overlay if enabled */}
      {settings.showBackground && (
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
            textAlign: settings.textAlign,
            fontSize: `${settings.fontSize}px`,
            fontFamily: settings.fontFamily,
            color: settings.textColor,
            lineHeight: settings.lineHeight,
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
                    className="transition-all duration-500 leading-relaxed"
                    style={{
                      fontSize: `${settings.fontSize}px`,
                      fontFamily: settings.fontFamily,
                      color: settings.textColor,
                      opacity: index === 0 ? 1 : 0.8,
                      transform: index === 0 ? 'scale(1.02)' : 'scale(1)',
                      textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                    }}
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