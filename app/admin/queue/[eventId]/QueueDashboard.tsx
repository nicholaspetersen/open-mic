"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card, Badge, Button } from "@/components/ui";
import { SortableQueueItem } from "./SortableQueueItem";
import { RequestsPanel } from "./RequestsPanel";
import type { Signup, Song } from "@/lib/schema";

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

type SignupWithSong = Signup & { song: Song | null };

interface QueueDashboardProps {
  eventId: number;
  initialSignups: SignupWithSong[];
  completedSignups: SignupWithSong[];
  pendingRequests: SignupWithSong[];
}

export function QueueDashboard({
  eventId,
  initialSignups,
  completedSignups,
  pendingRequests: initialPending,
}: QueueDashboardProps) {
  const router = useRouter();
  const [signups, setSignups] = useState(initialSignups);
  const [pendingRequests, setPendingRequests] = useState(initialPending);
  const [showRequests, setShowRequests] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = signups.findIndex((s) => s.id === active.id);
        const newIndex = signups.findIndex((s) => s.id === over.id);

        // Optimistic update
        const newSignups = arrayMove(signups, oldIndex, newIndex);
        setSignups(newSignups);

        // Persist new order
        try {
          await fetch(`/api/signups/reorder`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventId,
              signupIds: newSignups.map((s) => s.id),
            }),
          });
        } catch (error) {
          console.error("Failed to save order:", error);
          // Revert on error
          setSignups(signups);
        }
      }
    },
    [signups, eventId]
  );

  const handleStatusChange = async (
    signupId: number,
    newStatus: string
  ) => {
    // Optimistic update
    setSignups((prev) =>
      prev.map((s) =>
        s.id === signupId ? { ...s, status: newStatus as Signup["status"] } : s
      )
    );

    try {
      await fetch(`/api/signups/${signupId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to update status:", error);
      router.refresh();
    }
  };

  const handleRequestAction = async (
    signupId: number,
    action: "approved" | "declined",
    reason?: string
  ) => {
    try {
      await fetch(`/api/signups/${signupId}/request`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestStatus: action, declineReason: reason }),
      });
      
      // Remove from pending list
      setPendingRequests((prev) => prev.filter((r) => r.id !== signupId));
      router.refresh();
    } catch (error) {
      console.error("Failed to update request:", error);
    }
  };

  // Find current performer and on-deck
  const currentPerformer = signups.find((s) => s.status === "performing");
  const onDeck = signups.find((s) => s.status === "on_deck");
  const waitingQueue = signups.filter((s) => s.status === "waiting");

  return (
    <div className="space-y-6">
      {/* Now Playing / On Deck Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Now Playing */}
        <Card variant={currentPerformer ? "highlight" : "default"} padding="md">
          <p className="text-xs uppercase tracking-wider mb-2 font-bold" style={{ color: COLORS.gray }}>
            Now Playing
          </p>
          {currentPerformer ? (
            <div>
              <p className="text-xl font-bold uppercase" style={{ color: COLORS.white }}>{currentPerformer.performerName}</p>
              {currentPerformer.song && (
                <p style={{ color: COLORS.gray }}>
                  {currentPerformer.song.title} - {currentPerformer.song.artist}
                </p>
              )}
              {currentPerformer.requestText && (
                <p style={{ color: COLORS.gray }}>{currentPerformer.requestText}</p>
              )}
              <Button
                size="sm"
                variant="secondary"
                className="mt-3"
                onClick={() => handleStatusChange(currentPerformer.id, "completed")}
              >
                Mark Done
              </Button>
            </div>
          ) : (
            <p style={{ color: COLORS.borderLight }}>No one on stage</p>
          )}
        </Card>

        {/* On Deck */}
        <Card variant={onDeck ? "default" : "ghost"} padding="md">
          <p className="text-xs uppercase tracking-wider mb-2 font-bold" style={{ color: COLORS.gray }}>
            On Deck
          </p>
          {onDeck ? (
            <div>
              <p className="text-xl font-bold uppercase" style={{ color: COLORS.white }}>{onDeck.performerName}</p>
              {onDeck.song && (
                <p style={{ color: COLORS.gray }}>
                  {onDeck.song.title} - {onDeck.song.artist}
                </p>
              )}
              {onDeck.requestText && (
                <p style={{ color: COLORS.gray }}>{onDeck.requestText}</p>
              )}
              <Button
                size="sm"
                className="mt-3"
                onClick={() => handleStatusChange(onDeck.id, "performing")}
              >
                Start Performance
              </Button>
            </div>
          ) : (
            <p style={{ color: COLORS.borderLight }}>No one on deck</p>
          )}
        </Card>
      </div>

      {/* Pending Requests Banner */}
      {pendingRequests.length > 0 && (
        <button
          onClick={() => setShowRequests(true)}
          className="w-full p-4 flex items-center justify-between transition-colors"
          style={{ 
            backgroundColor: "rgba(250, 197, 21, 0.1)", 
            border: `1px solid ${COLORS.yellow}` 
          }}
        >
          <div className="flex items-center gap-3">
            <Badge variant="warning">{pendingRequests.length}</Badge>
            <span className="font-bold uppercase" style={{ color: COLORS.yellow }}>
              Pending song request{pendingRequests.length === 1 ? "" : "s"}
            </span>
          </div>
          <svg
            className="w-5 h-5"
            style={{ color: COLORS.yellow }}
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
        </button>
      )}

      {/* Queue */}
      <div>
        <div className="flex items-center justify-between mb-3 pb-2" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
          <h2 className="text-lg font-bold" style={{ color: COLORS.yellow }}>
            Queue ({waitingQueue.length})
          </h2>
          <p className="text-sm uppercase" style={{ color: COLORS.gray }}>Drag to reorder</p>
        </div>

        {waitingQueue.length === 0 ? (
          <Card className="text-center py-8">
            <p style={{ color: COLORS.gray }}>No one in queue yet</p>
            <p className="text-sm mt-1" style={{ color: COLORS.borderLight }}>
              Share the signup link to get started
            </p>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={waitingQueue.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {waitingQueue.map((signup, index) => (
                  <SortableQueueItem
                    key={signup.id}
                    signup={signup}
                    position={index + 1}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Completed */}
      {completedSignups.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-3" style={{ color: COLORS.gray }}>
            Completed ({completedSignups.length})
          </h2>
          <div className="space-y-2 opacity-60">
            {completedSignups.slice(0, 5).map((signup) => (
              <Card key={signup.id} padding="sm" variant="ghost">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold" style={{ color: COLORS.white }}>{signup.performerName}</p>
                    {signup.song && (
                      <p className="text-sm" style={{ color: COLORS.gray }}>
                        {signup.song.title}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={signup.status === "completed" ? "success" : "error"}
                    size="sm"
                  >
                    {signup.status === "no_show" ? "No show" : "Done"}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Requests Panel */}
      {showRequests && (
        <RequestsPanel
          requests={pendingRequests}
          onAction={handleRequestAction}
          onClose={() => setShowRequests(false)}
        />
      )}
    </div>
  );
}
