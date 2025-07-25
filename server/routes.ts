import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { websocketMessageSchema, type WebSocketMessage, type Session } from "@shared/schema";
import { z } from "zod";

interface ExtendedWebSocket extends WebSocket {
  sessionId?: string;
  isAlive?: boolean;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time communication
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws' 
  });

  const clients = new Map<string, Set<ExtendedWebSocket>>();

  // Helper function to broadcast to all clients in a session
  function broadcastToSession(sessionId: string, message: WebSocketMessage) {
    const sessionClients = clients.get(sessionId);
    if (sessionClients) {
      const messageStr = JSON.stringify(message);
      sessionClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(messageStr);
        }
      });
    }
  }

  // Helper function to parse lyrics into array
  function parseLyrics(lyrics: string): string[] {
    return lyrics
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }

  // WebSocket connection handler
  wss.on('connection', (ws: ExtendedWebSocket, req) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const sessionId = url.searchParams.get('sessionId') || 'default';
    
    ws.sessionId = sessionId;
    ws.isAlive = true;

    // Add client to session
    if (!clients.has(sessionId)) {
      clients.set(sessionId, new Set());
    }
    clients.get(sessionId)!.add(ws);

    console.log(`WebSocket client connected to session: ${sessionId}`);

    // Send current state to new client
    storage.getSession(sessionId).then(async (session) => {
      if (!session) {
        // Create default session
        session = await storage.createSession({
          sessionId,
          lyrics: "",
          currentLine: 0,
          displayLines: 2,
          fontSize: 32,
          fontFamily: "Arial",
          textColor: "#ffffff",
          textAlign: "center",
          showBackground: false,
          backgroundColor: "#000000",
          backgroundOpacity: 50,
          isPlaying: false,
          autoScroll: false,
          songTitle: "",
          separateDisplaySettings: false,
          lowerThirdDisplayLines: 2,
          lowerThirdFontSize: 32,
          lowerThirdFontFamily: "Arial",
          lowerThirdTextColor: "#ffffff",
          lowerThirdTextAlign: "center",
          lowerThirdShowBackground: false,
          lowerThirdBackgroundColor: "#000000",
          lowerThirdBackgroundOpacity: 50,
          fullscreenDisplayLines: 2,
          fullscreenFontSize: 32,
          fullscreenFontFamily: "Arial",
          fullscreenTextColor: "#ffffff",
          fullscreenTextAlign: "center",
          fullscreenShowBackground: false,
          fullscreenBackgroundColor: "#000000",
          fullscreenBackgroundOpacity: 50,
        });
      }

      const lyricsArray = parseLyrics(session.lyrics);
      const stateMessage: WebSocketMessage = {
        type: "state_update",
        payload: {
          session,
          lyricsArray,
          totalLines: lyricsArray.length,
        },
      };

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(stateMessage));
      }
    });

    // Handle incoming messages
    ws.on('message', async (data) => {
      try {
        const rawMessage = JSON.parse(data.toString());
        const message = websocketMessageSchema.parse(rawMessage);

        let session = await storage.getSession(sessionId);
        if (!session) return;

        let shouldBroadcast = true;
        let updatedSession: Session | undefined;

        switch (message.type) {
          case "update_lyrics":
            updatedSession = await storage.updateSession(sessionId, {
              lyrics: message.payload.lyrics,
              songTitle: message.payload.songTitle || session.songTitle,
              currentLine: 0, // Reset to first line when lyrics change
            });
            break;

          case "update_position":
            updatedSession = await storage.updateSession(sessionId, {
              currentLine: message.payload.currentLine,
            });
            break;

          case "update_settings":
            updatedSession = await storage.updateSession(sessionId, {
              ...message.payload,
            });
            break;

          case "toggle_play":
            updatedSession = await storage.updateSession(sessionId, {
              isPlaying: message.payload.isPlaying,
            });
            break;

          case "navigation":
            const lyricsArray = parseLyrics(session.lyrics);
            const totalLines = lyricsArray.length;
            let newLine = session.currentLine;
            const displayLines = session.displayLines;

            switch (message.payload.action) {
              case "next":
                // Jump by displayLines instead of just 1
                newLine = Math.min(session.currentLine + displayLines, totalLines - 1);
                break;
              case "previous":
                // Jump back by displayLines instead of just 1
                newLine = Math.max(session.currentLine - displayLines, 0);
                break;
              case "first":
                newLine = 0;
                break;
              case "last":
                newLine = totalLines - 1;
                break;
              case "jump":
                if (message.payload.line !== undefined) {
                  newLine = Math.max(0, Math.min(message.payload.line, totalLines - 1));
                }
                break;
            }

            updatedSession = await storage.updateSession(sessionId, {
              currentLine: newLine,
            });
            break;

          case "request_state":
            shouldBroadcast = false;
            const currentSession = await storage.getSession(sessionId);
            if (currentSession) {
              const lyricsArray = parseLyrics(currentSession.lyrics);
              const stateMessage: WebSocketMessage = {
                type: "state_update",
                payload: {
                  session: currentSession,
                  lyricsArray,
                  totalLines: lyricsArray.length,
                },
              };
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(stateMessage));
              }
            }
            break;
        }

        // Broadcast updated state to all clients in session
        if (shouldBroadcast && updatedSession) {
          const lyricsArray = parseLyrics(updatedSession.lyrics);
          const stateMessage: WebSocketMessage = {
            type: "state_update",
            payload: {
              session: updatedSession,
              lyricsArray,
              totalLines: lyricsArray.length,
            },
          };
          broadcastToSession(sessionId, stateMessage);
        }

      } catch (error) {
        console.error('WebSocket message error:', error);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Invalid message format' 
          }));
        }
      }
    });

    // Handle ping/pong for connection health
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // Clean up on disconnect
    ws.on('close', () => {
      const sessionClients = clients.get(sessionId);
      if (sessionClients) {
        sessionClients.delete(ws);
        if (sessionClients.size === 0) {
          clients.delete(sessionId);
        }
      }
      console.log(`WebSocket client disconnected from session: ${sessionId}`);
    });
  });

  // Ping clients periodically to check connection health
  const pingInterval = setInterval(() => {
    wss.clients.forEach((ws: ExtendedWebSocket) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  // Clean up on server shutdown
  wss.on('close', () => {
    clearInterval(pingInterval);
  });

  // REST API endpoints
  app.get('/api/session/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      const lyricsArray = parseLyrics(session.lyrics);
      res.json({
        session,
        lyricsArray,
        totalLines: lyricsArray.length,
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get session' });
    }
  });

  return httpServer;
}
