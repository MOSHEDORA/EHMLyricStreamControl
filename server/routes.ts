import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { websocketMessageSchema, type WebSocketMessage, type Session } from "@shared/schema";
import { z } from "zod";

// Zod validation schemas
const downloadBibleSchema = z.object({
  version: z.string().default("kjv"),
});

const bibleParamsSchema = z.object({
  abbrev: z.string(),
  chapter: z.string().regex(/^\d+$/, "Chapter must be a number"),
});

// Bible data structure from thiagobodruk/bible (array format)
interface BibleApiBook {
  abbrev: string;
  book: string;
  chapters: string[][]; // Array of chapters, each chapter is array of verse strings
}

// Bible book ordering and testament mapping with correct GitHub filenames
const BIBLE_BOOKS = [
  // Old Testament
  { abbrev: "gen", name: "Genesis", filename: "Genesis", testament: "OT", order: 1 },
  { abbrev: "exo", name: "Exodus", filename: "Exodus", testament: "OT", order: 2 },
  { abbrev: "lev", name: "Leviticus", filename: "Leviticus", testament: "OT", order: 3 },
  { abbrev: "num", name: "Numbers", filename: "Numbers", testament: "OT", order: 4 },
  { abbrev: "deu", name: "Deuteronomy", filename: "Deuteronomy", testament: "OT", order: 5 },
  { abbrev: "jos", name: "Joshua", filename: "Joshua", testament: "OT", order: 6 },
  { abbrev: "jdg", name: "Judges", filename: "Judges", testament: "OT", order: 7 },
  { abbrev: "rut", name: "Ruth", filename: "Ruth", testament: "OT", order: 8 },
  { abbrev: "1sa", name: "1 Samuel", filename: "1%20Samuel", testament: "OT", order: 9 },
  { abbrev: "2sa", name: "2 Samuel", filename: "2%20Samuel", testament: "OT", order: 10 },
  { abbrev: "1ki", name: "1 Kings", filename: "1%20Kings", testament: "OT", order: 11 },
  { abbrev: "2ki", name: "2 Kings", filename: "2%20Kings", testament: "OT", order: 12 },
  { abbrev: "1ch", name: "1 Chronicles", filename: "1%20Chronicles", testament: "OT", order: 13 },
  { abbrev: "2ch", name: "2 Chronicles", filename: "2%20Chronicles", testament: "OT", order: 14 },
  { abbrev: "ezr", name: "Ezra", filename: "Ezra", testament: "OT", order: 15 },
  { abbrev: "neh", name: "Nehemiah", filename: "Nehemiah", testament: "OT", order: 16 },
  { abbrev: "est", name: "Esther", filename: "Esther", testament: "OT", order: 17 },
  { abbrev: "job", name: "Job", filename: "Job", testament: "OT", order: 18 },
  { abbrev: "psa", name: "Psalms", filename: "Psalms", testament: "OT", order: 19 },
  { abbrev: "pro", name: "Proverbs", filename: "Proverbs", testament: "OT", order: 20 },
  { abbrev: "ecc", name: "Ecclesiastes", filename: "Ecclesiastes", testament: "OT", order: 21 },
  { abbrev: "sng", name: "Song of Solomon", filename: "Song%20of%20Solomon", testament: "OT", order: 22 },
  { abbrev: "isa", name: "Isaiah", filename: "Isaiah", testament: "OT", order: 23 },
  { abbrev: "jer", name: "Jeremiah", filename: "Jeremiah", testament: "OT", order: 24 },
  { abbrev: "lam", name: "Lamentations", filename: "Lamentations", testament: "OT", order: 25 },
  { abbrev: "eze", name: "Ezekiel", filename: "Ezekiel", testament: "OT", order: 26 },
  { abbrev: "dan", name: "Daniel", filename: "Daniel", testament: "OT", order: 27 },
  { abbrev: "hos", name: "Hosea", filename: "Hosea", testament: "OT", order: 28 },
  { abbrev: "joe", name: "Joel", filename: "Joel", testament: "OT", order: 29 },
  { abbrev: "amo", name: "Amos", filename: "Amos", testament: "OT", order: 30 },
  { abbrev: "oba", name: "Obadiah", filename: "Obadiah", testament: "OT", order: 31 },
  { abbrev: "jon", name: "Jonah", filename: "Jonah", testament: "OT", order: 32 },
  { abbrev: "mic", name: "Micah", filename: "Micah", testament: "OT", order: 33 },
  { abbrev: "nah", name: "Nahum", filename: "Nahum", testament: "OT", order: 34 },
  { abbrev: "hab", name: "Habakkuk", filename: "Habakkuk", testament: "OT", order: 35 },
  { abbrev: "zep", name: "Zephaniah", filename: "Zephaniah", testament: "OT", order: 36 },
  { abbrev: "hag", name: "Haggai", filename: "Haggai", testament: "OT", order: 37 },
  { abbrev: "zec", name: "Zechariah", filename: "Zechariah", testament: "OT", order: 38 },
  { abbrev: "mal", name: "Malachi", filename: "Malachi", testament: "OT", order: 39 },
  // New Testament
  { abbrev: "mat", name: "Matthew", filename: "Matthew", testament: "NT", order: 40 },
  { abbrev: "mar", name: "Mark", filename: "Mark", testament: "NT", order: 41 },
  { abbrev: "luk", name: "Luke", filename: "Luke", testament: "NT", order: 42 },
  { abbrev: "joh", name: "John", filename: "John", testament: "NT", order: 43 },
  { abbrev: "act", name: "Acts", filename: "Acts", testament: "NT", order: 44 },
  { abbrev: "rom", name: "Romans", filename: "Romans", testament: "NT", order: 45 },
  { abbrev: "1co", name: "1 Corinthians", filename: "1%20Corinthians", testament: "NT", order: 46 },
  { abbrev: "2co", name: "2 Corinthians", filename: "2%20Corinthians", testament: "NT", order: 47 },
  { abbrev: "gal", name: "Galatians", filename: "Galatians", testament: "NT", order: 48 },
  { abbrev: "eph", name: "Ephesians", filename: "Ephesians", testament: "NT", order: 49 },
  { abbrev: "phi", name: "Philippians", filename: "Philippians", testament: "NT", order: 50 },
  { abbrev: "col", name: "Colossians", filename: "Colossians", testament: "NT", order: 51 },
  { abbrev: "1th", name: "1 Thessalonians", filename: "1%20Thessalonians", testament: "NT", order: 52 },
  { abbrev: "2th", name: "2 Thessalonians", filename: "2%20Thessalonians", testament: "NT", order: 53 },
  { abbrev: "1ti", name: "1 Timothy", filename: "1%20Timothy", testament: "NT", order: 54 },
  { abbrev: "2ti", name: "2 Timothy", filename: "2%20Timothy", testament: "NT", order: 55 },
  { abbrev: "tit", name: "Titus", filename: "Titus", testament: "NT", order: 56 },
  { abbrev: "phm", name: "Philemon", filename: "Philemon", testament: "NT", order: 57 },
  { abbrev: "heb", name: "Hebrews", filename: "Hebrews", testament: "NT", order: 58 },
  { abbrev: "jam", name: "James", filename: "James", testament: "NT", order: 59 },
  { abbrev: "1pe", name: "1 Peter", filename: "1%20Peter", testament: "NT", order: 60 },
  { abbrev: "2pe", name: "2 Peter", filename: "2%20Peter", testament: "NT", order: 61 },
  { abbrev: "1jo", name: "1 John", filename: "1%20John", testament: "NT", order: 62 },
  { abbrev: "2jo", name: "2 John", filename: "2%20John", testament: "NT", order: 63 },
  { abbrev: "3jo", name: "3 John", filename: "3%20John", testament: "NT", order: 64 },
  { abbrev: "jud", name: "Jude", filename: "Jude", testament: "NT", order: 65 },
  { abbrev: "rev", name: "Revelation", filename: "Revelation", testament: "NT", order: 66 },
];

