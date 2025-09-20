import { sessions, type Session, type InsertSession } from "@shared/schema";
import { FileStorage } from "./file-storage";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getSession(sessionId: string): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(sessionId: string, updates: Partial<Session>): Promise<Session | undefined>;
  deleteSession(sessionId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, Session>;
  private currentId: number;

  constructor() {
    this.sessions = new Map();
    this.currentId = 1;
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
      bibleOutputEnabled: insertSession.bibleOutputEnabled !== undefined ? insertSession.bibleOutputEnabled : false,
      lyricsOutputEnabled: insertSession.lyricsOutputEnabled !== undefined ? insertSession.lyricsOutputEnabled : true,
      lowerThirdOutputEnabled: insertSession.lowerThirdOutputEnabled !== undefined ? insertSession.lowerThirdOutputEnabled : true,
      fullscreenOutputEnabled: insertSession.fullscreenOutputEnabled !== undefined ? insertSession.fullscreenOutputEnabled : true,
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
}

// Reference: blueprint:javascript_database - Database storage implementation
export class DatabaseStorage implements IStorage {
  async getSession(sessionId: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.sessionId, sessionId));
    return session || undefined;
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db
      .insert(sessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session | undefined> {
    const [updatedSession] = await db
      .update(sessions)
      .set(updates)
      .where(eq(sessions.sessionId, sessionId))
      .returning();
    return updatedSession || undefined;
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const result = await db
      .delete(sessions)
      .where(eq(sessions.sessionId, sessionId));
    return (result.rowCount ?? 0) > 0;
  }
}

// Use file storage for persistence (database storage has WebSocket connectivity issues in current environment)
export const storage = new FileStorage();

// Initialize storage on startup
export async function initializeStorage() {
  await (storage as FileStorage).initialize();
}