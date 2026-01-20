import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { events, signups } from "@/lib/schema";
import { eq, desc, count } from "drizzle-orm";
import { Card, Badge } from "@/components/ui";
import { CreateEventButton } from "./CreateEventButton";

// Color constants from Figma
const COLORS = {
  yellow: "#FAC515",
  bg: "#0A0D12",
  card: "#181D27",
  border: "#252B37",
  gray: "#A4A7AE",
  white: "#FFFFFF",
};

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
    <main className="max-w-4xl mx-auto p-4 pb-8" style={{ background: COLORS.bg }}>
      <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
        <h1 className="text-3xl font-bold" style={{ color: COLORS.white }}>Events</h1>
        <CreateEventButton />
      </div>

      {allEvents.length === 0 ? (
        <Card className="text-center py-12">
          <p className="mb-4" style={{ color: COLORS.gray }}>No events yet</p>
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
              <Card key={event.id}>
                <div className="flex items-center justify-between">
                  <Link href={`/admin/queue/${event.id}`} className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="font-bold text-lg" style={{ color: COLORS.white }}>{event.name}</h2>
                      <Badge variant={status.variant} size="sm">
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm" style={{ color: COLORS.gray }}>
                      <span>{formattedDate}</span>
                      {event.venue && <span>• {event.venue}</span>}
                      <span>• {signupCount} signup{signupCount === 1 ? "" : "s"}</span>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    {event.status === "active" && (
                      <Link
                        href={`/admin/events/${event.id}/qr`}
                        className="p-2 transition-colors"
                        title="QR Code"
                        style={{ color: COLORS.gray }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                      </Link>
                    )}
                    <Link
                      href={`/admin/events/${event.id}/edit`}
                      className="p-2 transition-colors"
                      title="Edit Event"
                      style={{ color: COLORS.gray }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <Link
                      href={`/admin/queue/${event.id}`}
                      className="p-2"
                      style={{ color: COLORS.gray }}
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
        <Card variant="ghost" className="mt-8 text-center text-sm" style={{ color: COLORS.gray }}>
          <p>
            Share the QR code or link:{" "}
            <code className="px-2 py-1" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }}>
              {process.env.NEXT_PUBLIC_BASE_URL}/join/[code]
            </code>
          </p>
        </Card>
      )}
    </main>
  );
}
