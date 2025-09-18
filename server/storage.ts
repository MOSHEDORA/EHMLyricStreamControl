import { 
  sessions, 
  type Session, 
  type InsertSession, 
  type BibleBook, 
  type BibleChapter, 
  type BibleVerse, 
  type InsertBibleBook, 
  type InsertBibleChapter, 
  type InsertBibleVerse 
} from "@shared/schema";

export interface IStorage {
  // Session methods
  getSession(sessionId: string): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(sessionId: string, updates: Partial<Session>): Promise<Session | undefined>;
  deleteSession(sessionId: string): Promise<boolean>;

  // Bible book methods
  getAllBooks(): Promise<BibleBook[]>;
  getBookByAbbrev(abbrev: string): Promise<BibleBook | undefined>;
  createBook(book: InsertBibleBook): Promise<BibleBook>;
  deleteAllBooks(): Promise<boolean>;

  // Bible chapter methods
  getChaptersByBookId(bookId: number): Promise<BibleChapter[]>;
  getChapter(bookId: number, chapterNumber: number): Promise<BibleChapter | undefined>;
  createChapter(chapter: InsertBibleChapter): Promise<BibleChapter>;

  // Bible verse methods
  getVersesByChapterId(chapterId: number): Promise<BibleVerse[]>;
  getVerse(chapterId: number, verseNumber: number): Promise<BibleVerse | undefined>;
  createVerse(verse: InsertBibleVerse): Promise<BibleVerse>;
  createVerses(verses: InsertBibleVerse[]): Promise<BibleVerse[]>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, Session>;
  private books: Map<number, BibleBook>;
  private chapters: Map<number, BibleChapter>;
  private verses: Map<number, BibleVerse>;
  private currentId: number;
  private currentBookId: number;
  private currentChapterId: number;
  private currentVerseId: number;

  constructor() {
    this.sessions = new Map();
    this.books = new Map();
    this.chapters = new Map();
    this.verses = new Map();
    this.currentId = 1;
    this.currentBookId = 1;
    this.currentChapterId = 1;
    this.currentVerseId = 1;
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    return Array.from(this.sessions.values()).find(
      (session) => session.sessionId === sessionId,
    );
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = this.currentId++;
    const session: Session = { 
      id,
      sessionId: insertSession.sessionId,
      lyrics: insertSession.lyrics || "",
      currentLine: insertSession.currentLine || 0,
      displayLines: insertSession.displayLines || 2,
      fontSize: insertSession.fontSize || 32,
      fontFamily: insertSession.fontFamily || "Arial",
      textColor: insertSession.textColor || "#ffffff",
      textAlign: insertSession.textAlign || "center",
      showBackground: insertSession.showBackground || false,
      backgroundColor: insertSession.backgroundColor || "#000000",
      backgroundOpacity: insertSession.backgroundOpacity || 50,
      isPlaying: insertSession.isPlaying || false,
      autoScroll: insertSession.autoScroll || false,
      songTitle: insertSession.songTitle || "",
      separateDisplaySettings: insertSession.separateDisplaySettings || false,
      lowerThirdDisplayLines: insertSession.lowerThirdDisplayLines || 2,
      lowerThirdFontSize: insertSession.lowerThirdFontSize || 32,
      lowerThirdFontFamily: insertSession.lowerThirdFontFamily || "Arial",
      lowerThirdTextColor: insertSession.lowerThirdTextColor || "#ffffff",
      lowerThirdTextAlign: insertSession.lowerThirdTextAlign || "center",
      lowerThirdShowBackground: insertSession.lowerThirdShowBackground || false,
      lowerThirdBackgroundColor: insertSession.lowerThirdBackgroundColor || "#000000",
      lowerThirdBackgroundOpacity: insertSession.lowerThirdBackgroundOpacity || 50,
      fullscreenDisplayLines: insertSession.fullscreenDisplayLines || 2,
      fullscreenFontSize: insertSession.fullscreenFontSize || 32,
      fullscreenFontFamily: insertSession.fullscreenFontFamily || "Arial",
      fullscreenTextColor: insertSession.fullscreenTextColor || "#ffffff",
      fullscreenTextAlign: insertSession.fullscreenTextAlign || "center",
      fullscreenShowBackground: insertSession.fullscreenShowBackground || false,
      fullscreenBackgroundColor: insertSession.fullscreenBackgroundColor || "#000000",
      fullscreenBackgroundOpacity: insertSession.fullscreenBackgroundOpacity || 50,
    };
    this.sessions.set(id.toString(), session);
    return session;
  }

