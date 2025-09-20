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
]);

export type WebSocketMessage = z.infer<typeof websocketMessageSchema>;
