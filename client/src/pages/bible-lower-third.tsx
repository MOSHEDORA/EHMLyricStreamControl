import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";

export default function BibleLowerThird() {
  const sessionId = "bible-lower-third";
  const { session, lyricsArray } = useWebSocket(sessionId);
  const [currentDisplayLines, setCurrentDisplayLines] = useState<string[]>([]);
  // Default display settings
  const displaySettings = {
    fontSize: 28,
    fontFamily: 'Arial',
    textColor: '#ffffff',
    textAlign: 'center' as const,
    backgroundEnabled: false
  };

  // Default screen settings
  const screenSettings = {
    margins: 40,
    lowerThirdHeightPercent: 25
  };



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
      // For lyrics content, use the displayLines setting
      const startLine = session.currentLine;
      const endLine = Math.min(startLine + session.displayLines, lyricsArray.length);
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

  // Hide display if bible output is disabled and no content is loaded
  if (!session.bibleOutputEnabled && currentDisplayLines.length === 0) {
    return null; // Completely hidden - no background
  }

  const textStyle = {
    fontSize: `${displaySettings.fontSize}px`,
    fontFamily: displaySettings.fontFamily,
    color: displaySettings.textColor,
    textAlign: displaySettings.textAlign,
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">


      {/* Lower third positioned content */}
      <div 
        className="absolute bottom-0 left-0 right-0 z-10"
        style={{
          height: `${screenSettings.lowerThirdHeightPercent}%`,
        }}
      >
        <div 
          className="w-full h-full"
          style={{ 
            padding: `${screenSettings.margins}px`,
          }}
        >
          {currentDisplayLines.length > 0 ? (
            <div className="space-y-2">
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