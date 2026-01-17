"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input, Card, Badge } from "@/components/ui";
import type { Song, Signup } from "@/lib/schema";
import { SongPicker } from "@/components/SongPicker";

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
    existingSignup?.type || "with_band"
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
          <label className="block text-sm font-medium text-backdrop-200 mb-3">
            How do you want to perform?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPerformanceType("with_band")}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                performanceType === "with_band"
                  ? "border-stage-500 bg-stage-500/10"
                  : "border-backdrop-700 bg-backdrop-800/50 hover:border-backdrop-600"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5 text-stage-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-medium">With Band</span>
              </div>
              <p className="text-sm text-backdrop-400">Our house band backs you up</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setPerformanceType("solo");
                setSelectedSong(null);
                setRequestText("");
              }}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                performanceType === "solo"
                  ? "border-stage-500 bg-stage-500/10"
                  : "border-backdrop-700 bg-backdrop-800/50 hover:border-backdrop-600"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5 text-stage-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">Solo</span>
              </div>
              <p className="text-sm text-backdrop-400">Just you on stage</p>
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
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  songMode === "library"
                    ? "bg-stage-500 text-white"
                    : "bg-backdrop-800 text-backdrop-300 hover:text-backdrop-100"
                }`}
              >
                Pick from Library
              </button>
              <button
                type="button"
                onClick={() => setSongMode("request")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  songMode === "request"
                    ? "bg-stage-500 text-white"
                    : "bg-backdrop-800 text-backdrop-300 hover:text-backdrop-100"
                }`}
              >
                Request a Song
              </button>
            </div>

            {songMode === "library" ? (
              <div>
                <button
                  type="button"
                  onClick={() => setShowSongPicker(true)}
                  className="w-full p-4 rounded-xl border-2 border-dashed border-backdrop-600 hover:border-stage-500/50 hover:bg-backdrop-800/50 transition-all text-left"
                >
                  {selectedSong ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-backdrop-100">{selectedSong.title}</p>
                        <p className="text-sm text-backdrop-400">{selectedSong.artist}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedSong.key && <Badge variant="info">{selectedSong.key}</Badge>}
                        <span className="text-backdrop-500">Change</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-backdrop-400">
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
          <label className="block text-sm font-medium text-backdrop-200 mb-2">
            Notes {performanceType === "with_band" ? "for the band" : ""}{" "}
            <span className="text-backdrop-500">(optional)</span>
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
            className="w-full px-4 py-3 bg-backdrop-800/50 border border-backdrop-700 rounded-xl text-backdrop-100 placeholder-backdrop-500 focus:outline-none focus:ring-2 focus:ring-stage-400 focus:border-transparent transition-all resize-none"
          />
        </div>

        {/* Error */}
        {error && (
          <Card variant="ghost" padding="sm">
            <p className="text-red-400 text-sm">{error}</p>
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
          <p className="text-center text-sm text-backdrop-500">
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
