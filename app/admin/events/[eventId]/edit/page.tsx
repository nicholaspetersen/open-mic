import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { events } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { EventEditForm } from "./EventEditForm";

// Color constants from Figma
const COLORS = {
  yellow: "#FAC515",
  bg: "#0A0D12",
  border: "#252B37",
  gray: "#A4A7AE",
  white: "#FFFFFF",
};

interface EditEventPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
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

  return (
    <main className="max-w-2xl mx-auto p-4 pb-8" style={{ background: COLORS.bg }}>
      {/* Header */}
      <div className="mb-6 pb-4" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
        <h1 className="text-3xl font-bold" style={{ color: COLORS.white }}>Edit Event</h1>
        <p style={{ color: COLORS.gray }}>{event.name}</p>
      </div>

      <EventEditForm event={event} />
    </main>
  );
}
