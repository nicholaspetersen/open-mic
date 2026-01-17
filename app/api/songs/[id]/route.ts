import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { songs } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const songId = parseInt(id, 10);

    if (isNaN(songId)) {
      return NextResponse.json({ error: "Invalid song ID" }, { status: 400 });
    }

    const song = await db.query.songs.findFirst({
      where: eq(songs.id, songId),
    });

    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    return NextResponse.json(song);
  } catch (error) {
    console.error("Get song error:", error);
    return NextResponse.json(
      { error: "Failed to get song" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authenticated = await isAdmin();
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const songId = parseInt(id, 10);

    if (isNaN(songId)) {
      return NextResponse.json({ error: "Invalid song ID" }, { status: 400 });
    }

    const body = await request.json();
    const updates: Partial<typeof songs.$inferInsert> = {};

    if (body.title !== undefined) updates.title = body.title;
    if (body.artist !== undefined) updates.artist = body.artist;
    if (body.key !== undefined) updates.key = body.key;
    if (body.tempo !== undefined) updates.tempo = body.tempo;
    if (body.difficulty !== undefined) updates.difficulty = body.difficulty;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.tags !== undefined) updates.tags = body.tags;

    const [updated] = await db
      .update(songs)
      .set(updates)
      .where(eq(songs.id, songId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update song error:", error);
    return NextResponse.json(
      { error: "Failed to update song" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authenticated = await isAdmin();
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const songId = parseInt(id, 10);

    if (isNaN(songId)) {
      return NextResponse.json({ error: "Invalid song ID" }, { status: 400 });
    }

    await db.delete(songs).where(eq(songs.id, songId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete song error:", error);
    return NextResponse.json(
      { error: "Failed to delete song" },
      { status: 500 }
    );
  }
}
