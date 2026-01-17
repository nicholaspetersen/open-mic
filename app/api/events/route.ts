import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const allEvents = await db.query.events.findMany({
      orderBy: (events, { desc }) => [desc(events.date)],
    });

    return NextResponse.json(allEvents);
  } catch (error) {
    console.error("Get events error:", error);
    return NextResponse.json(
      { error: "Failed to get events" },
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
    const { name, venue, date, code } = body;

    if (!name || !date || !code) {
      return NextResponse.json(
        { error: "Name, date, and code are required" },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existing = await db.query.events.findFirst({
      where: eq(events.code, code),
    });

    if (existing) {
      return NextResponse.json(
        { error: "Event code already exists" },
        { status: 400 }
      );
    }

    const [newEvent] = await db
      .insert(events)
      .values({
        name,
        venue: venue || null,
        date,
        code,
        status: "draft",
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newEvent);
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
