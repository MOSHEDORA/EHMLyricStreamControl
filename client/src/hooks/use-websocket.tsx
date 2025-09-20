import { useEffect, useState, useCallback, useRef } from "react";
import { WebSocketClient } from "@/lib/websocket-client";
import { WebSocketMessage, Session } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

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

        // Note: request_state removed from schema - state will be sent automatically

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
      } else if (message.type === "settings_update") {
        // Invalidate React Query cache for the updated display type
        queryClient.invalidateQueries({ 
          queryKey: ['display-settings', message.payload.displayType] 
        });
        console.log('Settings updated for display type:', message.payload.displayType);
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

  // Settings are now handled via URL-specific settings files
  // This function is kept for backward compatibility but does nothing
  const updateSettings = useCallback((_settings: any) => {
    console.log('Settings are now managed via URL-specific settings files');
    return true;
  }, []);

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
