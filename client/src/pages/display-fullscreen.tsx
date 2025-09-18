import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { Session } from "@shared/schema";

// Helper function to get fullscreen-specific settings
function getFullscreenSettings(session: Session) {
  if (session.separateDisplaySettings) {
    return {
      displayLines: session.fullscreenDisplayLines,
      fontSize: session.fullscreenFontSize,
      fontFamily: session.fullscreenFontFamily,
      textColor: session.fullscreenTextColor,
      textAlign: session.fullscreenTextAlign,
      showBackground: session.fullscreenShowBackground,
      backgroundColor: session.fullscreenBackgroundColor,
      backgroundOpacity: session.fullscreenBackgroundOpacity,
    };
  }
  return {
    displayLines: session.displayLines,
    fontSize: session.fontSize,
    fontFamily: session.fontFamily,
    textColor: session.textColor,
    textAlign: session.textAlign,
    showBackground: session.showBackground,
    backgroundColor: session.backgroundColor,
    backgroundOpacity: session.backgroundOpacity,
  };
}

export default function DisplayFullscreen() {
  const sessionId = "default";
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
      const settings = getFullscreenSettings(session);
      const startLine = session.currentLine;
      const endLine = Math.min(startLine + settings.displayLines, lyricsArray.length);
      const lines = lyricsArray.slice(startLine, endLine);
      setCurrentDisplayLines(lines);
    }
  }, [session, lyricsArray]);

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl opacity-50">Connecting...</div>
      </div>
    );
  }

  // Hide display when no content is loaded
  if (currentDisplayLines.length === 0) {
    return null;
  }

  const settings = getFullscreenSettings(session);
  const backgroundStyle = settings.showBackground
    ? {
        backgroundColor: settings.backgroundColor,
        opacity: settings.backgroundOpacity / 100,
      }
    : {};

  // Scale font size for fullscreen display
  const fullscreenFontSize = Math.max(settings.fontSize * 1.5, 48);
  const titleFontSize = Math.max(settings.fontSize * 0.8, 32);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background overlay if enabled */}
      {settings.showBackground && (
        <div
          className="absolute inset-0"
          style={backgroundStyle}
        />
      )}

      {/* Main content centered for fullscreen */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div
          className="w-full max-w-full px-4"
          style={{
            textAlign: settings.textAlign as any,
          }}
        >
          {currentDisplayLines.length > 0 ? (
            <div className="space-y-6">
              {currentDisplayLines.map((line, index) => {
                  // Check if this is a reference format "BookName Chapter:Verse (Language)"
                  const referenceMatch = line.match(/^([^(]+\s+\d+:\d+)\s*\(([^)]+)\)\s*\n(.+)/s);
                  const isReferenceFormat = !!referenceMatch;

                  return (
                    <div
                      key={index}
                      className="transition-all duration-500 leading-relaxed"
                      style={{
                        fontSize: `${fullscreenFontSize}px`,
                        fontFamily: settings.fontFamily,
                        color: settings.textColor,
                        opacity: index === 0 ? 1 : 0.85,
                        transform: index === 0 ? 'scale(1.05)' : 'scale(1)',
                        textShadow: "3px 3px 6px rgba(0,0,0,0.8)",
                      }}
                    >
                      {isReferenceFormat ? (
                        // Reference format: "BookName Chapter:Verse (Language)" followed by text
                        <div className="mb-4">
                          <span className="text-blue-300 font-bold block mb-2 text-center">
                            {referenceMatch![1]} ({referenceMatch![2]})
                          </span>
                          <div className="text-center">{referenceMatch![3]}</div>
                        </div>
                      ) : (
                        // Display regular text lines (including single language verses)
                        <div className="whitespace-pre-line text-center">
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
  );
}