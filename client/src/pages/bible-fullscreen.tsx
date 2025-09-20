import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { defaultBibleFullscreenSettings } from "@/settings/bible-fullscreen-settings";

export default function BibleFullscreen() {
  const sessionId = "bible-fullscreen";
  const { session, lyricsArray } = useWebSocket(sessionId);
  const [currentDisplayLines, setCurrentDisplayLines] = useState<string[]>([]);
  // URL-specific settings
  const settings = defaultBibleFullscreenSettings;



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
      // For lyrics content, use the settings displayLines
      const startLine = session.currentLine;
      const endLine = Math.min(startLine + settings.versesPerScreen, lyricsArray.length);
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
    textShadow: settings.textShadow,
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">


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