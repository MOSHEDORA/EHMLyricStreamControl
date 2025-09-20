import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useLyricsLowerThirdSettings } from "@/hooks/use-display-settings";
import { useLowerThirdScaler } from "@/hooks/use-resolution-scaler";

export default function LyricsLowerThird() {
  const sessionId = "lyrics-lower-third";
  const { session, lyricsArray } = useWebSocket(sessionId);
  const [currentDisplayLines, setCurrentDisplayLines] = useState<string[]>([]);
  // Display-specific settings with resolution scaling
  const { settings } = useLyricsLowerThirdSettings();
  const { canvasStyle, wrapperStyle } = useLowerThirdScaler(settings.displayResolution);



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

  const textStyle = {
    fontSize: `${settings.fontSize}px`,
    fontFamily: settings.fontFamily,
    color: settings.textColor,
    textAlign: settings.textAlign,
    lineHeight: settings.lineHeight,
    fontWeight: settings.fontWeight,
  };

  return (
    <div style={wrapperStyle}>
      <div style={canvasStyle}>
        {/* Lower third positioned content */}
        <div 
          className="absolute bottom-0 left-0 right-0 z-10"
          style={{
            height: settings.maxHeight,
            padding: `${settings.padding}px`,
          }}
        >
          <div 
            className="w-full h-full"
            style={{ 
              padding: `${settings.padding}px`,
            }}
          >
            {currentDisplayLines.length > 0 ? (
              <div className="space-y-2">
                {currentDisplayLines.map((line, index) => (
                  <div 
                    key={index}
                    className="transition-all duration-500"
                    style={{
                      ...textStyle,
                      opacity: index === 0 ? 1 : 0.8,
                      transform: index === 0 ? 'scale(1.02)' : 'scale(1)',
                    }}
                    data-testid={`text-lyrics-line-${index}`}
                  >
                    {line}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}