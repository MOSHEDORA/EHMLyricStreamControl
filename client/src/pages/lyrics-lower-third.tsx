import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useDisplaySettings, defaultSettings } from "@/hooks/use-display-settings";
import { DynamicText } from "@/components/dynamic-text";

export default function LyricsLowerThird() {
  const sessionId = "lyrics-lower-third";
  const { session, lyricsArray } = useWebSocket(sessionId);
  const [currentDisplayLines, setCurrentDisplayLines] = useState<string[]>([]);
  
  // Use stored settings or defaults
  const { settings: storedSettings, isLoading: settingsLoading } = useDisplaySettings('lyrics-lower-third');
  const settings = storedSettings || defaultSettings['lyrics-lower-third'];

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
    
    // Use lower-third-specific count
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

  // Calculate available height for lower third
  const availableHeight = parseInt(settings.maxHeight) - (settings.padding * 2);

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
        <DynamicText
          lines={currentDisplayLines}
          baseFontSize={settings.fontSize}
          minFontSize={16}
          maxFontSize={settings.fontSize * 1.5}
          lineHeight={settings.lineHeight}
          fontFamily={settings.fontFamily}
          textColor={settings.textColor}
          textAlign={settings.textAlign}
          fontWeight={settings.fontWeight}
          padding={settings.padding}
          spacing={8}
          testId="text-lyrics-line"
          renderLine={(line, index) => (
            <span 
              style={{
                opacity: index === 0 ? 1 : 0.8,
                transform: index === 0 ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.5s ease-in-out',
                display: 'inline-block'
              }}
            >
              {line}
            </span>
          )}
        />
      </div>
    </div>
  );
}