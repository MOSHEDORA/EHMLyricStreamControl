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
            {currentDisplayLines.map((line, index) => (
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
                data-testid={`text-lyrics-line-${index}`}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}