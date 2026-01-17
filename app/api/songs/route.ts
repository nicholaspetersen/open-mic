import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { songs } from "@/lib/schema";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const allSongs = await db.query.songs.findMany({
      orderBy: (songs, { asc }) => [asc(songs.artist), asc(songs.title)],
    });

    return NextResponse.json(allSongs);
  } catch (error) {
    console.error("Get songs error:", error);
    return NextResponse.json(
      { error: "Failed to get songs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAdmin();
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, artist, key, tempo, difficulty, notes, tags } = body;

    if (!title || !artist) {
      return NextResponse.json(
        { error: "Title and artist are required" },
        { status: 400 }
      );
    }

    const [newSong] = await db
      .insert(songs)
      .values({
        title,
        artist,
        key: key || null,
        tempo: tempo || null,
        difficulty: difficulty || "medium",
        notes: notes || null,
        tags: tags || null,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newSong);
  } catch (error) {
    console.error("Create song error:", error);
    return NextResponse.json(
      { error: "Failed to create song" },
      { status: 500 }
    );
  }
}
