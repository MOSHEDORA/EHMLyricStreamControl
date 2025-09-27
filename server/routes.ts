import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { websocketMessageSchema, type WebSocketMessage, type Session, insertDisplaySettingsSchema, lyricsLowerThirdSettingsSchema, lyricsFullscreenSettingsSchema, bibleLowerThirdSettingsSchema, bibleFullscreenSettingsSchema, controlPanelSettingsSchema, obsDockSettingsSchema, savedSongSchema, savedSongsArraySchema, type SavedSong } from "@shared/schema";
import { z } from "zod";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { bibleParser } from "./bible-parser.js";

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
          isPlaying: false,
          autoScroll: false,
          songTitle: "",
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


          case "toggle_play":
            updatedSession = await storage.updateSession(sessionId, {
              isPlaying: message.payload.isPlaying,
            });
            break;

          case "navigation":
            const lyricsArray = parseLyrics(session.lyrics);
            const totalLines = lyricsArray.length;
            let newLine = session.currentLine;
            
            // Get appropriate display lines based on session type
            let displayLines = 2; // Default for lower-third displays
            if (sessionId === 'lyrics-fullscreen') {
              displayLines = 4; // Fullscreen displays more lines
            } else if (sessionId === 'default') {
              displayLines = 3; // Control panel default
            }
            
            // Try to get display settings for more accurate navigation
            try {
              let settingsDisplayType = 'lyrics-lower-third';
              if (sessionId === 'lyrics-fullscreen') {
                settingsDisplayType = 'lyrics-fullscreen';
              }
              
              const displaySettings = await storage.getDisplaySettings(settingsDisplayType);
              if (displaySettings && displaySettings.settings && typeof displaySettings.settings === 'object' && 'displayLines' in displaySettings.settings) {
                displayLines = (displaySettings.settings as any).displayLines;
              }
            } catch (error) {
              console.log('Using default display lines for navigation');
            }

            switch (message.payload.action) {
              case "next":
                // Jump by displayLines for group-based navigation
                newLine = Math.min(session.currentLine + displayLines, totalLines - 1);
                break;
              case "previous":
                // Jump back by displayLines for group-based navigation
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


  app.post('/api/sessions/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { lyricsText, currentLine, songTitle } = req.body;

      let session = await storage.getSession(sessionId);
      if (!session) {
        // Create new session if it doesn't exist
        session = await storage.createSession({
          sessionId,
          lyrics: lyricsText || "",
          currentLine: currentLine || 0,
          songTitle: songTitle || "",
          isPlaying: false,
          autoScroll: false,
        });
      } else {
        // Update existing session
        session = await storage.updateSession(sessionId, {
          lyrics: lyricsText,
          currentLine: currentLine || 0,
          songTitle: songTitle || session.songTitle,
        });
      }

      if (!session) {
        return res.status(500).json({ message: 'Failed to update session' });
      }

      // Broadcast the update to all connected clients
      const lyricsArray = parseLyrics(session.lyrics);
      const stateMessage: WebSocketMessage = {
        type: "state_update",
        payload: {
          session,
          lyricsArray,
          totalLines: lyricsArray.length,
        },
      };
      broadcastToSession(sessionId, stateMessage);

      console.log(`Session ${sessionId} updated:`, { 
        title: session.songTitle, 
        lyricsLength: session.lyrics.length,
        currentLine: session.currentLine 
      });

      res.json({ success: true, session });
    } catch (error) {
      console.error('Failed to update session:', error);
      res.status(500).json({ message: 'Failed to update session' });
    }
  });

  // Bible API routes
  app.get("/api/bibles", (req, res) => {
    try {
      const bibles = bibleParser.getBibles();
      res.json(bibles.map(bible => ({
        id: bible.id,
        name: bible.name,
        language: bible.language,
        bookCount: bible.books.length
      })));
    } catch (error) {
      res.status(500).json({ error: "Failed to get Bibles" });
    }
  });

  app.get("/api/bibles/:bibleId/books", (req, res) => {
    try {
      const { bibleId } = req.params;
      const bible = bibleParser.getBible(bibleId);

      if (!bible) {
        return res.status(404).json({ error: "Bible not found" });
      }

      res.json(bible.books.map(book => ({
        id: book.id,
        name: book.name,
        chapters: book.chapters.length
      })));
    } catch (error) {
      res.status(500).json({ error: "Failed to get books" });
    }
  });

  app.get("/api/bibles/:bibleId/books/:bookId/chapters/:chapter", (req, res) => {
    try {
      const { bibleId, bookId, chapter } = req.params;
      const chapterData = bibleParser.getChapter(bibleId, bookId, chapter);

      if (!chapterData) {
        return res.status(404).json({ error: "Chapter not found" });
      }

      res.json(chapterData);
    } catch (error) {
      res.status(500).json({ error: "Failed to get chapter" });
    }
  });

  app.get("/api/bibles/:bibleId/books/:bookId/chapters/:chapter/verses/:verse", (req, res) => {
    try {
      const { bibleId, bookId, chapter, verse } = req.params;
      const verseData = bibleParser.getVerse(bibleId, bookId, chapter, verse);

      if (!verseData) {
        return res.status(404).json({ error: "Verse not found" });
      }

      res.json(verseData);
    } catch (error) {
      res.status(500).json({ error: "Failed to get verse" });
    }
  });

  app.get("/api/bibles/languages/:language", (req, res) => {
    try {
      const { language } = req.params;
      const bibles = bibleParser.getBiblesByLanguage(language);
      res.json(bibles.map(bible => ({
        id: bible.id,
        name: bible.name,
        language: bible.language,
        bookCount: bible.books.length
      })));
    } catch (error) {
      res.status(500).json({ error: "Failed to get Bibles by language" });
    }
  });

  // Bible download management routes
  app.get("/api/bibles/available", async (req, res) => {
    try {
      const { getAvailableBibles } = await import('../scripts/download-bibles.js');
      const availableBibles = await getAvailableBibles();
      res.json(availableBibles);
    } catch (error) {
      console.error('Error fetching available Bibles:', error);
      res.status(500).json({ error: "Failed to fetch available Bible versions" });
    }
  });

  app.post("/api/bibles/download", async (req, res) => {
    try {
      const { bibleNames } = req.body;
      if (!Array.isArray(bibleNames) || bibleNames.length === 0) {
        return res.status(400).json({ error: "bibleNames array is required" });
      }

      const { downloadSpecificBibles } = await import('../scripts/download-bibles.js');
      await downloadSpecificBibles(bibleNames);
      
      // Reload the bible parser after download
      bibleParser.reloadBibles();
      
      res.json({ 
        success: true, 
        message: `Downloaded ${bibleNames.length} Bible versions successfully`,
        downloaded: bibleNames
      });
    } catch (error) {
      console.error('Error downloading Bibles:', error);
      res.status(500).json({ error: "Failed to download Bible versions" });
    }
  });

  app.post("/api/bibles/download-defaults", async (req, res) => {
    try {
      const { downloadDefaultBibles } = await import('../scripts/download-bibles.js');
      await downloadDefaultBibles();
      
      // Reload the bible parser after download
      bibleParser.reloadBibles();
      
      res.json({ 
        success: true, 
        message: "Default Bible versions downloaded successfully"
      });
    } catch (error) {
      console.error('Error downloading default Bibles:', error);
      res.status(500).json({ error: "Failed to download default Bible versions" });
    }
  });

  // Display settings API routes
  app.get('/api/display-settings/:displayType', async (req, res) => {
    try {
      const { displayType } = req.params;
      const settings = await storage.getDisplaySettings(displayType);

      if (!settings) {
        // Return default settings for the display type
        let defaultSettings;
        switch (displayType) {
          case 'lyrics-lower-third':
            defaultSettings = lyricsLowerThirdSettingsSchema.parse({});
            break;
          case 'lyrics-fullscreen':
            defaultSettings = lyricsFullscreenSettingsSchema.parse({});
            break;
          case 'bible-lower-third':
            defaultSettings = bibleLowerThirdSettingsSchema.parse({});
            break;
          case 'bible-fullscreen':
            defaultSettings = bibleFullscreenSettingsSchema.parse({});
            break;
          case 'control-panel':
            defaultSettings = controlPanelSettingsSchema.parse({});
            break;
          case 'obs-dock':
            defaultSettings = obsDockSettingsSchema.parse({});
            break;
          default:
            return res.status(400).json({ message: 'Invalid display type' });
        }
        return res.json({ settings: defaultSettings });
      }

      res.json({ settings: settings.settings });
    } catch (error) {
      console.error('Failed to get display settings:', error);
      res.status(500).json({ message: 'Failed to get display settings' });
    }
  });

  app.post('/api/display-settings/:displayType', async (req, res) => {
    try {
      const { displayType } = req.params;
      const { settings: settingsData } = req.body;

      // Validate settings based on display type
      let validatedSettings;
      try {
        switch (displayType) {
          case 'lyrics-lower-third':
            validatedSettings = lyricsLowerThirdSettingsSchema.parse(settingsData);
            break;
          case 'lyrics-fullscreen':
            validatedSettings = lyricsFullscreenSettingsSchema.parse(settingsData);
            break;
          case 'bible-lower-third':
            validatedSettings = bibleLowerThirdSettingsSchema.parse(settingsData);
            break;
          case 'bible-fullscreen':
            validatedSettings = bibleFullscreenSettingsSchema.parse(settingsData);
            break;
          case 'control-panel':
            validatedSettings = controlPanelSettingsSchema.parse(settingsData);
            break;
          case 'obs-dock':
            validatedSettings = obsDockSettingsSchema.parse(settingsData);
            break;
          default:
            return res.status(400).json({ message: 'Invalid display type' });
        }
      } catch (validationError) {
        return res.status(400).json({ message: 'Invalid settings data', error: validationError });
      }

      // Check if settings already exist
      const existingSettings = await storage.getDisplaySettings(displayType);
      let result;

      if (!existingSettings) {
        // Create new settings
        result = await storage.createDisplaySettings({
          displayType,
          settings: validatedSettings,
        });
      } else {
        // Update existing settings
        result = await storage.updateDisplaySettings(displayType, validatedSettings);
      }

      if (!result) {
        return res.status(500).json({ message: 'Failed to save display settings' });
      }

      console.log(`Display settings updated for ${displayType}:`, validatedSettings);
      
      // Broadcast settings update to all clients
      const settingsMessage = {
        type: "settings_update" as const,
        payload: {
          displayType,
          settings: validatedSettings,
        },
      };
      
      // Broadcast to all sessions since settings are global
      console.log(`Broadcasting settings update to ${clients.size} sessions`);
      let broadcastCount = 0;
      clients.forEach((sessionClients, sessionId) => {
        sessionClients.forEach((client) => {
          if (client.readyState === 1) { // WebSocket.OPEN
            client.send(JSON.stringify(settingsMessage));
            broadcastCount++;
          }
        });
      });
      console.log(`Settings update broadcasted to ${broadcastCount} clients`);
      
      res.json({ success: true, settings: result.settings });
    } catch (error) {
      console.error('Failed to save display settings:', error);
      res.status(500).json({ message: 'Failed to save display settings' });
    }
  });

  app.delete('/api/display-settings/:displayType', async (req, res) => {
    try {
      const { displayType } = req.params;
      const success = await storage.deleteDisplaySettings(displayType);

      if (!success) {
        return res.status(404).json({ message: 'Display settings not found' });
      }

      res.json({ success: true, message: 'Display settings deleted' });
    } catch (error) {
      console.error('Failed to delete display settings:', error);
      res.status(500).json({ message: 'Failed to delete display settings' });
    }
  });

  // Helper functions for managing saved songs JSON file
  const songsFilePath = join(process.cwd(), 'Songs.json');

  function readSongsFile(): SavedSong[] {
    try {
      if (!existsSync(songsFilePath)) {
        writeFileSync(songsFilePath, JSON.stringify([], null, 2));
        return [];
      }
      const fileContent = readFileSync(songsFilePath, 'utf-8');
      const songs = JSON.parse(fileContent);
      return savedSongsArraySchema.parse(songs);
    } catch (error) {
      console.error('Error reading songs file:', error);
      return [];
    }
  }

  function writeSongsFile(songs: SavedSong[]): boolean {
    try {
      const validatedSongs = savedSongsArraySchema.parse(songs);
      writeFileSync(songsFilePath, JSON.stringify(validatedSongs, null, 2));
      return true;
    } catch (error) {
      console.error('Error writing songs file:', error);
      return false;
    }
  }

  // Saved songs API routes
  app.get('/api/songs', (req, res) => {
    try {
      let songs = readSongsFile();
      const { search } = req.query;

      // Filter songs if search query is provided
      if (search && typeof search === 'string') {
        const searchLower = search.toLowerCase();
        songs = songs.filter(song =>
          song.title.toLowerCase().includes(searchLower) ||
          song.lyrics.toLowerCase().includes(searchLower) ||
          song.artist?.toLowerCase().includes(searchLower) ||
          song.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      res.json({ songs });
    } catch (error) {
      console.error('Error fetching songs:', error);
      res.status(500).json({ message: 'Failed to fetch songs' });
    }
  });

  app.post('/api/songs', (req, res) => {
    try {
      const songs = readSongsFile();
      const { title, lyrics, artist, tags } = req.body;

      if (!title || !lyrics) {
        return res.status(400).json({ message: 'Title and lyrics are required' });
      }

      const newSong: SavedSong = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: title.trim(),
        lyrics: lyrics.trim(),
        artist: artist?.trim() || undefined,
        tags: Array.isArray(tags) ? tags.filter(tag => typeof tag === 'string' && tag.trim()) : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const validatedSong = savedSongSchema.parse(newSong);
      songs.push(validatedSong);

      if (writeSongsFile(songs)) {
        res.status(201).json({ song: validatedSong });
      } else {
        res.status(500).json({ message: 'Failed to save song' });
      }
    } catch (error) {
      console.error('Error creating song:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid song data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create song' });
    }
  });

  app.put('/api/songs/:id', (req, res) => {
    try {
      const songs = readSongsFile();
      const { id } = req.params;
      const { title, lyrics, artist, tags } = req.body;

      const songIndex = songs.findIndex(song => song.id === id);
      if (songIndex === -1) {
        return res.status(404).json({ message: 'Song not found' });
      }

      if (!title || !lyrics) {
        return res.status(400).json({ message: 'Title and lyrics are required' });
      }

      const updatedSong: SavedSong = {
        ...songs[songIndex],
        title: title.trim(),
        lyrics: lyrics.trim(),
        artist: artist?.trim() || undefined,
        tags: Array.isArray(tags) ? tags.filter(tag => typeof tag === 'string' && tag.trim()) : [],
        updatedAt: new Date().toISOString(),
      };

      const validatedSong = savedSongSchema.parse(updatedSong);
      songs[songIndex] = validatedSong;

      if (writeSongsFile(songs)) {
        res.json({ song: validatedSong });
      } else {
        res.status(500).json({ message: 'Failed to update song' });
      }
    } catch (error) {
      console.error('Error updating song:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid song data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update song' });
    }
  });

  app.delete('/api/songs/:id', (req, res) => {
    try {
      const songs = readSongsFile();
      const { id } = req.params;

      const songIndex = songs.findIndex(song => song.id === id);
      if (songIndex === -1) {
        return res.status(404).json({ message: 'Song not found' });
      }

      songs.splice(songIndex, 1);

      if (writeSongsFile(songs)) {
        res.json({ success: true, message: 'Song deleted successfully' });
      } else {
        res.status(500).json({ message: 'Failed to delete song' });
      }
    } catch (error) {
      console.error('Error deleting song:', error);
      res.status(500).json({ message: 'Failed to delete song' });
    }
  });

  return httpServer;
}