import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signups } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getDeviceId } from "@/lib/device";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const signupId = parseInt(id, 10);

    if (isNaN(signupId)) {
      return NextResponse.json({ error: "Invalid signup ID" }, { status: 400 });
    }

    const signup = await db.query.signups.findFirst({
      where: eq(signups.id, signupId),
      with: {
        song: true,
        event: true,
      },
    });

    if (!signup) {
      return NextResponse.json({ error: "Signup not found" }, { status: 404 });
    }

    return NextResponse.json(signup);
  } catch (error) {
    console.error("Get signup error:", error);
    return NextResponse.json(
      { error: "Failed to get signup" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const signupId = parseInt(id, 10);

    if (isNaN(signupId)) {
      return NextResponse.json({ error: "Invalid signup ID" }, { status: 400 });
    }

    const body = await request.json();
    const deviceId = await getDeviceId();

    // Get the signup
    const signup = await db.query.signups.findFirst({
      where: eq(signups.id, signupId),
    });

    if (!signup) {
      return NextResponse.json({ error: "Signup not found" }, { status: 404 });
    }

    // Check ownership (device ID must match)
    if (signup.deviceId !== deviceId) {
      return NextResponse.json(
        { error: "Not authorized to edit this signup" },
        { status: 403 }
      );
    }

    // Can only edit if status is waiting
    if (signup.status !== "waiting") {
      return NextResponse.json(
        { error: "Cannot edit signup that is already being processed" },
        { status: 400 }
      );
    }

    // Update allowed fields
    const updates: Partial<typeof signups.$inferInsert> = {};
    
    if (body.performerName !== undefined) {
      updates.performerName = body.performerName.trim();
    }
    if (body.type !== undefined) {
      updates.type = body.type;
      // If switching to solo, clear song selection
      if (body.type === "solo") {
        updates.songId = null;
        updates.requestText = null;
        updates.requestStatus = null;
      }
    }
    if (body.notes !== undefined) {
      updates.notes = body.notes?.trim() || null;
    }
    if (body.songId !== undefined) {
      updates.songId = body.songId;
      updates.requestText = null;
      updates.requestStatus = null;
    }
    if (body.requestText !== undefined) {
      updates.requestText = body.requestText?.trim() || null;
      updates.songId = null;
      updates.requestStatus = body.requestText ? "pending" : null;
    }

    updates.updatedAt = new Date().toISOString();

    const [updated] = await db
      .update(signups)
      .set(updates)
      .where(eq(signups.id, signupId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update signup error:", error);
    return NextResponse.json(
      { error: "Failed to update signup" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const signupId = parseInt(id, 10);

    if (isNaN(signupId)) {
      return NextResponse.json({ error: "Invalid signup ID" }, { status: 400 });
    }

    const deviceId = await getDeviceId();

    // Get the signup
    const signup = await db.query.signups.findFirst({
      where: eq(signups.id, signupId),
    });

    if (!signup) {
      return NextResponse.json({ error: "Signup not found" }, { status: 404 });
    }

    // Check ownership
    if (signup.deviceId !== deviceId) {
      return NextResponse.json(
        { error: "Not authorized to cancel this signup" },
        { status: 403 }
      );
    }

    // Can only cancel if not already performing
    if (signup.status === "performing") {
      return NextResponse.json(
        { error: "Cannot cancel while performing" },
        { status: 400 }
      );
    }

    // Mark as cancelled
    const [updated] = await db
      .update(signups)
      .set({
        status: "cancelled",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(signups.id, signupId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Cancel signup error:", error);
    return NextResponse.json(
      { error: "Failed to cancel signup" },
      { status: 500 }
    );
  }
}
