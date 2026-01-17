import { db } from "@/lib/db";
import { events, signups } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button, Card, Badge } from "@/components/ui";
import { CancelButton } from "./CancelButton";

interface MyStatusPageProps {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ new?: string; position?: string }>;
}

export default async function MyStatusPage({
  params,
  searchParams,
}: MyStatusPageProps) {
  const { eventId } = await params;
  const { new: isNew, position: newPosition } = await searchParams;
  const eventIdNum = parseInt(eventId, 10);

  if (isNaN(eventIdNum)) {
    notFound();
  }

  // Get device ID from cookie
  const cookieStore = await cookies();
  const deviceId = cookieStore.get("device_id")?.value;

  if (!deviceId) {
    redirect(`/join/${eventId}`);
  }

  // Get event
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventIdNum),
  });

  if (!event) {
    notFound();
  }

  // Get user's signup for this event
  const mySignup = await db.query.signups.findFirst({
    where: and(
      eq(signups.eventId, eventIdNum),
      eq(signups.deviceId, deviceId)
    ),
    with: {
      song: true,
    },
    orderBy: (signups, { desc }) => [desc(signups.createdAt)],
  });

  // If no signup found, redirect to signup page
  if (!mySignup || mySignup.status === "cancelled") {
    redirect(`/signup/${eventIdNum}`);
  }

  // Get queue position (count of waiting signups ahead)
  const allSignups = await db.query.signups.findMany({
    where: and(
      eq(signups.eventId, eventIdNum),
    ),
    orderBy: (signups, { asc }) => [asc(signups.position)],
  });

  const activeSignups = allSignups.filter(
    (s) => s.status === "waiting" || s.status === "on_deck" || s.status === "performing"
  );
  
  const myPosition = activeSignups.findIndex((s) => s.id === mySignup.id) + 1;
  const totalInQueue = activeSignups.filter((s) => s.status === "waiting").length;

  // Status display config
  const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "error" | "info" | "default" }> = {
    waiting: { label: "In Queue", variant: "default" },
    on_deck: { label: "On Deck - Get Ready!", variant: "warning" },
    performing: { label: "You're On!", variant: "success" },
    completed: { label: "Done", variant: "success" },
    no_show: { label: "No Show", variant: "error" },
    cancelled: { label: "Cancelled", variant: "error" },
  };

  const currentStatus = statusConfig[mySignup.status] || statusConfig.waiting;

  return (
    <main className="min-h-dvh p-4 pb-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <header className="text-center pt-4 pb-6">
          <Link
            href={`/join/${event.code}`}
            className="text-backdrop-400 hover:text-backdrop-200 transition-colors"
          >
            ← {event.name}
          </Link>
        </header>

        {/* New signup celebration */}
        {isNew && (
          <Card variant="highlight" className="mb-6 text-center animate-slide-up">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="text-xl font-bold mb-1">You&apos;re signed up!</h2>
            <p className="text-backdrop-300">
              You&apos;re #{newPosition || myPosition} in line
            </p>
          </Card>
        )}

        {/* Status Card */}
        <Card className="mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-backdrop-500">Your Status</p>
              <h2 className="text-2xl font-bold">{mySignup.performerName}</h2>
            </div>
            <Badge variant={currentStatus.variant} size="md">
              {currentStatus.label}
            </Badge>
          </div>

          {/* Position in queue */}
          {mySignup.status === "waiting" && myPosition > 0 && (
            <div className="bg-backdrop-900/50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-backdrop-400">Queue Position</span>
                <span className="text-3xl font-bold text-stage-400">
                  #{myPosition}
                </span>
              </div>
              <p className="text-sm text-backdrop-500 mt-1">
                {myPosition === 1
                  ? "You're next!"
                  : `${myPosition - 1} performer${myPosition - 1 === 1 ? "" : "s"} ahead of you`}
              </p>
            </div>
          )}

          {/* On deck alert */}
          {mySignup.status === "on_deck" && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4 animate-pulse-glow">
              <div className="flex items-center gap-3">
                <svg
                  className="w-8 h-8 text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <div>
                  <p className="font-bold text-amber-400">Get ready!</p>
                  <p className="text-sm text-amber-400/80">
                    Head toward the stage - you're up next!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Performing alert */}
          {mySignup.status === "performing" && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <svg
                  className="w-8 h-8 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
                <div>
                  <p className="font-bold text-green-400">You're on stage!</p>
                  <p className="text-sm text-green-400/80">
                    Rock it! 🎸
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Song/Performance details */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-backdrop-500">Performance</span>
              <span className="capitalize">
                {mySignup.type === "with_band" ? "With Band" : "Solo"}
              </span>
            </div>

            {mySignup.song && (
              <div className="flex justify-between">
                <span className="text-backdrop-500">Song</span>
                <span className="text-right">
                  {mySignup.song.title}
                  <span className="text-backdrop-500 block text-sm">
                    {mySignup.song.artist}
                  </span>
                </span>
              </div>
            )}

            {mySignup.requestText && (
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-backdrop-500">Song Request</span>
                  <Badge
                    variant={
                      mySignup.requestStatus === "approved"
                        ? "success"
                        : mySignup.requestStatus === "declined"
                        ? "error"
                        : "warning"
                    }
                    size="sm"
                  >
                    {mySignup.requestStatus}
                  </Badge>
                </div>
                <p className="mt-1 text-right">{mySignup.requestText}</p>
                {mySignup.requestStatus === "declined" && mySignup.declineReason && (
                  <p className="text-sm text-red-400 mt-2 text-right">
                    {mySignup.declineReason}
                  </p>
                )}
              </div>
            )}

            {mySignup.notes && (
              <div>
                <span className="text-backdrop-500 block mb-1">Your Notes</span>
                <p className="text-sm bg-backdrop-900/50 p-3 rounded-lg">
                  {mySignup.notes}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        {(mySignup.status === "waiting" || mySignup.status === "on_deck") && (
          <div className="space-y-3">
            {mySignup.requestStatus === "declined" && (
              <Link href={`/signup/${eventIdNum}`}>
                <Button className="w-full" variant="primary">
                  Pick a Different Song
                </Button>
              </Link>
            )}
            
            <CancelButton signupId={mySignup.id} eventId={eventIdNum} />
          </div>
        )}

        {/* Queue count */}
        <p className="text-center text-sm text-backdrop-500 mt-8">
          {totalInQueue} performer{totalInQueue === 1 ? "" : "s"} in queue
        </p>
      </div>
    </main>
  );
}
