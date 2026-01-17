"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input, Card, Badge } from "@/components/ui";
import type { Song, Signup } from "@/lib/schema";
import { SongPicker } from "@/components/SongPicker";

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

interface SignupFormProps {
  eventId: number;
  eventCode: string;
  songs: Song[];
  existingSignup: SignupWithSong | null;
}

type PerformanceType = "solo" | "with_band";
type SongMode = "library" | "request";

export function SignupForm({ eventId, eventCode, songs, existingSignup }: SignupFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Initialize form state from existing signup or defaults
  const [name, setName] = useState(existingSignup?.performerName || "");
  const [performanceType, setPerformanceType] = useState<PerformanceType>(
    existingSignup?.type || "solo"
  );
  const [songMode, setSongMode] = useState<SongMode>(
    existingSignup?.requestText ? "request" : "library"
  );
  const [selectedSong, setSelectedSong] = useState<Song | null>(
    existingSignup?.song || null
  );
  const [requestText, setRequestText] = useState(existingSignup?.requestText || "");
  const [notes, setNotes] = useState(existingSignup?.notes || "");
  const [error, setError] = useState("");
  const [showSongPicker, setShowSongPicker] = useState(false);

  const isEditing = !!existingSignup;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (performanceType === "with_band" && songMode === "library" && !selectedSong) {
      setError("Please select a song from the library");
      return;
    }

    if (performanceType === "with_band" && songMode === "request" && !requestText.trim()) {
      setError("Please enter the song you'd like to request");
      return;
    }

    startTransition(async () => {
      try {
        const url = isEditing ? `/api/signups/${existingSignup.id}` : "/api/signups";
        const method = isEditing ? "PATCH" : "POST";

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            performerName: name.trim(),
            type: performanceType,
            songId: performanceType === "with_band" && songMode === "library" ? selectedSong?.id : null,
            requestText: performanceType === "with_band" && songMode === "request" ? requestText.trim() : null,
            notes: notes.trim() || null,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to sign up");
        }

        // Redirect back to the queue view with celebration
        router.push(`/join/${eventCode}${isEditing ? "" : "?signedup=true"}`);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
        {/* Name Input */}
        <Input
          label="Your Name"
          placeholder="What should we call you on stage?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          autoFocus={!isEditing}
        />

        {/* Performance Type */}
        <div>
          <label 
            className="block text-sm font-bold uppercase mb-3"
            style={{ color: COLORS.gray }}
          >
            How do you want to perform?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setPerformanceType("solo");
                setSelectedSong(null);
                setRequestText("");
              }}
              className="p-4 text-left transition-all"
              style={{
                backgroundColor: COLORS.card,
                border: performanceType === "solo" 
                  ? `1px solid ${COLORS.yellow}` 
                  : `1px solid ${COLORS.border}`,
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5" style={{ color: COLORS.yellow }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-bold uppercase" style={{ color: COLORS.white }}>Solo</span>
              </div>
              <p className="text-sm" style={{ color: COLORS.gray }}>Just you on stage</p>
            </button>

            <button
              type="button"
              onClick={() => setPerformanceType("with_band")}
              className="p-4 text-left transition-all"
              style={{
                backgroundColor: COLORS.card,
                border: performanceType === "with_band" 
                  ? `1px solid ${COLORS.yellow}` 
                  : `1px solid ${COLORS.border}`,
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5" style={{ color: COLORS.yellow }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-bold uppercase" style={{ color: COLORS.white }}>With Band</span>
              </div>
              <p className="text-sm" style={{ color: COLORS.gray }}>Our house band backs you up</p>
            </button>
          </div>
        </div>

        {/* Song Selection (only for with_band) */}
        {performanceType === "with_band" && (
          <div className="space-y-4">
            {/* Song Mode Tabs */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSongMode("library")}
                className="flex-1 py-2 px-4 text-sm font-bold uppercase transition-all"
                style={{
                  backgroundColor: songMode === "library" ? COLORS.yellow : COLORS.card,
                  color: songMode === "library" ? COLORS.bg : COLORS.gray,
                  border: songMode === "library" ? "none" : `1px solid ${COLORS.border}`,
                }}
              >
                Pick from Library
              </button>
              <button
                type="button"
                onClick={() => setSongMode("request")}
                className="flex-1 py-2 px-4 text-sm font-bold uppercase transition-all"
                style={{
                  backgroundColor: songMode === "request" ? COLORS.yellow : COLORS.card,
                  color: songMode === "request" ? COLORS.bg : COLORS.gray,
                  border: songMode === "request" ? "none" : `1px solid ${COLORS.border}`,
                }}
              >
                Request a Song
              </button>
            </div>

            {songMode === "library" ? (
              <div>
                <button
                  type="button"
                  onClick={() => setShowSongPicker(true)}
                  className="w-full p-4 text-left transition-all"
                  style={{
                    backgroundColor: COLORS.card,
                    border: `2px dashed ${COLORS.borderLight}`,
                  }}
                >
                  {selectedSong ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold" style={{ color: COLORS.white }}>{selectedSong.title}</p>
                        <p className="text-sm" style={{ color: COLORS.gray }}>{selectedSong.artist}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedSong.key && <Badge variant="info">{selectedSong.key}</Badge>}
                        <span className="text-sm uppercase" style={{ color: COLORS.gray }}>Change</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3" style={{ color: COLORS.gray }}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>Tap to search our song library</span>
                    </div>
                  )}
                </button>
              </div>
            ) : (
              <div>
                <Input
                  label="Song Request"
                  placeholder='e.g. "Wonderwall by Oasis"'
                  value={requestText}
                  onChange={(e) => setRequestText(e.target.value)}
                  hint="The host will approve your request if the band can play it"
                />
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <label 
            className="block text-sm font-bold uppercase mb-2"
            style={{ color: COLORS.gray }}
          >
            Notes {performanceType === "with_band" ? "for the band" : ""}{" "}
            <span className="normal-case" style={{ color: COLORS.borderLight }}>(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              performanceType === "with_band"
                ? "Key change, capo position, start at chorus, etc."
                : "What are you performing? (song, comedy, poetry, etc.)"
            }
            rows={3}
            className="w-full px-4 py-3 transition-all resize-none focus:outline-none focus:ring-2 focus:ring-[#FAC515]"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              color: COLORS.white,
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <Card variant="ghost" padding="sm">
            <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link href={`/join/${eventCode}`} className="flex-1">
            <Button type="button" variant="secondary" className="w-full">
              Cancel
            </Button>
          </Link>
          <Button type="submit" className="flex-1" loading={isPending}>
            {isEditing
              ? "Save Changes"
              : performanceType === "with_band" && songMode === "request"
              ? "Submit Request"
              : "Join the Queue"}
          </Button>
        </div>

        {songMode === "request" && performanceType === "with_band" && !isEditing && (
          <p className="text-center text-sm" style={{ color: COLORS.gray }}>
            Your request will be reviewed by the host
          </p>
        )}
      </form>

      {/* Song Picker Modal */}
      {showSongPicker && (
        <SongPicker
          songs={songs}
          selectedSong={selectedSong}
          onSelect={(song) => {
            setSelectedSong(song);
            setShowSongPicker(false);
          }}
          onClose={() => setShowSongPicker(false)}
        />
      )}
    </>
  );
}
