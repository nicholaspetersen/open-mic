"use client";

import { useState } from "react";
import { Card, Badge, Button, Input } from "@/components/ui";
import type { Signup, Song } from "@/lib/schema";

type SignupWithSong = Signup & { song: Song | null };

interface RequestsPanelProps {
  requests: SignupWithSong[];
  onAction: (signupId: number, action: "approved" | "declined", reason?: string) => void;
  onClose: () => void;
}

export function RequestsPanel({ requests, onAction, onClose }: RequestsPanelProps) {
  const [declineReasons, setDeclineReasons] = useState<Record<number, string>>({});

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-backdrop-950/80 backdrop-blur-sm">
      <Card className="w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col animate-slide-up rounded-b-none sm:rounded-b-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-backdrop-700">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">Song Requests</h2>
            <Badge variant="warning">{requests.length}</Badge>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-backdrop-400 hover:text-backdrop-100"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Requests List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {requests.length === 0 ? (
            <p className="text-center text-backdrop-500 py-8">
              No pending requests
            </p>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="bg-backdrop-800/50 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{request.performerName}</p>
                    <p className="text-stage-400">{request.requestText}</p>
                    {request.notes && (
                      <p className="text-sm text-backdrop-500 mt-1">
                        Note: {request.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Decline reason input */}
                <Input
                  placeholder="Reason for declining (optional)"
                  value={declineReasons[request.id] || ""}
                  onChange={(e) =>
                    setDeclineReasons((prev) => ({
                      ...prev,
                      [request.id]: e.target.value,
                    }))
                  }
                />

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="danger"
                    className="flex-1"
                    onClick={() =>
                      onAction(request.id, "declined", declineReasons[request.id])
                    }
                  >
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => onAction(request.id, "approved")}
                  >
                    Approve
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
