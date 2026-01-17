import { db } from "@/lib/db";
import { events } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { QRPageContent } from "./QRPageContent";

interface QRPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function QRCodePage({ params }: QRPageProps) {
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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const signupUrl = `${baseUrl}/join/${event.code}`;

  return (
    <QRPageContent
      eventId={event.id}
      eventName={event.name}
      venue={event.venue}
      signupUrl={signupUrl}
    />
  );
}
