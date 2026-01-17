"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

interface CancelButtonProps {
  signupId: number;
  eventId: number;
}

export function CancelButton({ signupId, eventId }: CancelButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCancel = async () => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/signups/${signupId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          router.push(`/signup/${eventId}`);
        }
      } catch (error) {
        console.error("Failed to cancel:", error);
      }
    });
  };

  if (showConfirm) {
    return (
      <div className="bg-backdrop-800 rounded-xl p-4 space-y-3">
        <p className="text-center text-sm">
          Are you sure you want to leave the queue?
        </p>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => setShowConfirm(false)}
          >
            Never mind
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={handleCancel}
            loading={isPending}
          >
            Yes, leave
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      className="w-full text-backdrop-400"
      onClick={() => setShowConfirm(true)}
    >
      Leave Queue
    </Button>
  );
}
