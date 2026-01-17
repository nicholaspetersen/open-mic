import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Events table - represents each open mic night
export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  date: text("date").notNull(), // ISO date string
  venue: text("venue"),
  code: text("code").notNull().unique(), // Short URL-friendly code for QR
  status: text("status", { enum: ["draft", "active", "closed"] })
    .notNull()
    .default("draft"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// Songs table - the band's library
export const songs = sqliteTable("songs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  key: text("key"), // e.g., "C", "G", "Am"
  tempo: text("tempo"), // e.g., "120 BPM", "Medium"
  notes: text("notes"), // Arrangement notes, tips
  difficulty: text("difficulty", { enum: ["easy", "medium", "hard"] }).default(
    "medium"
  ),
  tags: text("tags"), // Comma-separated tags
  lastPlayedAt: text("last_played_at"),
  playCount: integer("play_count").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// Signups table - the queue entries
export const signups = sqliteTable("signups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  deviceId: text("device_id").notNull(), // For session tracking
  performerName: text("performer_name").notNull(),
  type: text("type", { enum: ["solo", "with_band"] }).notNull(),
  songId: integer("song_id").references(() => songs.id), // null if solo or request
  requestText: text("request_text"), // Custom song request
  requestStatus: text("request_status", {
    enum: ["pending", "approved", "declined"],
  }), // null if picking from library
  declineReason: text("decline_reason"),
  position: integer("position").notNull(), // Queue order
  status: text("status", {
    enum: [
      "waiting",
      "on_deck",
      "performing",
      "completed",
      "no_show",
      "cancelled",
    ],
  })
    .notNull()
    .default("waiting"),
  notes: text("notes"), // Performer notes (key, capo, etc.)
  hostNotes: text("host_notes"), // Private notes from host
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// Devices table - for session management and rate limiting
export const devices = sqliteTable("devices", {
  id: text("id").primaryKey(), // UUID
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// Relations
export const eventsRelations = relations(events, ({ many }) => ({
  signups: many(signups),
}));

export const songsRelations = relations(songs, ({ many }) => ({
  signups: many(signups),
}));

export const signupsRelations = relations(signups, ({ one }) => ({
  event: one(events, {
    fields: [signups.eventId],
    references: [events.id],
  }),
  song: one(songs, {
    fields: [signups.songId],
    references: [songs.id],
  }),
}));

// Types for use in the app
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Song = typeof songs.$inferSelect;
export type NewSong = typeof songs.$inferInsert;
export type Signup = typeof signups.$inferSelect;
export type NewSignup = typeof signups.$inferInsert;
export type Device = typeof devices.$inferSelect;
