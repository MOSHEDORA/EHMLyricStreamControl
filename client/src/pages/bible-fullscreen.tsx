import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useDisplaySettings, defaultSettings } from "@/hooks/use-display-settings";
import { DynamicText } from "@/components/dynamic-text";

export default function BibleFullscreen() {
  const sessionId = "bible-fullscreen";
  const { session, lyricsArray } = useWebSocket(sessionId);
  const [currentDisplayLines, setCurrentDisplayLines] = useState<string[]>([]);
  
  // Use stored settings or defaults
  const { settings: storedSettings, isLoading: settingsLoading } = useDisplaySettings('bible-fullscreen');
  const settings = storedSettings || defaultSettings['bible-fullscreen'];



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
    <div className="min-h-screen bg-black">


      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div 
          style={{ 
            width: `calc(100% - ${settings.margin * 2}px)`,
            height: `calc(100% - ${settings.margin * 2}px)`,
            margin: `${settings.margin}px`,
          }}
        >
          <DynamicText
            lines={currentDisplayLines}
            baseFontSize={settings.fontSize}
            minFontSize={Math.max(24, settings.fontSize * 0.5)}
            maxFontSize={settings.fontSize * 2}
            lineHeight={settings.lineHeight}
            fontFamily={settings.fontFamily}
            textColor={settings.textColor}
            textAlign={settings.textAlign}
            fontWeight={settings.fontWeight}
            textShadow={settings.textShadow}
            padding={settings.padding}
            spacing={16}
            testId="text-bible-verse"
            renderLine={renderBibleLine}
          />
        </div>
      </div>
    </div>
  );
}