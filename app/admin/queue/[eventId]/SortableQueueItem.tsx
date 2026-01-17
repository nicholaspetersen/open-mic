"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, Badge, Button } from "@/components/ui";
import type { Signup, Song } from "@/lib/schema";

type SignupWithSong = Signup & { song: Song | null };

interface SortableQueueItemProps {
  signup: SignupWithSong;
  position: number;
  onStatusChange: (id: number, status: string) => void;
}

export function SortableQueueItem({
  signup,
  position,
  onStatusChange,
}: SortableQueueItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: signup.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        padding="sm"
        className={`${isDragging ? "ring-2 ring-stage-500" : ""}`}
      >
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="p-2 -ml-2 text-backdrop-500 hover:text-backdrop-300 cursor-grab active:cursor-grabbing touch-none"
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
                d="M4 8h16M4 16h16"
              />
            </svg>
          </button>

          {/* Position */}
          <span className="w-8 h-8 flex items-center justify-center bg-backdrop-700 rounded-full text-sm font-bold">
            {position}
          </span>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{signup.performerName}</p>
              {signup.type === "solo" && (
                <Badge size="sm" variant="default">
                  Solo
                </Badge>
              )}
              {signup.requestStatus === "pending" && (
                <Badge size="sm" variant="warning">
                  Request
                </Badge>
              )}
            </div>
            {signup.song && (
              <p className="text-sm text-backdrop-400 truncate">
                {signup.song.title} - {signup.song.artist}
                {signup.song.key && (
                  <span className="text-backdrop-500"> ({signup.song.key})</span>
                )}
              </p>
            )}
            {signup.requestText && (
              <p className="text-sm text-backdrop-400 truncate">
                {signup.requestText}
              </p>
            )}
            {signup.notes && (
              <p className="text-xs text-stage-500 mt-1 truncate">
                📝 {signup.notes}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onStatusChange(signup.id, "no_show")}
              title="Mark as no-show"
              className="text-backdrop-500 hover:text-red-400"
            >
              <svg
                className="w-4 h-4"
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
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
