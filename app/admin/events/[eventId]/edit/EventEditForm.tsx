"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input, Card } from "@/components/ui";
import type { Event } from "@/lib/schema";

// Color constants from Figma
const COLORS = {
  yellow: "#FAC515",
  bg: "#0A0D12",
  card: "#181D27",
  border: "#252B37",
  borderLight: "#414651",
  gray: "#A4A7AE",
  white: "#FFFFFF",
};

interface EventEditFormProps {
  event: Event;
}

export function EventEditForm({ event }: EventEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(event.name);
  const [date, setDate] = useState(event.date.split("T")[0]); // Extract date part
  const [venue, setVenue] = useState(event.venue || "");
  const [code, setCode] = useState(event.code);
  const [status, setStatus] = useState(event.status);
  const [allowMultipleSignups, setAllowMultipleSignups] = useState(event.allowMultipleSignups ?? true);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Event name is required");
      return;
    }

    if (!date) {
      setError("Date is required");
      return;
    }

    if (!code.trim()) {
      setError("Event code is required");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/events/${event.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            date: new Date(date).toISOString(),
            venue: venue.trim() || null,
            code: code.trim().toLowerCase(),
            status,
            allowMultipleSignups,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to update event");
        }

        router.push("/admin/events");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  };

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/events/${event.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete event");
        }

        router.push("/admin/events");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete");
      }
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Event Name"
          placeholder="Friday Night Open Mic"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <Input
          label="Venue"
          placeholder="The Local Bar"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
        />

        <Input
          label="Event Code"
          placeholder="friday"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          hint="Used in the signup URL (e.g., /join/friday)"
        />

        {/* Status */}
        <div>
          <label 
            className="block text-sm font-bold uppercase mb-2"
            style={{ color: COLORS.gray }}
          >
            Status
          </label>
          <div className="flex gap-2">
            {(["draft", "active", "closed"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className="flex-1 py-2 px-4 text-sm font-bold uppercase transition-all"
                style={{
                  backgroundColor: status === s ? COLORS.yellow : COLORS.card,
                  color: status === s ? COLORS.bg : COLORS.gray,
                  border: status === s ? "none" : `1px solid ${COLORS.border}`,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Allow Multiple Signups */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={allowMultipleSignups}
              onChange={(e) => setAllowMultipleSignups(e.target.checked)}
              className="w-5 h-5 rounded-none"
              style={{ accentColor: COLORS.yellow }}
            />
            <div>
              <span className="font-bold" style={{ color: COLORS.white }}>Allow multiple signups</span>
              <p className="text-sm" style={{ color: COLORS.gray }}>
                Let performers sign up for multiple songs
              </p>
            </div>
          </label>
        </div>

        {error && (
          <Card variant="ghost" padding="sm">
            <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/admin/events" className="flex-1">
            <Button type="button" variant="secondary" className="w-full">
              Cancel
            </Button>
          </Link>
          <Button type="submit" className="flex-1" loading={isPending}>
            Save Changes
          </Button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="mt-12 pt-6" style={{ borderTop: `1px solid ${COLORS.border}` }}>
        <h3 className="text-sm font-bold uppercase mb-3" style={{ color: "#f87171" }}>Danger Zone</h3>
        <Button
          type="button"
          variant="danger"
          onClick={() => setShowDeleteConfirm(true)}
        >
          Delete Event
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(10, 13, 18, 0.9)" }}>
          <Card className="w-full max-w-sm animate-slide-up">
            <h3 className="text-lg font-bold uppercase mb-2" style={{ color: COLORS.white }}>Delete Event?</h3>
            <p className="mb-4" style={{ color: COLORS.gray }}>
              This will permanently delete the event and all signups. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleDelete}
                loading={isPending}
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
