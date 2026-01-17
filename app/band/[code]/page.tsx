import { db } from "@/lib/db";
import { events, signups } from "@/lib/schema";
import { eq, and, or, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { BandDisplay } from "./BandDisplay";

interface BandPageProps {
  params: Promise<{ code: string }>;
}

export default async function BandPage({ params }: BandPageProps) {
  const { code } = await params;

  const event = await db.query.events.findFirst({
    where: eq(events.code, code),
  });

  if (!event) {
    notFound();
  }

  // Get current and on-deck performers
  const relevantSignups = await db.query.signups.findMany({
    where: and(
      eq(signups.eventId, event.id),
      or(
        eq(signups.status, "performing"),
        eq(signups.status, "on_deck"),
        eq(signups.status, "waiting")
      )
    ),
    with: {
      song: true,
    },
    orderBy: (signups, { asc }) => [asc(signups.position)],
  });

  const currentPerformer = relevantSignups.find((s) => s.status === "performing");
  const onDeck = relevantSignups.find((s) => s.status === "on_deck");
  const upNext = relevantSignups.filter((s) => s.status === "waiting").slice(0, 3);
  const totalWaiting = relevantSignups.filter((s) => s.status === "waiting").length;

  return (
    <BandDisplay
      eventId={event.id}
      eventName={event.name}
      currentPerformer={currentPerformer || null}
      onDeck={onDeck || null}
      upNext={upNext}
      totalWaiting={totalWaiting}
    />
  );
}
