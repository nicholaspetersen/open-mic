"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

interface BandDisplayProps {
  eventId: number;
  eventName: string;
  currentPerformer: SignupWithSong | null;
  onDeck: SignupWithSong | null;
  upNext: SignupWithSong[];
  totalWaiting: number;
}

export function BandDisplay({
  eventId,
  eventName,
  currentPerformer: initialCurrent,
  onDeck: initialOnDeck,
  upNext: initialUpNext,
  totalWaiting: initialTotal,
}: BandDisplayProps) {
  const router = useRouter();
  const [currentPerformer, setCurrentPerformer] = useState(initialCurrent);
  const [onDeck, setOnDeck] = useState(initialOnDeck);
  const [upNext, setUpNext] = useState(initialUpNext);
  const [totalWaiting, setTotalWaiting] = useState(initialTotal);
  const [connected, setConnected] = useState(false);

  // Refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [router]);

  // Update state when props change (from server refresh)
  useEffect(() => {
    setCurrentPerformer(initialCurrent);
    setOnDeck(initialOnDeck);
    setUpNext(initialUpNext);
    setTotalWaiting(initialTotal);
    setConnected(true);
  }, [initialCurrent, initialOnDeck, initialUpNext, initialTotal]);

  return (
    <main className="min-h-dvh p-6 sm:p-8 flex flex-col" style={{ background: COLORS.bg, color: COLORS.white }}>
      {/* Header */}
      <header className="flex items-center justify-between mb-8 pb-4" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: COLORS.yellow }}>{eventName}</h1>
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2"
            style={{ backgroundColor: connected ? COLORS.yellow : "#ef4444" }}
          />
          <span className="text-sm uppercase" style={{ color: COLORS.gray }}>
            {connected ? "Live" : "Reconnecting..."}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-6 sm:gap-8">
        {/* Now Playing */}
        <section className="flex-1">
          <p className="text-sm uppercase tracking-widest mb-3 font-bold" style={{ color: COLORS.yellow }}>
            Now Playing
          </p>
          {currentPerformer ? (
            <div className="animate-fade-in">
              <h2 className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-4 leading-tight uppercase" style={{ color: COLORS.white }}>
                {currentPerformer.performerName}
              </h2>
              {currentPerformer.song ? (
                <div className="space-y-2">
                  <p className="text-2xl sm:text-3xl" style={{ color: COLORS.yellow }}>
                    {currentPerformer.song.title}
                  </p>
                  <p className="text-xl sm:text-2xl" style={{ color: COLORS.gray }}>
                    {currentPerformer.song.artist}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-4">
                    {currentPerformer.song.key && (
                      <span 
                        className="px-4 py-2 text-xl font-bold"
                        style={{ backgroundColor: COLORS.yellow, color: COLORS.bg }}
                      >
                        Key: {currentPerformer.song.key}
                      </span>
                    )}
                    {currentPerformer.song.tempo && (
                      <span 
                        className="px-4 py-2 text-xl"
                        style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.gray }}
                      >
                        {currentPerformer.song.tempo}
                      </span>
                    )}
                  </div>
                </div>
              ) : currentPerformer.requestText ? (
                <p className="text-2xl sm:text-3xl" style={{ color: COLORS.yellow }}>
                  {currentPerformer.requestText}
                </p>
              ) : currentPerformer.type === "solo" ? (
                <p className="text-2xl sm:text-3xl uppercase" style={{ color: COLORS.gray }}>
                  Solo Performance
                </p>
              ) : null}

              {currentPerformer.notes && (
                <div 
                  className="mt-6 p-4"
                  style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.yellow}` }}
                >
                  <p className="text-lg" style={{ color: COLORS.yellow }}>
                    📝 {currentPerformer.notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-3xl sm:text-4xl uppercase" style={{ color: COLORS.borderLight }}>
                Waiting for next performer...
              </p>
            </div>
          )}
        </section>

        {/* On Deck */}
        <section className="p-6" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }}>
          <p className="text-sm uppercase tracking-widest mb-3 font-bold" style={{ color: COLORS.gray }}>
            On Deck
          </p>
          {onDeck ? (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold uppercase" style={{ color: COLORS.white }}>
                  {onDeck.performerName}
                </h3>
                {onDeck.song ? (
                  <p className="text-lg" style={{ color: COLORS.gray }}>
                    {onDeck.song.title} - {onDeck.song.artist}
                    {onDeck.song.key && (
                      <span className="ml-3 font-bold" style={{ color: COLORS.yellow }}>
                        ({onDeck.song.key})
                      </span>
                    )}
                  </p>
                ) : onDeck.requestText ? (
                  <p className="text-lg" style={{ color: COLORS.gray }}>{onDeck.requestText}</p>
                ) : onDeck.type === "solo" ? (
                  <p className="text-lg" style={{ color: COLORS.gray }}>Solo</p>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-xl uppercase" style={{ color: COLORS.borderLight }}>No one on deck</p>
          )}
        </section>

        {/* Queue Preview */}
        {upNext.length > 0 && (
          <section>
            <p className="text-sm uppercase tracking-widest mb-3 font-bold" style={{ color: COLORS.gray }}>
              Coming Up ({totalWaiting} in queue)
            </p>
            <div className="flex flex-wrap gap-3">
              {upNext.map((signup, index) => (
                <div
                  key={signup.id}
                  className="px-4 py-2 flex items-center gap-3"
                  style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}` }}
                >
                  <span 
                    className="w-6 h-6 flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: COLORS.yellow, color: COLORS.bg }}
                  >
                    {index + 1}
                  </span>
                  <span style={{ color: COLORS.white }}>
                    {signup.performerName}
                  </span>
                  {signup.song && (
                    <span className="text-sm" style={{ color: COLORS.gray }}>
                      - {signup.song.title}
                    </span>
                  )}
                </div>
              ))}
              {totalWaiting > 3 && (
                <div className="px-4 py-2" style={{ color: COLORS.gray }}>
                  +{totalWaiting - 3} more
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-sm uppercase" style={{ color: COLORS.borderLight }}>
        Band View • Auto-refreshing every 5 seconds
      </footer>
    </main>
  );
}
