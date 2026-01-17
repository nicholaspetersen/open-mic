"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, Badge, Button, Input } from "@/components/ui";
import type { Song } from "@/lib/schema";

interface SongsListProps {
  initialSongs: Song[];
}

export function SongsList({ initialSongs }: SongsListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [songs, setSongs] = useState(initialSongs);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [key, setKey] = useState("");
  const [tempo, setTempo] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const filteredSongs = useMemo(() => {
    if (!search) return songs;
    const searchLower = search.toLowerCase();
    return songs.filter(
      (song) =>
        song.title.toLowerCase().includes(searchLower) ||
        song.artist.toLowerCase().includes(searchLower)
    );
  }, [songs, search]);

  const resetForm = () => {
    setTitle("");
    setArtist("");
    setKey("");
    setTempo("");
    setDifficulty("medium");
    setNotes("");
    setError("");
    setEditingSong(null);
    setShowForm(false);
  };

  const openEditForm = (song: Song) => {
    setTitle(song.title);
    setArtist(song.artist);
    setKey(song.key || "");
    setTempo(song.tempo || "");
    setDifficulty((song.difficulty as "easy" | "medium" | "hard") || "medium");
    setNotes(song.notes || "");
    setEditingSong(song);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !artist.trim()) {
      setError("Title and artist are required");
      return;
    }

    startTransition(async () => {
      try {
        const url = editingSong
          ? `/api/songs/${editingSong.id}`
          : "/api/songs";
        const method = editingSong ? "PATCH" : "POST";

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            artist: artist.trim(),
            key: key.trim() || null,
            tempo: tempo.trim() || null,
            difficulty,
            notes: notes.trim() || null,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save song");
        }

        resetForm();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  };

  const handleDelete = async (songId: number) => {
    if (!confirm("Delete this song?")) return;

    startTransition(async () => {
      try {
        await fetch(`/api/songs/${songId}`, { method: "DELETE" });
        setSongs((prev) => prev.filter((s) => s.id !== songId));
      } catch (err) {
        console.error("Delete failed:", err);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Search & Add */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search songs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowForm(true)}>+ Add Song</Button>
      </div>

      {/* Song List */}
      <div className="space-y-2">
        {filteredSongs.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-backdrop-500">
              {search ? "No songs match your search" : "No songs in library"}
            </p>
          </Card>
        ) : (
          filteredSongs.map((song) => (
            <Card key={song.id} padding="sm">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{song.title}</p>
                    {song.key && <Badge size="sm">{song.key}</Badge>}
                    {song.difficulty && (
                      <Badge
                        size="sm"
                        variant={
                          song.difficulty === "easy"
                            ? "success"
                            : song.difficulty === "hard"
                            ? "error"
                            : "warning"
                        }
                      >
                        {song.difficulty}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-backdrop-400">{song.artist}</p>
                  {song.playCount > 0 && (
                    <p className="text-xs text-backdrop-500 mt-1">
                      Played {song.playCount} time{song.playCount === 1 ? "" : "s"}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditForm(song)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400"
                    onClick={() => handleDelete(song.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-backdrop-950/80 backdrop-blur-sm">
          <Card className="w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editingSong ? "Edit Song" : "Add Song"}
              </h2>
              <button
                onClick={resetForm}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Song Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Wonderwall"
                autoFocus
              />

              <Input
                label="Artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Oasis"
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Em"
                />

                <Input
                  label="Tempo"
                  value={tempo}
                  onChange={(e) => setTempo(e.target.value)}
                  placeholder="120 BPM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-backdrop-200 mb-2">
                  Difficulty
                </label>
                <div className="flex gap-2">
                  {(["easy", "medium", "hard"] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium capitalize transition-all ${
                        difficulty === level
                          ? "bg-stage-500 text-white"
                          : "bg-backdrop-800 text-backdrop-400 hover:text-backdrop-200"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-backdrop-200 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Arrangement notes, tips, etc."
                  rows={2}
                  className="w-full px-4 py-3 bg-backdrop-800/50 border border-backdrop-700 rounded-xl text-backdrop-100 placeholder-backdrop-500 focus:outline-none focus:ring-2 focus:ring-stage-400 focus:border-transparent resize-none"
                />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" loading={isPending}>
                  {editingSong ? "Save Changes" : "Add Song"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
