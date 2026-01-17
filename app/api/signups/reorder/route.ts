import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signups } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAdmin();
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { eventId, signupIds } = body;

    if (!eventId || !Array.isArray(signupIds)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Update positions
    const now = new Date().toISOString();
    
    for (let i = 0; i < signupIds.length; i++) {
      await db
        .update(signups)
        .set({
          position: i + 1,
          updatedAt: now,
        })
        .where(eq(signups.id, signupIds[i]));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder error:", error);
    return NextResponse.json(
      { error: "Failed to reorder queue" },
      { status: 500 }
    );
  }
}
