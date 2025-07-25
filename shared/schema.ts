import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  lyrics: text("lyrics").notNull().default(""),
  currentLine: integer("current_line").notNull().default(0),
  displayLines: integer("display_lines").notNull().default(2),
  fontSize: integer("font_size").notNull().default(32),
  fontFamily: text("font_family").notNull().default("Arial"),
  textColor: text("text_color").notNull().default("#ffffff"),
  textAlign: text("text_align").notNull().default("center"),
  showBackground: boolean("show_background").notNull().default(false),
  backgroundColor: text("background_color").notNull().default("#000000"),
  backgroundOpacity: integer("background_opacity").notNull().default(50),
  isPlaying: boolean("is_playing").notNull().default(false),
  autoScroll: boolean("auto_scroll").notNull().default(false),
  songTitle: text("song_title").notNull().default(""),
  
  // Separate display settings
  separateDisplaySettings: boolean("separate_display_settings").notNull().default(false),
  
  // Lower third specific settings
  lowerThirdDisplayLines: integer("lower_third_display_lines").notNull().default(2),
  lowerThirdFontSize: integer("lower_third_font_size").notNull().default(32),
  lowerThirdFontFamily: text("lower_third_font_family").notNull().default("Arial"),
  lowerThirdTextColor: text("lower_third_text_color").notNull().default("#ffffff"),
  lowerThirdTextAlign: text("lower_third_text_align").notNull().default("center"),
  lowerThirdShowBackground: boolean("lower_third_show_background").notNull().default(false),
  lowerThirdBackgroundColor: text("lower_third_background_color").notNull().default("#000000"),
  lowerThirdBackgroundOpacity: integer("lower_third_background_opacity").notNull().default(50),
  
  // Fullscreen specific settings
  fullscreenDisplayLines: integer("fullscreen_display_lines").notNull().default(2),
  fullscreenFontSize: integer("fullscreen_font_size").notNull().default(32),
  fullscreenFontFamily: text("fullscreen_font_family").notNull().default("Arial"),
  fullscreenTextColor: text("fullscreen_text_color").notNull().default("#ffffff"),
  fullscreenTextAlign: text("fullscreen_text_align").notNull().default("center"),
  fullscreenShowBackground: boolean("fullscreen_show_background").notNull().default(false),
  fullscreenBackgroundColor: text("fullscreen_background_color").notNull().default("#000000"),
  fullscreenBackgroundOpacity: integer("fullscreen_background_opacity").notNull().default(50),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
});

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

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
    type: z.literal("update_settings"),
    payload: z.object({
      displayLines: z.number().optional(),
      fontSize: z.number().optional(),
      fontFamily: z.string().optional(),
      textColor: z.string().optional(),
      textAlign: z.string().optional(),
      showBackground: z.boolean().optional(),
      backgroundColor: z.string().optional(),
      backgroundOpacity: z.number().optional(),
      separateDisplaySettings: z.boolean().optional(),
      displayType: z.enum(["unified", "lower-third", "fullscreen"]).optional(),
      
      // Lower third specific updates
      lowerThirdDisplayLines: z.number().optional(),
      lowerThirdFontSize: z.number().optional(),
      lowerThirdFontFamily: z.string().optional(),
      lowerThirdTextColor: z.string().optional(),
      lowerThirdTextAlign: z.string().optional(),
      lowerThirdShowBackground: z.boolean().optional(),
      lowerThirdBackgroundColor: z.string().optional(),
      lowerThirdBackgroundOpacity: z.number().optional(),
      
      // Fullscreen specific updates
      fullscreenDisplayLines: z.number().optional(),
      fullscreenFontSize: z.number().optional(),
      fullscreenFontFamily: z.string().optional(),
      fullscreenTextColor: z.string().optional(),
      fullscreenTextAlign: z.string().optional(),
      fullscreenShowBackground: z.boolean().optional(),
      fullscreenBackgroundColor: z.string().optional(),
      fullscreenBackgroundOpacity: z.number().optional(),
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
    payload: z.object({}),
  }),
  z.object({
    type: z.literal("state_update"),
    payload: z.object({
      session: z.custom<Session>(),
      lyricsArray: z.array(z.string()),
      totalLines: z.number(),
    }),
  }),
]);

export type WebSocketMessage = z.infer<typeof websocketMessageSchema>;
