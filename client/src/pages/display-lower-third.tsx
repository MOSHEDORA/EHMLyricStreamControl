import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";

export default function DisplayLowerThird() {
  const sessionId = "lyrics-lower-third";
  const { session, lyricsArray } = useWebSocket(sessionId);
  const [currentDisplayLines, setCurrentDisplayLines] = useState<string[]>([]);

  // Update display lines when session or lyrics change
  useEffect(() => {
    if (!session || !lyricsArray.length) {
      setCurrentDisplayLines([]);
      return;
    }

    // For Bible content, display all content regardless of displayLines setting
    // Check if this is Bible content by looking at the song title format
    const isBibleContent = session.songTitle && session.songTitle.includes(':');
    
    if (isBibleContent) {
      // Show all content for Bible verses
      setCurrentDisplayLines(lyricsArray);
    } else {
      // Use original logic for song lyrics
      const displayLines = 2; // Hardcoded display lines
      const startLine = session.currentLine;
      const endLine = Math.min(startLine + displayLines, lyricsArray.length);
      const lines = lyricsArray.slice(startLine, endLine);
      setCurrentDisplayLines(lines);
    }
  }, [session, lyricsArray]);

  if (!session) {
    return (
      <div className="min-h-screen bg-transparent flex items-end justify-center pb-16">
        <div className="text-white text-xl opacity-50">Connecting...</div>
      </div>
    );
  }

  // Hide display when no content is loaded
  if (currentDisplayLines.length === 0) {
    return null;
  }

  // Hardcoded settings
  const settings = {
    fontSize: 32,
    fontFamily: 'Arial',
    textColor: '#ffffff',
    textAlign: 'center',
    showBackground: false,
    backgroundColor: '#000000',
    backgroundOpacity: 50
  };
  
  const backgroundStyle = settings.showBackground
    ? {
        backgroundColor: settings.backgroundColor,
        opacity: settings.backgroundOpacity / 100,
      }
    : {};

  // Function to get book name from reference
  const getBookName = (reference: string): string => {
    const match = reference.match(/^([^\d]+)\s+\d+/);
    return match ? match[1] : reference; // Return the whole reference if no book name is found
  };

  // Function to get chapter and verse from reference
  const getChapterVerse = (reference: string): string => {
    const match = reference.match(/(\d+:\d+)/);
    return match ? match[1] : '';
  };

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
                {currentDisplayLines.map((line, index) => {
                  // Check if this is a reference format "BookName Chapter:Verse (Language)"
                  const referenceMatch = line.match(/^([^(]+\s+\d+:\d+)\s*\(([^)]+)\)\s*\n(.+)/);
                  const isReferenceFormat = !!referenceMatch;

                  return (
                    <div 
                      key={index}
                      className="transition-all duration-500 leading-relaxed"
                      style={{
                        fontSize: `${settings.fontSize}px`,
                        fontFamily: settings.fontFamily,
                        color: settings.textColor,
                        opacity: index === 0 ? 1 : 0.85,
                        transform: index === 0 ? 'scale(1.02)' : 'scale(1)',
                        textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                      }}
                    >
                      {isReferenceFormat ? (
                        // Reference format: "BookName Chapter:Verse (Language)" followed by text
                        <div className="mb-2">
                          <span className="text-blue-300 font-bold block mb-1">
                            {referenceMatch![1]} ({referenceMatch![2]})
                          </span>
                          <span>{referenceMatch![3]}</span>
                        </div>
                      ) : (
                        // Display regular text lines (including single language verses)
                        <div className="whitespace-pre-line">
                          {line}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}