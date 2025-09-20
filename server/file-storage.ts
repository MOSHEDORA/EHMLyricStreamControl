
import { promises as fs } from "fs";
import { join } from "path";
import { sessions, displaySettings, type Session, type InsertSession, type DisplaySettings, type InsertDisplaySettings } from "@shared/schema";
import { IStorage } from "./storage";

export class FileStorage implements IStorage {
  private dataFile: string;
  private settingsFile: string;
  private sessions: Map<string, Session>;
  private displaySettings: Map<string, DisplaySettings>;
  private currentId: number;
  private currentDisplayId: number;

  constructor(dataFile: string = "sessions.json", settingsFile: string = "display-settings.json") {
    this.dataFile = join(process.cwd(), dataFile);
    this.settingsFile = join(process.cwd(), settingsFile);
    this.sessions = new Map();
    this.displaySettings = new Map();
    this.currentId = 1;
    this.currentDisplayId = 1;
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

    // Initialize display settings
    try {
      const settingsData = await fs.readFile(this.settingsFile, "utf-8");
      const savedSettings = JSON.parse(settingsData);
      
      this.currentDisplayId = savedSettings.currentDisplayId || 1;
      this.displaySettings = new Map();
      
      for (const setting of savedSettings.displaySettings || []) {
        this.displaySettings.set(setting.id.toString(), setting);
      }
    } catch (error) {
      // File doesn't exist or is invalid, start with empty state
      console.log("No existing display settings found, starting fresh");
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

  private async saveSettingsToFile(): Promise<void> {
    const data = {
      currentDisplayId: this.currentDisplayId,
      displaySettings: Array.from(this.displaySettings.values()),
    };
    
    try {
      await fs.writeFile(this.settingsFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Failed to save display settings:", error);
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
    await this.saveSettingsToFile();
    return settings;
  }

  async updateDisplaySettings(displayType: string, settingsData: any): Promise<DisplaySettings | undefined> {
    const existingSettings = await this.getDisplaySettings(displayType);
    if (!existingSettings) {
      return undefined;
    }

    const updatedSettings: DisplaySettings = { ...existingSettings, settings: settingsData };
    this.displaySettings.set(existingSettings.id.toString(), updatedSettings);
    await this.saveSettingsToFile();
    return updatedSettings;
  }

  async deleteDisplaySettings(displayType: string): Promise<boolean> {
    const settings = await this.getDisplaySettings(displayType);
    if (!settings) {
      return false;
    }
    
    const deleted = this.displaySettings.delete(settings.id.toString());
    if (deleted) {
      await this.saveSettingsToFile();
    }
    return deleted;
  }
}
