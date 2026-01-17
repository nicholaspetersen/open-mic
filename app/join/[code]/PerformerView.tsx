"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Badge } from "@/components/ui";
import type { Event, Signup, Song } from "@/lib/schema";

type SignupWithSong = Signup & { song: Song | null };

interface PerformerViewProps {
  event: Event;
  currentPerformer: SignupWithSong | null;
  onDeck: SignupWithSong | null;
  queue: SignupWithSong[];
  mySignup: SignupWithSong | null;
  justSignedUp: boolean;
}

export function PerformerView({
  event,
  currentPerformer,
  onDeck,
  queue,
  mySignup: initialMySignup,
  justSignedUp,
}: PerformerViewProps) {
  const router = useRouter();
  const [mySignup, setMySignup] = useState(initialMySignup);
  const [showCelebration, setShowCelebration] = useState(justSignedUp);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate position
  const myPosition = mySignup
    ? queue.findIndex((s) => s.id === mySignup.id) + 1 +
      (currentPerformer ? 1 : 0) +
      (onDeck ? 1 : 0)
    : null;

  // Dismiss celebration after 3 seconds
  useEffect(() => {
    if (showCelebration) {
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showCelebration]);

  // Refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 10000);
    return () => clearInterval(interval);
  }, [router]);

  const handleCancel = async () => {
    if (!mySignup) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/signups/${mySignup.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMySignup(null);
        setShowCancelConfirm(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to cancel:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Closed event
  if (event.status === "closed") {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md mx-auto animate-slide-up">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-backdrop-800 flex items-center justify-center">
            <svg className="w-10 h-10 text-backdrop-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-3">Event Closed</h1>
          <p className="text-backdrop-400 mb-6">This open mic night has ended. Thanks for coming!</p>
        </div>
      </main>
    );
  }

  // Draft event
  if (event.status === "draft") {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md mx-auto animate-slide-up">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-backdrop-800 flex items-center justify-center">
            <svg className="w-10 h-10 text-backdrop-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-3">Coming Soon</h1>
          <p className="text-backdrop-400 mb-6">Signups haven&apos;t opened yet. Check back soon!</p>
        </div>
      </main>
    );
  }

  const totalInQueue = queue.length + (onDeck ? 1 : 0) + (currentPerformer ? 1 : 0);

  return (
    <main className="min-h-dvh pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-backdrop-950/90 backdrop-blur-lg border-b border-backdrop-800 px-4 py-3">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-center">{event.name}</h1>
          {event.venue && (
            <p className="text-sm text-backdrop-400 text-center">{event.venue}</p>
          )}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Celebration Banner */}
        {showCelebration && mySignup && (
          <Card variant="highlight" className="mb-4 text-center animate-slide-up">
            <div className="text-3xl mb-2">🎉</div>
            <p className="font-bold">You&apos;re signed up!</p>
            <p className="text-backdrop-300 text-sm">
              You&apos;re #{myPosition} in line
            </p>
          </Card>
        )}

        {/* Now Playing */}
        {currentPerformer && (
          <section className="mb-4">
            <p className="text-xs uppercase tracking-wider text-stage-500 mb-2 font-medium">
              🎤 Now Playing
            </p>
            <Card variant="highlight" padding="md">
              <p className="text-xl font-bold">{currentPerformer.performerName}</p>
              {currentPerformer.song && (
                <p className="text-backdrop-300">
                  {currentPerformer.song.title} - {currentPerformer.song.artist}
                </p>
              )}
              {currentPerformer.type === "solo" && !currentPerformer.song && (
                <p className="text-backdrop-400">Solo performance</p>
              )}
            </Card>
          </section>
        )}

        {/* On Deck */}
        {onDeck && (
          <section className="mb-4">
            <p className="text-xs uppercase tracking-wider text-amber-500 mb-2 font-medium">
              ⏳ On Deck
            </p>
            <Card
              padding="sm"
              className={onDeck.id === mySignup?.id ? "ring-2 ring-amber-500 bg-amber-500/5" : ""}
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium ${onDeck.id === mySignup?.id ? "bg-amber-500 text-white" : "bg-amber-500/20 text-amber-400"}`}>
                  ⏳
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{onDeck.performerName}</p>
                    {onDeck.id === mySignup?.id && (
                      <Badge variant="warning" size="sm">You!</Badge>
                    )}
                  </div>
                  {onDeck.song && (
                    <p className="text-sm text-backdrop-400 truncate">
                      {onDeck.song.title} - {onDeck.song.artist}
                      {onDeck.song.key && <span className="text-backdrop-500"> ({onDeck.song.key})</span>}
                    </p>
                  )}
                  {onDeck.type === "solo" && !onDeck.song && (
                    <p className="text-sm text-backdrop-500">Solo performance</p>
                  )}
                  {onDeck.requestText && (
                    <p className="text-sm text-backdrop-400 truncate">{onDeck.requestText}</p>
                  )}
                  {/* Show notes for own signup */}
                  {onDeck.id === mySignup?.id && onDeck.notes && (
                    <p className="text-xs text-amber-400 mt-1">📝 {onDeck.notes}</p>
                  )}
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* Queue */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-backdrop-500 font-medium">
              Queue ({queue.length})
            </p>
            <p className="text-xs text-backdrop-600">
              {totalInQueue} total
            </p>
          </div>

          {queue.length === 0 && !currentPerformer && !onDeck ? (
            <Card className="text-center py-8">
              <p className="text-backdrop-500">No one in queue yet</p>
              <p className="text-sm text-backdrop-600 mt-1">
                Be the first to sign up!
              </p>
            </Card>
          ) : queue.length === 0 ? (
            <Card className="text-center py-4">
              <p className="text-backdrop-500 text-sm">Queue is empty</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {queue.map((signup, index) => {
                const isMe = signup.id === mySignup?.id;
                return (
                  <Card
                    key={signup.id}
                    padding="sm"
                    className={isMe ? "ring-2 ring-stage-500 bg-stage-500/5" : ""}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full text-sm font-medium mt-0.5 ${isMe ? "bg-stage-500 text-white" : "bg-backdrop-700"}`}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">
                            {signup.performerName}
                          </p>
                          {isMe && (
                            <Badge variant="success" size="sm">You</Badge>
                          )}
                          {signup.requestStatus === "pending" && (
                            <Badge variant="warning" size="sm">Pending</Badge>
                          )}
                          {signup.requestStatus === "declined" && (
                            <Badge variant="error" size="sm">Declined</Badge>
                          )}
                        </div>
                        {signup.song && (
                          <p className="text-sm text-backdrop-400 truncate">
                            {signup.song.title} - {signup.song.artist}
                            {signup.song.key && <span className="text-backdrop-500"> ({signup.song.key})</span>}
                          </p>
                        )}
                        {signup.type === "solo" && !signup.song && (
                          <p className="text-sm text-backdrop-500">Solo performance</p>
                        )}
                        {signup.requestText && (
                          <p className="text-sm text-backdrop-400 truncate">
                            {signup.requestText}
                          </p>
                        )}
                        {/* Show notes for own signup */}
                        {isMe && signup.notes && (
                          <p className="text-xs text-stage-400 mt-1">
                            📝 {signup.notes}
                          </p>
                        )}
                        {isMe && signup.requestStatus === "declined" && signup.declineReason && (
                          <p className="text-xs text-red-400 mt-1">
                            ❌ {signup.declineReason}
                          </p>
                        )}
                      </div>
                      {/* Actions on the right */}
                      {isMe && (
                        <div className="flex items-center gap-3 flex-shrink-0 text-sm self-center">
                          <Link
                            href={`/signup/${event.id}?edit=${signup.id}`}
                            className="text-stage-400"
                            style={{ minHeight: 'auto' }}
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => setShowCancelConfirm(true)}
                            className="text-backdrop-500"
                            style={{ minHeight: 'auto' }}
                          >
                            Leave
                          </button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* On Deck Alert */}
        {mySignup && mySignup.status === "on_deck" && (
          <Card variant="highlight" className="mb-6 animate-pulse-glow">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🎤</div>
              <div>
                <p className="font-bold text-amber-400">Get ready!</p>
                <p className="text-sm text-amber-400/80">
                  Head toward the stage - you're up next!
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Fixed Sign Up Button (if not signed up) */}
      {!mySignup && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-backdrop-950 via-backdrop-950 to-transparent">
          <div className="max-w-lg mx-auto">
            <Link href={`/signup/${event.id}`}>
              <Button size="lg" className="w-full">
                Sign Up to Perform
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-backdrop-950/80 backdrop-blur-sm">
          <Card className="w-full max-w-sm animate-slide-up">
            <h3 className="text-lg font-bold mb-2">Leave the queue?</h3>
            <p className="text-backdrop-400 mb-4">
              You can always sign up again later.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowCancelConfirm(false)}
              >
                Never mind
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleCancel}
                loading={isLoading}
              >
                Yes, leave
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-stage-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-stage-600/5 rounded-full blur-3xl" />
      </div>
    </main>
  );
}
