"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Badge } from "@/components/ui";
import type { Song } from "@/lib/schema";

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
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: COLORS.bg }}>
      {/* Header */}
      <div className="flex-none p-4" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold uppercase" style={{ color: COLORS.white }}>Pick a Song</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 transition-colors"
            style={{ color: COLORS.gray }}
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
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{ color: COLORS.borderLight }}
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
            className="w-full pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FAC515]"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              color: COLORS.white,
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2"
              style={{ color: COLORS.borderLight }}
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
              className="px-3 py-1.5 text-sm font-bold uppercase transition-all"
              style={{
                backgroundColor: difficulty === level ? COLORS.yellow : COLORS.card,
                color: difficulty === level ? COLORS.bg : COLORS.gray,
                border: difficulty === level ? "none" : `1px solid ${COLORS.border}`,
              }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Song List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredSongs.length === 0 ? (
          <div className="text-center py-12" style={{ color: COLORS.gray }}>
            <p>No songs found</p>
            {search && (
              <p className="text-sm mt-1" style={{ color: COLORS.borderLight }}>
                Try a different search or request this song!
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {groupedSongs.map(([artist, artistSongs]) => (
              <div key={artist}>
                <h3 
                  className="text-sm font-bold uppercase mb-2 sticky top-0 py-1"
                  style={{ backgroundColor: COLORS.bg, color: COLORS.gray }}
                >
                  {artist}
                </h3>
                <div className="space-y-1">
                  {artistSongs.map((song) => (
                    <button
                      key={song.id}
                      onClick={() => onSelect(song)}
                      className="w-full p-3 text-left transition-all"
                      style={{
                        backgroundColor: COLORS.card,
                        border: selectedSong?.id === song.id 
                          ? `1px solid ${COLORS.yellow}` 
                          : `1px solid ${COLORS.border}`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold" style={{ color: COLORS.white }}>{song.title}</span>
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
                        <p className="text-sm mt-1 truncate" style={{ color: COLORS.gray }}>
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
      <div 
        className="flex-none p-4 text-center text-sm"
        style={{ borderTop: `1px solid ${COLORS.border}`, color: COLORS.gray }}
      >
        {filteredSongs.length} of {songs.length} songs
      </div>
    </div>
  );
}
