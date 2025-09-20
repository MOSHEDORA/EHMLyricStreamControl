import { sessions, displaySettings, type Session, type InsertSession, type DisplaySettings, type InsertDisplaySettings } from "@shared/schema";
import { FileStorage } from "./file-storage";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getSession(sessionId: string): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(sessionId: string, updates: Partial<Session>): Promise<Session | undefined>;
  deleteSession(sessionId: string): Promise<boolean>;
  
  // Display settings methods
  getDisplaySettings(displayType: string): Promise<DisplaySettings | undefined>;
  createDisplaySettings(settings: InsertDisplaySettings): Promise<DisplaySettings>;
  updateDisplaySettings(displayType: string, settings: any): Promise<DisplaySettings | undefined>;
  deleteDisplaySettings(displayType: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, Session>;
  private displaySettings: Map<string, DisplaySettings>;
  private currentId: number;
  private currentDisplayId: number;

  constructor() {
    this.sessions = new Map();
    this.displaySettings = new Map();
    this.currentId = 1;
    this.currentDisplayId = 1;
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
      isPlaying: insertSession.isPlaying || false,
      autoScroll: insertSession.autoScroll || false,
      songTitle: insertSession.songTitle || "",
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

  async getDisplaySettings(displayType: string): Promise<DisplaySettings | undefined> {
    return Array.from(this.displaySettings.values()).find(
      (setting) => setting.displayType === displayType,
    );
  }

  async createDisplaySettings(insertSettings: InsertDisplaySettings): Promise<DisplaySettings> {
    const id = this.currentDisplayId++;
    const settings: DisplaySettings = {
      id,
      displayType: insertSettings.displayType,
      settings: insertSettings.settings,
    };
    this.displaySettings.set(id.toString(), settings);
    return settings;
  }

  async updateDisplaySettings(displayType: string, settingsData: any): Promise<DisplaySettings | undefined> {
    const existingSettings = await this.getDisplaySettings(displayType);
    if (!existingSettings) {
      return undefined;
    }

    const updatedSettings: DisplaySettings = { ...existingSettings, settings: settingsData };
    this.displaySettings.set(existingSettings.id.toString(), updatedSettings);
    return updatedSettings;
  }

  async deleteDisplaySettings(displayType: string): Promise<boolean> {
    const settings = await this.getDisplaySettings(displayType);
    if (!settings) {
      return false;
    }

    return this.displaySettings.delete(settings.id.toString());
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

  async getDisplaySettings(displayType: string): Promise<DisplaySettings | undefined> {
    const [settings] = await db.select().from(displaySettings).where(eq(displaySettings.displayType, displayType));
    return settings || undefined;
  }

  async createDisplaySettings(insertSettings: InsertDisplaySettings): Promise<DisplaySettings> {
    const [settings] = await db
      .insert(displaySettings)
      .values(insertSettings)
      .returning();
    return settings;
  }

  async updateDisplaySettings(displayType: string, settingsData: any): Promise<DisplaySettings | undefined> {
    const [updatedSettings] = await db
      .update(displaySettings)
      .set({ settings: settingsData })
      .where(eq(displaySettings.displayType, displayType))
      .returning();
    return updatedSettings || undefined;
  }

  async deleteDisplaySettings(displayType: string): Promise<boolean> {
    const result = await db
      .delete(displaySettings)
      .where(eq(displaySettings.displayType, displayType));
    return (result.rowCount ?? 0) > 0;
  }
}

// Use file storage for persistence (database storage has WebSocket connectivity issues in current environment)
export const storage = new FileStorage();

// Initialize storage on startup
export async function initializeStorage() {
  await (storage as FileStorage).initialize();
}