// Concurrency guard for Bible downloads
let isDownloading = false;

async function downloadBibleData(version: string = 'kjv'): Promise<{ bookCount: number; chapterCount: number; verseCount: number }> {
  // Check concurrency guard
  if (isDownloading) {
    throw new Error('Bible download already in progress');
  }
  
  isDownloading = true;
  console.log(`Starting Bible download for version: ${version}`);
  
  let bookCount = 0;
  let chapterCount = 0;
  let verseCount = 0;
  
  try {
    // First, clear existing data to ensure idempotency
    await storage.deleteAllBooks();
    
    // Download complete Bible from thiagobodruk repository (better structure)
    const bibleUrl = "https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json";
    
    try {
      console.log('Downloading complete Bible JSON...');
      
      // Add timeout to fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for full Bible
      
      const response = await fetch(bibleUrl, { 
        signal: controller.signal,
        headers: { 'User-Agent': 'Bible-Reader-App' }
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to download Bible data (${response.status})`);
      }
      
      const bibleData: BibleApiBook[] = await response.json();
      
      if (!Array.isArray(bibleData)) {
        throw new Error('Invalid Bible data format');
      }
      
      // Process all books from the downloaded JSON
      for (const bookData of bibleData) {
        const bookInfo = BIBLE_BOOKS.find(b => b.abbrev === bookData.abbrev || b.name.toLowerCase() === bookData.book?.toLowerCase());
        if (!bookInfo) {
          console.warn(`Unknown book: ${bookData.book} (${bookData.abbrev}), skipping...`);
          continue;
        }
        
        // Create the book
        const book = await storage.createBook({
          name: bookInfo.name,
          abbrev: bookInfo.abbrev,
          testament: bookInfo.testament,
          order: bookInfo.order,
        });
        bookCount++;
        
        // Process chapters (array of string arrays)
        if (bookData.chapters && Array.isArray(bookData.chapters)) {
          for (let chapterIndex = 0; chapterIndex < bookData.chapters.length; chapterIndex++) {
            const verses = bookData.chapters[chapterIndex];
            
            if (!Array.isArray(verses) || verses.length === 0) {
              console.warn(`Invalid chapter data in ${bookInfo.name} chapter ${chapterIndex + 1}, skipping...`);
              continue;
            }
            
            // Create the chapter
            const chapter = await storage.createChapter({
              bookId: book.id,
              chapterNumber: chapterIndex + 1,
              verseCount: verses.length,
            });
            chapterCount++;
            
            // Create verses
            for (let verseIndex = 0; verseIndex < verses.length; verseIndex++) {
              const verseText = verses[verseIndex];
              
              if (!verseText || typeof verseText !== 'string') {
                console.warn(`Invalid verse data in ${bookInfo.name} ${chapterIndex + 1}:${verseIndex + 1}, skipping...`);
                continue;
              }
              
              await storage.createVerse({
                chapterId: chapter.id,
                verseNumber: verseIndex + 1,
                text: verseText,
                version: version.toUpperCase(),
              });
              verseCount++;
            }
          }
        }
      }
      
    } catch (downloadError: any) {
      if (downloadError.name === 'AbortError') {
        console.error('Timeout downloading Bible data');
      } else {
        console.error('Error downloading Bible data:', downloadError);
      }
      throw downloadError;
    }
    
    console.log(`Bible download completed: ${bookCount} books, ${chapterCount} chapters, ${verseCount} verses`);
    return { bookCount, chapterCount, verseCount };
    
  } catch (error) {
    console.error('Error downloading Bible data:', error);
    throw error;
  } finally {
    isDownloading = false;
  }
}

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

  // Bible API endpoints
  app.get('/api/bible/books', async (req, res) => {
    try {
      const books = await storage.getAllBooks();
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get books' });
    }
  });

  app.get('/api/bible/books/:abbrev/chapters', async (req, res) => {
    try {
      const { abbrev } = req.params;
      
      if (!abbrev || typeof abbrev !== 'string') {
        return res.status(400).json({ message: 'Invalid book abbreviation' });
      }

      const book = await storage.getBookByAbbrev(abbrev);
      
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }

      const chapters = await storage.getChaptersByBookId(book.id);
      res.json(chapters);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get chapters' });
    }
  });

  app.get('/api/bible/books/:abbrev/chapters/:chapter/verses', async (req, res) => {
    try {
      // Validate params with Zod
      const paramsResult = bibleParamsSchema.safeParse(req.params);
      if (!paramsResult.success) {
        return res.status(400).json({ 
          message: 'Invalid parameters', 
          errors: paramsResult.error.format() 
        });
      }

      const { abbrev, chapter } = paramsResult.data;
      const chapterNumber = parseInt(chapter);

      const book = await storage.getBookByAbbrev(abbrev);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }

      const chapterData = await storage.getChapter(book.id, chapterNumber);
      if (!chapterData) {
        return res.status(404).json({ message: 'Chapter not found' });
      }

      const verses = await storage.getVersesByChapterId(chapterData.id);
      res.json(verses);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get verses' });
    }
  });

  app.post('/api/bible/download', async (req, res) => {
    try {
      // Validate request body with Zod
      const bodyResult = downloadBibleSchema.safeParse(req.body);
      if (!bodyResult.success) {
        return res.status(400).json({ 
          message: 'Invalid request body', 
          errors: bodyResult.error.format() 
        });
      }

      const { version } = bodyResult.data;
      
      // Download Bible data
      const result = await downloadBibleData(version);
      
      res.json({ 
        message: 'Bible download completed', 
        books: result.bookCount,
        chapters: result.chapterCount,
        verses: result.verseCount 
      });
    } catch (error) {
      console.error('Bible download error:', error);
      res.status(500).json({ message: 'Failed to download Bible data' });
    }
  });

  app.delete('/api/bible/data', async (req, res) => {
    try {
      await storage.deleteAllBooks();
      res.json({ message: 'Bible data cleared successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to clear Bible data' });
    }
  });

  return httpServer;
}
