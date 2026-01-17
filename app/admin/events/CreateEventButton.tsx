"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Card } from "@/components/ui";

export function CreateEventButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("Open Mic Night");
  const [venue, setVenue] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Event name is required");
      return;
    }

    if (!code.trim()) {
      setError("Event code is required");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            venue: venue.trim() || null,
            date,
            code: code.trim().toLowerCase(),
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to create event");
        }

        setShowForm(false);
        setName("Open Mic Night");
        setVenue("");
        setCode("");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  };

  if (!showForm) {
    return (
      <Button onClick={() => setShowForm(true)}>
        + New Event
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-backdrop-950/80 backdrop-blur-sm">
      <Card className="w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Create Event</h2>
          <button
            onClick={() => setShowForm(false)}
            className="p-2 -mr-2 text-backdrop-400 hover:text-backdrop-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Event Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Friday Night Open Mic"
            autoFocus
          />

          <Input
            label="Venue (optional)"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="The Local Bar"
          />

          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <Input
            label="Event Code"
            value={code}
            onChange={(e) => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            placeholder="friday-jan-17"
            hint="Used in the QR code URL (letters, numbers, dashes only)"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={isPending}>
              Create Event
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
