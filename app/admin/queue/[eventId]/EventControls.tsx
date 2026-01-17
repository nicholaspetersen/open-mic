"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Badge } from "@/components/ui";
import type { Event } from "@/lib/schema";

interface EventControlsProps {
  event: Event;
}

export function EventControls({ event }: EventControlsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = async (newStatus: string) => {
    startTransition(async () => {
      await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    });
  };

  const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "default" }> = {
    active: { label: "Active", variant: "success" },
    draft: { label: "Draft", variant: "warning" },
    closed: { label: "Closed", variant: "default" },
  };

  const currentStatus = statusConfig[event.status] || statusConfig.draft;

  return (
    <div className="flex items-center gap-2">
      <Badge variant={currentStatus.variant}>{currentStatus.label}</Badge>

      {event.status === "draft" && (
        <Button
          size="sm"
          onClick={() => handleStatusChange("active")}
          loading={isPending}
        >
          Open Signups
        </Button>
      )}

      {event.status === "active" && (
        <>
          <Link href={`/admin/events/${event.id}/qr`}>
            <Button size="sm" variant="secondary">
              QR Code
            </Button>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleStatusChange("closed")}
            loading={isPending}
          >
            Close Event
          </Button>
        </>
      )}

      {event.status === "closed" && (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleStatusChange("active")}
          loading={isPending}
        >
          Reopen
        </Button>
      )}
    </div>
  );
}
