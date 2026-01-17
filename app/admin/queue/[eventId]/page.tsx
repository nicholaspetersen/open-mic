import { redirect, notFound } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { events, signups } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { QueueDashboard } from "./QueueDashboard";
import { EventControls } from "./EventControls";

interface QueuePageProps {
  params: Promise<{ eventId: string }>;
}

export default async function QueuePage({ params }: QueuePageProps) {
  const authenticated = await isAdmin();
  if (!authenticated) {
    redirect("/admin");
  }

  const { eventId } = await params;
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

  const allSignups = await db.query.signups.findMany({
    where: eq(signups.eventId, eventIdNum),
    with: {
      song: true,
    },
    orderBy: (signups, { asc }) => [asc(signups.position)],
  });

  // Separate active queue from completed/cancelled
  const activeStatuses = ["waiting", "on_deck", "performing"];
  const activeSignups = allSignups.filter((s) => activeStatuses.includes(s.status));
  const completedSignups = allSignups.filter((s) => !activeStatuses.includes(s.status));

  // Get pending requests
  const pendingRequests = allSignups.filter(
    (s) => s.requestStatus === "pending"
  );

  return (
    <main className="max-w-4xl mx-auto p-4 pb-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{event.name}</h1>
            <p className="text-backdrop-400">
              {new Date(event.date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
              {event.venue && ` • ${event.venue}`}
            </p>
          </div>
          <EventControls event={event} />
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap gap-2 mt-4">
          <a
            href={`/join/${event.code}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-stage-400 hover:text-stage-300 underline underline-offset-2"
          >
            Performer signup →
          </a>
          <a
            href={`/band/${event.code}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-stage-400 hover:text-stage-300 underline underline-offset-2"
          >
            Band view →
          </a>
        </div>
      </div>

      {/* Dashboard */}
      <QueueDashboard
        eventId={eventIdNum}
        initialSignups={activeSignups}
        completedSignups={completedSignups}
        pendingRequests={pendingRequests}
      />
    </main>
  );
}
