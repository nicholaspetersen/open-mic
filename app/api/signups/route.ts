import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signups, songs } from "@/lib/schema";
import { eq, and, max, or } from "drizzle-orm";
import { getOrCreateDevice, setDeviceCookie } from "@/lib/device";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, performerName, type, songId, requestText, notes } = body;

    // Validate required fields
    if (!eventId || !performerName || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate type
    if (!["solo", "with_band"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid performance type" },
        { status: 400 }
      );
    }

    // For with_band, must have either songId or requestText
    if (type === "with_band" && !songId && !requestText) {
      return NextResponse.json(
        { error: "Must select a song or submit a request" },
        { status: 400 }
      );
    }

    // Get device ID
    const deviceId = await getOrCreateDevice();

    // Check if device already has an active signup for this event
    const existingSignup = await db.query.signups.findFirst({
      where: and(
        eq(signups.eventId, eventId),
        eq(signups.deviceId, deviceId),
        or(
          eq(signups.status, "waiting"),
          eq(signups.status, "on_deck"),
          eq(signups.status, "performing")
        )
      ),
    });

    if (existingSignup) {
      return NextResponse.json(
        { error: "You already have an active signup for this event" },
        { status: 400 }
      );
    }

    // If songId provided, verify it exists
    if (songId) {
      const song = await db.query.songs.findFirst({
        where: eq(songs.id, songId),
      });
      if (!song) {
        return NextResponse.json(
          { error: "Selected song not found" },
          { status: 400 }
        );
      }
    }

    // Get the next position
    const maxPositionResult = await db
      .select({ maxPos: max(signups.position) })
      .from(signups)
      .where(eq(signups.eventId, eventId));
    
    const nextPosition = (maxPositionResult[0]?.maxPos ?? 0) + 1;

    // Create the signup
    const now = new Date().toISOString();
    const [newSignup] = await db
      .insert(signups)
      .values({
        eventId,
        deviceId,
        performerName: performerName.trim(),
        type,
        songId: songId || null,
        requestText: requestText?.trim() || null,
        requestStatus: requestText ? "pending" : null,
        position: nextPosition,
        status: "waiting",
        notes: notes?.trim() || null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // Set device cookie
    await setDeviceCookie(deviceId);

    return NextResponse.json({
      id: newSignup.id,
      position: nextPosition,
      requestStatus: newSignup.requestStatus,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create signup" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "Missing eventId" },
        { status: 400 }
      );
    }

    const eventSignups = await db.query.signups.findMany({
      where: eq(signups.eventId, parseInt(eventId, 10)),
      with: {
        song: true,
      },
      orderBy: (signups, { asc }) => [asc(signups.position)],
    });

    return NextResponse.json(eventSignups);
  } catch (error) {
    console.error("Get signups error:", error);
    return NextResponse.json(
      { error: "Failed to get signups" },
      { status: 500 }
    );
  }
}
