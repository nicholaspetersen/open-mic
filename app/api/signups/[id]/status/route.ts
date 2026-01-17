import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signups, songs } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authenticated = await isAdmin();
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const signupId = parseInt(id, 10);

    if (isNaN(signupId)) {
      return NextResponse.json({ error: "Invalid signup ID" }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    const validStatuses = [
      "waiting",
      "on_deck",
      "performing",
      "completed",
      "no_show",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const signup = await db.query.signups.findFirst({
      where: eq(signups.id, signupId),
      with: { song: true },
    });

    if (!signup) {
      return NextResponse.json({ error: "Signup not found" }, { status: 404 });
    }

    // Update signup status
    const [updated] = await db
      .update(signups)
      .set({
        status,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(signups.id, signupId))
      .returning();

    // If completed and has a song, update song play count
    if (status === "completed" && signup.songId) {
      await db
        .update(songs)
        .set({
          playCount: (signup.song?.playCount || 0) + 1,
          lastPlayedAt: new Date().toISOString(),
        })
        .where(eq(songs.id, signup.songId));
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update status error:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
