import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { events, signups } from "@/lib/schema";
import { eq, desc, count } from "drizzle-orm";
import { Card, Badge, Button } from "@/components/ui";
import { CreateEventButton } from "./CreateEventButton";

export default async function EventsPage() {
  const authenticated = await isAdmin();
  if (!authenticated) {
    redirect("/admin");
  }

  // Get all events with signup counts
  const allEvents = await db
    .select({
      event: events,
      signupCount: count(signups.id),
    })
    .from(events)
    .leftJoin(signups, eq(events.id, signups.eventId))
    .groupBy(events.id)
    .orderBy(desc(events.date));

  const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "default" }> = {
    active: { label: "Active", variant: "success" },
    draft: { label: "Draft", variant: "warning" },
    closed: { label: "Closed", variant: "default" },
  };

  return (
    <main className="max-w-4xl mx-auto p-4 pb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <CreateEventButton />
      </div>

      {allEvents.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-backdrop-400 mb-4">No events yet</p>
          <CreateEventButton />
        </Card>
      ) : (
        <div className="space-y-3">
          {allEvents.map(({ event, signupCount }) => {
            const status = statusConfig[event.status] || statusConfig.draft;
            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });

            return (
              <Card key={event.id} className="hover:bg-backdrop-800/70 transition-colors">
                <div className="flex items-center justify-between">
                  <Link href={`/admin/queue/${event.id}`} className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="font-semibold text-lg">{event.name}</h2>
                      <Badge variant={status.variant} size="sm">
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-backdrop-400">
                      <span>{formattedDate}</span>
                      {event.venue && <span>• {event.venue}</span>}
                      <span>• {signupCount} signup{signupCount === 1 ? "" : "s"}</span>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    {event.status === "active" && (
                      <Link
                        href={`/admin/events/${event.id}/qr`}
                        className="p-2 text-backdrop-400 hover:text-stage-400 hover:bg-backdrop-700 rounded-lg transition-colors"
                        title="QR Code"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                      </Link>
                    )}
                    <Link
                      href={`/admin/queue/${event.id}`}
                      className="p-2 text-backdrop-400 hover:text-backdrop-100"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* QR Code hint */}
      {allEvents.some(({ event }) => event.status === "active") && (
        <Card variant="ghost" className="mt-8 text-center text-sm text-backdrop-500">
          <p>
            Share the QR code or link:{" "}
            <code className="bg-backdrop-800 px-2 py-1 rounded">
              {process.env.NEXT_PUBLIC_BASE_URL}/join/[code]
            </code>
          </p>
        </Card>
      )}
    </main>
  );
}