  async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session | undefined> {
    const existingSession = await this.getSession(sessionId);
    if (!existingSession) {
      return undefined;
    }

    const updatedSession: Session = { ...existingSession, ...updates };
    this.sessions.set(existingSession.id.toString(), updatedSession);
    return updatedSession;
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return false;
    }
    
    return this.sessions.delete(session.id.toString());
  }

  // Bible book methods
  async getAllBooks(): Promise<BibleBook[]> {
    return Array.from(this.books.values()).sort((a, b) => a.order - b.order);
  }

  async getBookByAbbrev(abbrev: string): Promise<BibleBook | undefined> {
    return Array.from(this.books.values()).find(book => book.abbrev === abbrev);
  }

  async createBook(insertBook: InsertBibleBook): Promise<BibleBook> {
    const id = this.currentBookId++;
    const book: BibleBook = {
      id,
      name: insertBook.name,
      abbrev: insertBook.abbrev,
      testament: insertBook.testament,
      order: insertBook.order,
    };
    this.books.set(id, book);
    return book;
  }

  async deleteAllBooks(): Promise<boolean> {
    this.books.clear();
    this.chapters.clear();
    this.verses.clear();
    this.currentBookId = 1;
    this.currentChapterId = 1;
    this.currentVerseId = 1;
    return true;
  }

  // Bible chapter methods
  async getChaptersByBookId(bookId: number): Promise<BibleChapter[]> {
    return Array.from(this.chapters.values())
      .filter(chapter => chapter.bookId === bookId)
      .sort((a, b) => a.chapterNumber - b.chapterNumber);
  }

  async getChapter(bookId: number, chapterNumber: number): Promise<BibleChapter | undefined> {
    return Array.from(this.chapters.values()).find(
      chapter => chapter.bookId === bookId && chapter.chapterNumber === chapterNumber
    );
  }

  async createChapter(insertChapter: InsertBibleChapter): Promise<BibleChapter> {
    const id = this.currentChapterId++;
    const chapter: BibleChapter = {
      id,
      bookId: insertChapter.bookId,
      chapterNumber: insertChapter.chapterNumber,
      verseCount: insertChapter.verseCount,
    };
    this.chapters.set(id, chapter);
    return chapter;
  }

  // Bible verse methods
  async getVersesByChapterId(chapterId: number): Promise<BibleVerse[]> {
    return Array.from(this.verses.values())
      .filter(verse => verse.chapterId === chapterId)
      .sort((a, b) => a.verseNumber - b.verseNumber);
  }

  async getVerse(chapterId: number, verseNumber: number): Promise<BibleVerse | undefined> {
    return Array.from(this.verses.values()).find(
      verse => verse.chapterId === chapterId && verse.verseNumber === verseNumber
    );
  }

  async createVerse(insertVerse: InsertBibleVerse): Promise<BibleVerse> {
    const id = this.currentVerseId++;
    const verse: BibleVerse = {
      id,
      chapterId: insertVerse.chapterId,
      verseNumber: insertVerse.verseNumber,
      text: insertVerse.text,
      version: insertVerse.version || "ESV",
    };
    this.verses.set(id, verse);
    return verse;
  }

  async createVerses(insertVerses: InsertBibleVerse[]): Promise<BibleVerse[]> {
    const verses: BibleVerse[] = [];
    for (const insertVerse of insertVerses) {
      const verse = await this.createVerse(insertVerse);
      verses.push(verse);
    }
    return verses;
  }
}

export const storage = new MemStorage();
