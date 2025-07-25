import { useEffect, useState, useCallback, useRef } from "react";
import { WebSocketClient } from "@/lib/websocket-client";
import { WebSocketMessage, Session } from "@shared/schema";

interface WebSocketState {
  session: Session | null;
  lyricsArray: string[];
  totalLines: number;
  isConnected: boolean;
  client: WebSocketClient | null;
}

export function useWebSocket(sessionId: string = 'default') {
  const [state, setState] = useState<WebSocketState>({
    session: null,
    lyricsArray: [],
    totalLines: 0,
    isConnected: false,
    client: null,
  });

  const clientRef = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    const client = new WebSocketClient(sessionId);
    clientRef.current = client;

    const connectClient = async () => {
      try {
        await client.connect();
        
        setState(prev => ({ ...prev, client, isConnected: true }));

        // Request current state
        client.send({
          type: "request_state",
          payload: {},
        });

      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
      }
    };

    // Handle incoming messages
    const removeMessageHandler = client.onMessage((message: WebSocketMessage) => {
      if (message.type === "state_update") {
        setState(prev => ({
          ...prev,
          session: message.payload.session,
          lyricsArray: message.payload.lyricsArray,
          totalLines: message.payload.totalLines,
        }));
      }
    });

    // Handle connection status
    const removeConnectionHandler = client.onConnection((connected: boolean) => {
      setState(prev => ({ ...prev, isConnected: connected }));
    });

    connectClient();

    return () => {
      removeMessageHandler();
      removeConnectionHandler();
      client.disconnect();
      clientRef.current = null;
    };
  }, [sessionId]);

  const sendMessage = useCallback((message: WebSocketMessage): boolean => {
    if (clientRef.current) {
      return clientRef.current.send(message);
    }
    return false;
  }, []);

  const updateLyrics = useCallback((lyrics: string, songTitle?: string) => {
    return sendMessage({
      type: "update_lyrics",
      payload: { lyrics, songTitle },
    });
  }, [sendMessage]);

  const updatePosition = useCallback((currentLine: number) => {
    return sendMessage({
      type: "update_position",
      payload: { currentLine },
    });
  }, [sendMessage]);

  const updateSettings = useCallback((settings: {
    displayLines?: number;
    fontSize?: number;
    fontFamily?: string;
    textColor?: string;
    textAlign?: string;
    showBackground?: boolean;
    backgroundColor?: string;
    backgroundOpacity?: number;
    separateDisplaySettings?: boolean;
    displayType?: "unified" | "lower-third" | "fullscreen";
    
    // Lower third specific
    lowerThirdDisplayLines?: number;
    lowerThirdFontSize?: number;
    lowerThirdFontFamily?: string;
    lowerThirdTextColor?: string;
    lowerThirdTextAlign?: string;
    lowerThirdShowBackground?: boolean;
    lowerThirdBackgroundColor?: string;
    lowerThirdBackgroundOpacity?: number;
    
    // Fullscreen specific
    fullscreenDisplayLines?: number;
    fullscreenFontSize?: number;
    fullscreenFontFamily?: string;
    fullscreenTextColor?: string;
    fullscreenTextAlign?: string;
    fullscreenShowBackground?: boolean;
    fullscreenBackgroundColor?: string;
    fullscreenBackgroundOpacity?: number;
  }) => {
    return sendMessage({
      type: "update_settings",
      payload: settings,
    });
  }, [sendMessage]);

  const togglePlay = useCallback((isPlaying: boolean) => {
    return sendMessage({
      type: "toggle_play",
      payload: { isPlaying },
    });
  }, [sendMessage]);

  const navigate = useCallback((action: "next" | "previous" | "first" | "last" | "jump", line?: number) => {
    return sendMessage({
      type: "navigation",
      payload: { action, line },
    });
  }, [sendMessage]);

  return {
    ...state,
    updateLyrics,
    updatePosition,
    updateSettings,
    togglePlay,
    navigate,
  };
}
