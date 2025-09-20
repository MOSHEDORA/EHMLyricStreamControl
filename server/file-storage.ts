
import { promises as fs } from "fs";
import { join } from "path";
import { sessions, type Session, type InsertSession } from "@shared/schema";
import { IStorage } from "./storage";

export class FileStorage implements IStorage {
  private dataFile: string;
  private sessions: Map<string, Session>;
  private currentId: number;

  constructor(dataFile: string = "sessions.json") {
    this.dataFile = join(process.cwd(), dataFile);
    this.sessions = new Map();
    this.currentId = 1;
  }

  async initialize(): Promise<void> {
    try {
      const data = await fs.readFile(this.dataFile, "utf-8");
      const savedData = JSON.parse(data);
      
      this.currentId = savedData.currentId || 1;
      this.sessions = new Map();
      
      for (const session of savedData.sessions || []) {
        this.sessions.set(session.id.toString(), session);
      }
    } catch (error) {
      // File doesn't exist or is invalid, start with empty state
      console.log("No existing session data found, starting fresh");
    }
  }

  private async saveToFile(): Promise<void> {
    const data = {
      currentId: this.currentId,
      sessions: Array.from(this.sessions.values()),
    };
    
    try {
      await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Failed to save session data:", error);
    }
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
    await this.saveToFile();
    return session;
  }

  async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session | undefined> {
    const existingSession = await this.getSession(sessionId);
    if (!existingSession) {
      return undefined;
    }

    const updatedSession: Session = { ...existingSession, ...updates };
    this.sessions.set(existingSession.id.toString(), updatedSession);
    await this.saveToFile();
    return updatedSession;
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return false;
    }
    
    const deleted = this.sessions.delete(session.id.toString());
    if (deleted) {
      await this.saveToFile();
    }
    return deleted;
  }
}
