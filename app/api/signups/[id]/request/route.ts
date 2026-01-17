import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signups } from "@/lib/schema";
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
    const { requestStatus, declineReason } = body;

    if (!["pending", "approved", "declined"].includes(requestStatus)) {
      return NextResponse.json(
        { error: "Invalid request status" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(signups)
      .set({
        requestStatus,
        declineReason: requestStatus === "declined" ? declineReason : null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(signups.id, signupId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update request error:", error);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}
