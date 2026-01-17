import { db } from "@/lib/db";
import { events, signups } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SignupForm } from "./SignupForm";

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
    <main className="min-h-dvh p-4 pb-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <header className="text-center pt-4 pb-6">
          <h1 className="text-2xl font-bold mb-1">
            {existingSignup ? "Edit Your Signup" : "Sign Up to Perform"}
          </h1>
          <p className="text-backdrop-400">{event.name}</p>
        </header>

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
