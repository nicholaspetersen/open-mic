"use client";

import { useState } from "react";
import { Card, Badge, Button, Input } from "@/components/ui";
import type { Signup, Song } from "@/lib/schema";

// Color constants from Figma
const COLORS = {
  yellow: "#FAC515",
  bg: "#0A0D12",
  card: "#181D27",
  border: "#252B37",
  gray: "#A4A7AE",
  white: "#FFFFFF",
};

type SignupWithSong = Signup & { song: Song | null };

interface RequestsPanelProps {
  requests: SignupWithSong[];
  onAction: (signupId: number, action: "approved" | "declined", reason?: string) => void;
  onClose: () => void;
}

export function RequestsPanel({ requests, onAction, onClose }: RequestsPanelProps) {
  const [declineReasons, setDeclineReasons] = useState<Record<number, string>>({});

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(10, 13, 18, 0.9)" }}>
      <Card className="w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold uppercase" style={{ color: COLORS.white }}>Song Requests</h2>
            <Badge variant="warning">{requests.length}</Badge>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Requests List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {requests.length === 0 ? (
            <p className="text-center py-8" style={{ color: COLORS.gray }}>
              No pending requests
            </p>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="p-4 space-y-3"
                style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold" style={{ color: COLORS.white }}>{request.performerName}</p>
                    <p style={{ color: COLORS.yellow }}>{request.requestText}</p>
                    {request.notes && (
                      <p className="text-sm mt-1" style={{ color: COLORS.gray }}>
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
