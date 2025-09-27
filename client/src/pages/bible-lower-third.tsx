import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useDisplaySettings, defaultSettings } from "@/hooks/use-display-settings";
import { DynamicText } from "@/components/dynamic-text";

export default function BibleLowerThird() {
  const sessionId = "bible-lower-third";
  const { session, lyricsArray } = useWebSocket(sessionId);
  const [currentDisplayLines, setCurrentDisplayLines] = useState<string[]>([]);
  
  // Use stored settings or defaults
  const { settings: storedSettings, isLoading: settingsLoading } = useDisplaySettings('bible-lower-third');
  const settings = storedSettings || defaultSettings['bible-lower-third'];



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
      const endLine = Math.min(startLine + settings.displayLines, lyricsArray.length);
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

  // Render function for bible verses with verse number highlighting
  const renderBibleLine = (line: string, index: number) => {
    const verseMatch = line.match(/^(\d+)\.\s*(.+)/);
    const isBibleVerse = !!verseMatch;

    return (
      <span 
        style={{
          opacity: index === 0 ? 1 : 0.8,
          transform: index === 0 ? 'scale(1.02)' : 'scale(1)',
          transition: 'all 0.5s ease-in-out',
          display: 'inline-block'
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
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-transparent">


      {/* Lower third positioned content */}
      <div 
        className="absolute bottom-0 left-0 right-0 z-10"
        style={{
          height: settings.maxHeight,
          padding: `${settings.padding}px`,
        }}
      >
        <div 
          className="w-full h-full flex flex-col justify-center items-center overflow-hidden"
          style={{ 
            padding: `${settings.padding}px`,
          }}
        >
          <div 
            className="w-full text-center space-y-2"
            style={{
              fontSize: `clamp(1rem, ${Math.min(3, 50 / currentDisplayLines.length)}vw, ${settings.fontSize}px)`,
              fontFamily: settings.fontFamily,
              color: settings.textColor,
              fontWeight: settings.fontWeight,
              lineHeight: settings.lineHeight,
              textAlign: settings.textAlign,
              maxHeight: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            {currentDisplayLines.map((line, index) => {
              // Check if this looks like a Bible verse (starts with number)
              const verseMatch = line.match(/^(\d+)\.\s*(.+)/);
              const isBibleVerse = !!verseMatch;

              return (
                <div 
                  key={index}
                  className="transition-all duration-500 leading-tight"
                  style={{
                    opacity: index === 0 ? 1 : 0.8,
                    transform: index === 0 ? 'scale(1.02)' : 'scale(1)',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto',
                    maxWidth: '100%'
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
        </div>
        </div>
    </div>
  );
}