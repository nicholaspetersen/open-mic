import { db } from "@/lib/db";
import { events, signups } from "@/lib/schema";
import { eq, and, or } from "drizzle-orm";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { PerformerView } from "./PerformerView";

interface JoinPageProps {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ signedup?: string }>;
}

export default async function JoinPage({ params, searchParams }: JoinPageProps) {
  const { code } = await params;
  const { signedup } = await searchParams;

  // Find the event by code
  const event = await db.query.events.findFirst({
    where: eq(events.code, code),
  });

  if (!event) {
    notFound();
  }

  // Get device ID from cookie
  const cookieStore = await cookies();
  const deviceId = cookieStore.get("device_id")?.value;

  // Get all active signups for this event
  const allSignups = await db.query.signups.findMany({
    where: and(
      eq(signups.eventId, event.id),
      or(
        eq(signups.status, "waiting"),
        eq(signups.status, "on_deck"),
        eq(signups.status, "performing")
      )
    ),
    with: {
      song: true,
    },
    orderBy: (signups, { asc }) => [asc(signups.position)],
  });

  // Get completed signups
  const completedSignups = await db.query.signups.findMany({
    where: and(
      eq(signups.eventId, event.id),
      or(
        eq(signups.status, "completed"),
        eq(signups.status, "no_show")
      )
    ),
    with: {
      song: true,
    },
    orderBy: (signups, { desc }) => [desc(signups.updatedAt)],
  });

  // Find user's own active signups
  const mySignups = deviceId
    ? allSignups.filter((s) => s.deviceId === deviceId)
    : [];

  // Separate by status
  const currentPerformer = allSignups.find((s) => s.status === "performing");
  const onDeck = allSignups.find((s) => s.status === "on_deck");
  const waitingQueue = allSignups.filter((s) => s.status === "waiting");

  return (
    <PerformerView
      event={event}
      currentPerformer={currentPerformer || null}
      onDeck={onDeck || null}
      queue={waitingQueue}
      completedSignups={completedSignups}
      mySignups={mySignups}
      justSignedUp={signedup === "true"}
    />
  );
}
