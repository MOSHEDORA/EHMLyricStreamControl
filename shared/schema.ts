import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  lyrics: text("lyrics").notNull().default(""),
  currentLine: integer("current_line").notNull().default(0),
  isPlaying: boolean("is_playing").notNull().default(false),
  autoScroll: boolean("auto_scroll").notNull().default(false),
  songTitle: text("song_title").notNull().default(""),
});

// Display settings table to store settings for each display type
export const displaySettings = pgTable("display_settings", {
  id: serial("id").primaryKey(),
  displayType: text("display_type").notNull().unique(), // lyrics-lower-third, lyrics-fullscreen, bible-lower-third, bible-fullscreen, control-panel, obs-dock
  settings: jsonb("settings").notNull(), // JSON object containing all settings for this display type
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
});

export const insertDisplaySettingsSchema = createInsertSchema(displaySettings).omit({
  id: true,
});

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertDisplaySettings = z.infer<typeof insertDisplaySettingsSchema>;
export type DisplaySettings = typeof displaySettings.$inferSelect;

// Define settings schemas for each display type
export const lyricsLowerThirdSettingsSchema = z.object({
  displayLines: z.number().min(1).max(10).default(2),
  fontSize: z.number().min(8).max(100).default(32),
  fontFamily: z.string().default('Arial'),
  textColor: z.string().default('#ffffff'),
  textAlign: z.enum(['left', 'center', 'right']).default('center'),
  lineHeight: z.number().min(0.5).max(3).default(1.2),
  fontWeight: z.enum(['normal', 'bold']).default('normal'),
  maxHeight: z.string().default('200px'),
  padding: z.number().min(0).max(100).default(20),
});

export const lyricsFullscreenSettingsSchema = z.object({
  displayLines: z.number().min(1).max(10).default(4),
  fontSize: z.number().min(8).max(100).default(48),
  fontFamily: z.string().default('Arial'),
  textColor: z.string().default('#ffffff'),
  textAlign: z.enum(['left', 'center', 'right']).default('center'),
  lineHeight: z.number().min(0.5).max(3).default(1.3),
  fontWeight: z.enum(['normal', 'bold']).default('normal'),
  textTransform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']).default('none'),
  textShadow: z.string().default('2px 2px 4px rgba(0,0,0,0.8)'),
  padding: z.number().min(0).max(100).default(40),
  margin: z.number().min(0).max(100).default(40),
});

export const bibleLowerThirdSettingsSchema = z.object({
  displayLines: z.number().min(1).max(10).default(2),
  fontSize: z.number().min(8).max(100).default(32),
  fontFamily: z.string().default('Arial'),
  textColor: z.string().default('#ffffff'),
  textAlign: z.enum(['left', 'center', 'right']).default('center'),
  lineHeight: z.number().min(0.5).max(3).default(1.2),
  fontWeight: z.enum(['normal', 'bold']).default('normal'),
  maxHeight: z.string().default('200px'),
  padding: z.number().min(0).max(100).default(20),
});

export const bibleFullscreenSettingsSchema = z.object({
  versesPerScreen: z.number().min(1).max(10).default(4),
  fontSize: z.number().min(8).max(100).default(48),
  fontFamily: z.string().default('Arial'),
  textColor: z.string().default('#ffffff'),
  textAlign: z.enum(['left', 'center', 'right']).default('center'),
  lineHeight: z.number().min(0.5).max(3).default(1.3),
  fontWeight: z.enum(['normal', 'bold']).default('normal'),
  textShadow: z.string().default('2px 2px 4px rgba(0,0,0,0.8)'),
  padding: z.number().min(0).max(100).default(40),
  margin: z.number().min(0).max(100).default(40),
});

export const controlPanelSettingsSchema = z.object({
  fontSize: z.number().min(8).max(30).default(14),
  fontFamily: z.string().default('Arial'),
  backgroundColor: z.string().default('#ffffff'),
});

export const obsDockSettingsSchema = z.object({
  fontSize: z.number().min(8).max(30).default(14),
  fontFamily: z.string().default('Arial'),
  compactMode: z.boolean().default(false),
});

export type LyricsLowerThirdSettings = z.infer<typeof lyricsLowerThirdSettingsSchema>;
export type LyricsFullscreenSettings = z.infer<typeof lyricsFullscreenSettingsSchema>;
export type BibleLowerThirdSettings = z.infer<typeof bibleLowerThirdSettingsSchema>;
export type BibleFullscreenSettings = z.infer<typeof bibleFullscreenSettingsSchema>;
export type ControlPanelSettings = z.infer<typeof controlPanelSettingsSchema>;
export type OBSDockSettings = z.infer<typeof obsDockSettingsSchema>;

// WebSocket message types
export const websocketMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("update_lyrics"),
    payload: z.object({
      lyrics: z.string(),
      songTitle: z.string().optional(),
    }),
  }),
  z.object({
    type: z.literal("update_position"),
    payload: z.object({
      currentLine: z.number(),
    }),
  }),
  z.object({
    type: z.literal("toggle_play"),
    payload: z.object({
      isPlaying: z.boolean(),
    }),
  }),
  z.object({
    type: z.literal("navigation"),
    payload: z.object({
      action: z.enum(["next", "previous", "first", "last", "jump"]),
      line: z.number().optional(),
    }),
  }),
  z.object({
    type: z.literal("request_state"),
    payload: z.object({
      session: z.custom<Session>(),
      lyricsArray: z.array(z.string()),
      totalLines: z.number(),
    }),
  }),
  z.object({
    type: z.literal("state_update"),
    payload: z.object({
      session: z.custom<Session>(),
      lyricsArray: z.array(z.string()),
      totalLines: z.number(),
    }),
  }),
  z.object({
    type: z.literal("settings_update"),
    payload: z.object({
      displayType: z.string(),
      settings: z.unknown(), // Will be validated by display-specific schemas
    }),
  }),
]);

export type WebSocketMessage = z.infer<typeof websocketMessageSchema>;
