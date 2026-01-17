"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Input, Badge } from "@/components/ui";
import type { Song } from "@/lib/schema";

interface SongPickerProps {
  songs: Song[];
  selectedSong: Song | null;
  onSelect: (song: Song) => void;
  onClose: () => void;
}

export function SongPicker({
  songs,
  selectedSong,
  onSelect,
  onClose,
}: SongPickerProps) {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Filter songs
  const filteredSongs = useMemo(() => {
    let filtered = songs;

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (song) =>
          song.title.toLowerCase().includes(searchLower) ||
          song.artist.toLowerCase().includes(searchLower)
      );
    }

    // Difficulty filter
    if (difficulty) {
      filtered = filtered.filter((song) => song.difficulty === difficulty);
    }

    return filtered;
  }, [songs, search, difficulty]);

  // Group by artist
  const groupedSongs = useMemo(() => {
    const groups: Record<string, Song[]> = {};
    filteredSongs.forEach((song) => {
      if (!groups[song.artist]) {
        groups[song.artist] = [];
      }
      groups[song.artist].push(song);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredSongs]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-backdrop-950">
      {/* Header */}
      <div className="flex-none p-4 border-b border-backdrop-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Pick a Song</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-backdrop-400 hover:text-backdrop-100 transition-colors"
          >
            <svg
              className="w-6 h-6"
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

        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-backdrop-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search songs or artists..."
            className="w-full pl-12 pr-4 py-3 bg-backdrop-800/50 border border-backdrop-700 rounded-xl text-backdrop-100 placeholder-backdrop-500 focus:outline-none focus:ring-2 focus:ring-stage-400 focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-backdrop-500 hover:text-backdrop-300"
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
          )}
        </div>

        {/* Difficulty Filter */}
        <div className="flex gap-2 mt-3">
          {["easy", "medium", "hard"].map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(difficulty === level ? null : level)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
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

      {/* Song List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredSongs.length === 0 ? (
          <div className="text-center py-12 text-backdrop-500">
            <p>No songs found</p>
            {search && (
              <p className="text-sm mt-1">
                Try a different search or request this song!
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {groupedSongs.map(([artist, artistSongs]) => (
              <div key={artist}>
                <h3 className="text-sm font-medium text-backdrop-500 mb-2 sticky top-0 bg-backdrop-950 py-1">
                  {artist}
                </h3>
                <div className="space-y-1">
                  {artistSongs.map((song) => (
                    <button
                      key={song.id}
                      onClick={() => onSelect(song)}
                      className={`w-full p-3 rounded-xl text-left transition-all ${
                        selectedSong?.id === song.id
                          ? "bg-stage-500/20 border border-stage-500"
                          : "bg-backdrop-800/30 hover:bg-backdrop-800 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{song.title}</span>
                        <div className="flex items-center gap-2">
                          {song.key && (
                            <Badge variant="info" size="sm">
                              {song.key}
                            </Badge>
                          )}
                          {song.difficulty && (
                            <Badge
                              variant={
                                song.difficulty === "easy"
                                  ? "success"
                                  : song.difficulty === "hard"
                                  ? "error"
                                  : "warning"
                              }
                              size="sm"
                            >
                              {song.difficulty}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {song.notes && (
                        <p className="text-sm text-backdrop-500 mt-1 truncate">
                          {song.notes}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with count */}
      <div className="flex-none p-4 border-t border-backdrop-800 text-center text-sm text-backdrop-500">
        {filteredSongs.length} of {songs.length} songs
      </div>
    </div>
  );
}
