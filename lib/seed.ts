import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { events, songs } from "./schema";

// Sample song library - a mix of popular covers for a bar band
const sampleSongs = [
  // Classic Rock
  { title: "Sweet Home Alabama", artist: "Lynyrd Skynyrd", key: "G", difficulty: "easy" as const, tags: "rock,classic,crowd-pleaser" },
  { title: "Brown Eyed Girl", artist: "Van Morrison", key: "G", difficulty: "easy" as const, tags: "rock,classic,crowd-pleaser" },
  { title: "Wagon Wheel", artist: "Old Crow Medicine Show", key: "A", difficulty: "easy" as const, tags: "country,folk,crowd-pleaser" },
  { title: "Take It Easy", artist: "Eagles", key: "G", difficulty: "easy" as const, tags: "rock,classic" },
  { title: "Free Fallin'", artist: "Tom Petty", key: "F", difficulty: "easy" as const, tags: "rock,classic" },
  
  // Blues/Soul
  { title: "Pride and Joy", artist: "Stevie Ray Vaughan", key: "E", tempo: "Medium shuffle", difficulty: "medium" as const, tags: "blues" },
  { title: "The Thrill Is Gone", artist: "B.B. King", key: "Bm", difficulty: "medium" as const, tags: "blues" },
  { title: "Mustang Sally", artist: "Wilson Pickett", key: "C", difficulty: "easy" as const, tags: "soul,crowd-pleaser" },
  
  // Country
  { title: "Folsom Prison Blues", artist: "Johnny Cash", key: "E", difficulty: "easy" as const, tags: "country,classic" },
  { title: "Ring of Fire", artist: "Johnny Cash", key: "G", difficulty: "easy" as const, tags: "country,classic" },
  { title: "Friends in Low Places", artist: "Garth Brooks", key: "A", difficulty: "easy" as const, tags: "country,crowd-pleaser" },
  { title: "Chattahoochee", artist: "Alan Jackson", key: "C", difficulty: "medium" as const, tags: "country" },
  
  // Pop/Rock
  { title: "Wonderwall", artist: "Oasis", key: "Em", difficulty: "easy" as const, tags: "90s,pop,crowd-pleaser" },
  { title: "Mr. Brightside", artist: "The Killers", key: "Db", difficulty: "medium" as const, tags: "2000s,rock" },
  { title: "Valerie", artist: "Amy Winehouse", key: "Eb", difficulty: "medium" as const, tags: "soul,pop" },
  { title: "Use Somebody", artist: "Kings of Leon", key: "C", difficulty: "easy" as const, tags: "rock,2000s" },
  { title: "Ho Hey", artist: "The Lumineers", key: "C", difficulty: "easy" as const, tags: "folk,indie" },
  
  // Acoustic Favorites  
  { title: "Hallelujah", artist: "Leonard Cohen", key: "C", difficulty: "medium" as const, tags: "ballad,acoustic" },
  { title: "Fast Car", artist: "Tracy Chapman", key: "A", difficulty: "medium" as const, tags: "folk,acoustic" },
  { title: "Wish You Were Here", artist: "Pink Floyd", key: "G", difficulty: "medium" as const, tags: "rock,acoustic" },
  
  // Fun/Party
  { title: "Livin' on a Prayer", artist: "Bon Jovi", key: "Em", difficulty: "medium" as const, tags: "rock,80s,crowd-pleaser" },
  { title: "Don't Stop Believin'", artist: "Journey", key: "E", difficulty: "medium" as const, tags: "rock,80s,crowd-pleaser" },
  { title: "Summer of '69", artist: "Bryan Adams", key: "D", difficulty: "easy" as const, tags: "rock,80s" },
  { title: "I Love Rock 'n' Roll", artist: "Joan Jett", key: "E", difficulty: "easy" as const, tags: "rock,80s" },
  
  // Modern
  { title: "Shallow", artist: "Lady Gaga & Bradley Cooper", key: "G", difficulty: "medium" as const, tags: "ballad,modern" },
  { title: "Riptide", artist: "Vance Joy", key: "Am", difficulty: "easy" as const, tags: "indie,modern" },
  { title: "Let Her Go", artist: "Passenger", key: "G", difficulty: "easy" as const, tags: "folk,modern" },
  { title: "Thinking Out Loud", artist: "Ed Sheeran", key: "D", difficulty: "medium" as const, tags: "ballad,modern" },
  
  // Jazz Standards
  { title: "Fly Me to the Moon", artist: "Frank Sinatra", key: "C", difficulty: "medium" as const, tags: "jazz,standard" },
  { title: "What a Wonderful World", artist: "Louis Armstrong", key: "F", difficulty: "easy" as const, tags: "jazz,standard" },
];

async function seed() {
  console.log("🌱 Starting seed...");
  
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL || "file:./local.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  
  const db = drizzle(client);
  
  // Create tables if they don't exist
  console.log("📦 Creating tables...");
  await client.execute(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      venue TEXT,
      code TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL
    )
  `);
  
  await client.execute(`
    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      key TEXT,
      tempo TEXT,
      notes TEXT,
      difficulty TEXT DEFAULT 'medium',
      tags TEXT,
      last_played_at TEXT,
      play_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);
  
  await client.execute(`
    CREATE TABLE IF NOT EXISTS signups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      device_id TEXT NOT NULL,
      performer_name TEXT NOT NULL,
      type TEXT NOT NULL,
      song_id INTEGER REFERENCES songs(id),
      request_text TEXT,
      request_status TEXT,
      decline_reason TEXT,
      position INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'waiting',
      notes TEXT,
      host_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  
  await client.execute(`
    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL
    )
  `);
  
  // Insert sample event
  console.log("🎤 Creating sample event...");
  const now = new Date().toISOString();
  await db.insert(events).values({
    name: "Friday Night Open Mic",
    date: new Date().toISOString().split("T")[0],
    venue: "The Local Bar",
    code: "friday",
    status: "active",
    createdAt: now,
  }).onConflictDoNothing();
  
  // Insert sample songs
  console.log("🎵 Inserting song library...");
  for (const song of sampleSongs) {
    await db.insert(songs).values({
      ...song,
      createdAt: now,
    }).onConflictDoNothing();
  }
  
  console.log(`✅ Seeded ${sampleSongs.length} songs and 1 event`);
  console.log("🔗 Event code: friday (access at /join/friday)");
  
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
