import { db } from "@/lib/db";
import { events, signups } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SignupForm } from "./SignupForm";

// Color constants from Figma
const COLORS = {
  yellow: "#FAC515",
  bg: "#0A0D12",
  border: "#252B37",
  gray: "#A4A7AE",
  white: "#FFFFFF",
};

interface SignupPageProps {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ edit?: string }>;
}

export default async function SignupPage({ params, searchParams }: SignupPageProps) {
  const { eventId } = await params;
  const { edit: editId } = await searchParams;
  const eventIdNum = parseInt(eventId, 10);

  if (isNaN(eventIdNum)) {
    notFound();
  }

  const event = await db.query.events.findFirst({
    where: eq(events.id, eventIdNum),
  });

  if (!event) {
    notFound();
  }

  if (event.status !== "active") {
    redirect(`/join/${event.code}`);
  }

  // Get all songs for the picker
  const allSongs = await db.query.songs.findMany({
    orderBy: (songs, { asc }) => [asc(songs.artist), asc(songs.title)],
  });

  // If editing, get the existing signup
  let existingSignup = null;
  if (editId) {
    const cookieStore = await cookies();
    const deviceId = cookieStore.get("device_id")?.value;

    if (deviceId) {
      existingSignup = await db.query.signups.findFirst({
        where: and(
          eq(signups.id, parseInt(editId, 10)),
          eq(signups.deviceId, deviceId),
          eq(signups.status, "waiting")
        ),
        with: {
          song: true,
        },
      });
    }

    // If trying to edit but signup not found or not owned, redirect
    if (!existingSignup) {
      redirect(`/join/${event.code}`);
    }
  }

  return (
    <main className="min-h-dvh" style={{ background: COLORS.bg }}>
      {/* Header */}
      <header className="px-4 py-3" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
        <p className="font-bold text-lg uppercase tracking-tight" style={{ color: COLORS.yellow }}>Open Mic</p>
      </header>

      <div className="max-w-lg mx-auto p-4 pb-8">
        {/* Title */}
        <div className="pt-2 pb-6">
          <h1 
            className="text-2xl font-bold uppercase tracking-tight mb-1"
            style={{ color: COLORS.white }}
          >
            {existingSignup ? "Edit Your Signup" : "Sign Up to Perform"}
          </h1>
          <p style={{ color: COLORS.gray }}>{event.name}</p>
        </div>

        <SignupForm
          eventId={event.id}
          eventCode={event.code}
          songs={allSongs}
          existingSignup={existingSignup}
        />
      </div>
    </main>
  );
}
