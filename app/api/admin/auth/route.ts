import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin, logoutAdmin, isAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { passcode } = body;

    if (!passcode) {
      return NextResponse.json(
        { error: "Passcode required" },
        { status: 400 }
      );
    }

    const success = await authenticateAdmin(passcode);

    if (!success) {
      return NextResponse.json(
        { error: "Invalid passcode" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await logoutAdmin();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const authenticated = await isAdmin();
    return NextResponse.json({ authenticated });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ authenticated: false });
  }
}
