"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Signup, Song } from "@/lib/schema";

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
    <main className="min-h-dvh bg-backdrop-950 text-backdrop-100 p-6 sm:p-8 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-backdrop-400">{eventName}</h1>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              connected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm text-backdrop-500">
            {connected ? "Live" : "Reconnecting..."}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-6 sm:gap-8">
        {/* Now Playing */}
        <section className="flex-1">
          <p className="text-sm uppercase tracking-widest text-stage-500 mb-3">
            Now Playing
          </p>
          {currentPerformer ? (
            <div className="animate-fade-in">
              <h2 className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-4 leading-tight">
                {currentPerformer.performerName}
              </h2>
              {currentPerformer.song ? (
                <div className="space-y-2">
                  <p className="text-2xl sm:text-3xl text-stage-400">
                    {currentPerformer.song.title}
                  </p>
                  <p className="text-xl sm:text-2xl text-backdrop-400">
                    {currentPerformer.song.artist}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-4">
                    {currentPerformer.song.key && (
                      <span className="px-4 py-2 bg-stage-500/20 text-stage-400 rounded-lg text-xl font-mono">
                        Key: {currentPerformer.song.key}
                      </span>
                    )}
                    {currentPerformer.song.tempo && (
                      <span className="px-4 py-2 bg-backdrop-800 text-backdrop-300 rounded-lg text-xl">
                        {currentPerformer.song.tempo}
                      </span>
                    )}
                  </div>
                </div>
              ) : currentPerformer.requestText ? (
                <p className="text-2xl sm:text-3xl text-stage-400">
                  {currentPerformer.requestText}
                </p>
              ) : currentPerformer.type === "solo" ? (
                <p className="text-2xl sm:text-3xl text-backdrop-400">
                  Solo Performance
                </p>
              ) : null}

              {currentPerformer.notes && (
                <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <p className="text-lg text-amber-400">
                    📝 {currentPerformer.notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-3xl sm:text-4xl text-backdrop-600">
                Waiting for next performer...
              </p>
            </div>
          )}
        </section>

        {/* On Deck */}
        <section className="bg-backdrop-900/50 rounded-2xl p-6">
          <p className="text-sm uppercase tracking-widest text-backdrop-500 mb-3">
            On Deck
          </p>
          {onDeck ? (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold">
                  {onDeck.performerName}
                </h3>
                {onDeck.song ? (
                  <p className="text-lg text-backdrop-400">
                    {onDeck.song.title} - {onDeck.song.artist}
                    {onDeck.song.key && (
                      <span className="ml-3 text-stage-400">
                        ({onDeck.song.key})
                      </span>
                    )}
                  </p>
                ) : onDeck.requestText ? (
                  <p className="text-lg text-backdrop-400">{onDeck.requestText}</p>
                ) : onDeck.type === "solo" ? (
                  <p className="text-lg text-backdrop-400">Solo</p>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-xl text-backdrop-600">No one on deck</p>
          )}
        </section>

        {/* Queue Preview */}
        {upNext.length > 0 && (
          <section>
            <p className="text-sm uppercase tracking-widest text-backdrop-500 mb-3">
              Coming Up ({totalWaiting} in queue)
            </p>
            <div className="flex flex-wrap gap-3">
              {upNext.map((signup, index) => (
                <div
                  key={signup.id}
                  className="px-4 py-2 bg-backdrop-800/50 rounded-lg flex items-center gap-3"
                >
                  <span className="w-6 h-6 flex items-center justify-center bg-backdrop-700 rounded-full text-sm">
                    {index + 1}
                  </span>
                  <span className="text-backdrop-300">
                    {signup.performerName}
                  </span>
                  {signup.song && (
                    <span className="text-backdrop-500 text-sm">
                      - {signup.song.title}
                    </span>
                  )}
                </div>
              ))}
              {totalWaiting > 3 && (
                <div className="px-4 py-2 text-backdrop-500">
                  +{totalWaiting - 3} more
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-sm text-backdrop-600">
        Band View • Auto-refreshing every 5 seconds
      </footer>
    </main>
  );
}
