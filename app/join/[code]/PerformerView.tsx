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

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  // Closed event
  if (event.status === "closed") {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center p-6 text-center" style={{ background: COLORS.bg }}>
        <div className="max-w-md mx-auto animate-slide-up">
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: COLORS.card }}>
            <svg className="w-10 h-10" style={{ color: COLORS.gray }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold uppercase mb-3" style={{ color: COLORS.white }}>Event Closed</h1>
          <p style={{ color: COLORS.gray }} className="mb-6">This open mic night has ended. Thanks for coming!</p>
        </div>
      </main>
    );
  }

  // Draft event
  if (event.status === "draft") {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center p-6 text-center" style={{ background: COLORS.bg }}>
        <div className="max-w-md mx-auto animate-slide-up">
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: COLORS.card }}>
            <svg className="w-10 h-10" style={{ color: COLORS.gray }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold uppercase mb-3" style={{ color: COLORS.white }}>Coming Soon</h1>
          <p style={{ color: COLORS.gray }} className="mb-6">Signups haven&apos;t opened yet. Check back soon!</p>
        </div>
      </main>
    );
  }

  const totalInQueue = queue.length + (onDeck ? 1 : 0) + (currentPerformer ? 1 : 0);

  return (
    <main className="min-h-dvh pb-24" style={{ background: COLORS.bg }}>
      {/* Header */}
      <header className="px-4 py-3" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
        <p className="font-bold text-lg uppercase tracking-tight" style={{ color: COLORS.yellow }}>Open Mic</p>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Event Info */}
        <div className="mb-3">
          <h1 className="text-2xl font-bold uppercase tracking-tight" style={{ color: COLORS.white }}>{event.name}</h1>
          <p style={{ color: COLORS.gray }}>
            {formatDate(event.date)}
            {event.venue && ` • ${event.venue}`}
          </p>
        </div>

        {/* Celebration Banner */}
        {showCelebration && mySignup && (
          <Card variant="highlight" className="mb-4 text-center animate-slide-up">
            <div className="text-3xl mb-2">🎉</div>
            <p className="font-bold uppercase" style={{ color: COLORS.white }}>You&apos;re signed up!</p>
            <p className="text-sm" style={{ color: COLORS.gray }}>
              You&apos;re #{myPosition} in line
            </p>
          </Card>
        )}

        {/* Now Playing */}
        {currentPerformer && (
          <section className="mb-4">
            <p className="text-sm uppercase tracking-wider mb-2 font-bold" style={{ color: COLORS.yellow }}>
              🎤 Now Playing
            </p>
            <Card variant="highlight" padding="md">
              <p className="text-xl font-bold" style={{ color: COLORS.white }}>{currentPerformer.performerName}</p>
              {currentPerformer.song && (
                <p style={{ color: COLORS.gray }}>
                  {currentPerformer.song.title} - {currentPerformer.song.artist}
                </p>
              )}
              {currentPerformer.type === "solo" && !currentPerformer.song && (
                <p style={{ color: COLORS.gray }}>Solo performance</p>
              )}
            </Card>
          </section>
        )}

        {/* Queue Section */}
        <section className="mb-6">
          <div className="flex items-center justify-between pb-2 mb-4" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
            <h2 className="text-xl font-bold uppercase tracking-tight" style={{ color: COLORS.yellow }}>
              Queue ({totalInQueue})
            </h2>
          </div>

          {queue.length === 0 && !currentPerformer && !onDeck ? (
            <Card className="text-center py-8">
              <p style={{ color: COLORS.gray }}>No one in queue yet</p>
              <p className="text-sm mt-1" style={{ color: COLORS.borderLight }}>
                Be the first to sign up!
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {/* On Deck */}
              {onDeck && (
                <QueueItem
                  signup={onDeck}
                  position={currentPerformer ? 2 : 1}
                  isMe={onDeck.id === mySignup?.id}
                  event={event}
                  onLeave={() => setShowCancelConfirm(true)}
                />
              )}
              
              {/* Waiting Queue */}
              {queue.map((signup, index) => {
                const position = index + 1 + (currentPerformer ? 1 : 0) + (onDeck ? 1 : 0);
                return (
                  <QueueItem
                    key={signup.id}
                    signup={signup}
                    position={position}
                    isMe={signup.id === mySignup?.id}
                    event={event}
                    onLeave={() => setShowCancelConfirm(true)}
                  />
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
                <p className="font-bold uppercase" style={{ color: COLORS.yellow }}>Get ready!</p>
                <p className="text-sm" style={{ color: COLORS.gray }}>
                  Head toward the stage - you're up next!
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Fixed Sign Up Button (if not signed up) */}
      {!mySignup && (
        <div className="fixed bottom-0 left-0 right-0 p-4" style={{ background: COLORS.bg }}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(10, 13, 18, 0.9)" }}>
          <Card className="w-full max-w-sm animate-slide-up">
            <h3 className="text-lg font-bold uppercase mb-2" style={{ color: COLORS.white }}>Leave the queue?</h3>
            <p className="mb-4" style={{ color: COLORS.gray }}>
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
    </main>
  );
}

// Queue Item Component
function QueueItem({
  signup,
  position,
  isMe,
  event,
  onLeave,
}: {
  signup: SignupWithSong;
  position: number;
  isMe: boolean;
  event: Event;
  onLeave: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2"
      style={{
        backgroundColor: COLORS.card,
        border: isMe ? `1px solid ${COLORS.yellow}` : `1px solid ${COLORS.border}`,
      }}
    >
      {/* Position Number */}
      <div 
        className="w-8 h-8 flex-shrink-0 flex items-center justify-center font-bold text-base"
        style={{ backgroundColor: COLORS.yellow, color: COLORS.bg }}
      >
        {position}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-base truncate" style={{ color: COLORS.white }}>{signup.performerName}</p>
          {isMe && <Badge variant="you" size="sm">You</Badge>}
        </div>
        {signup.song ? (
          <p className="text-sm truncate" style={{ color: COLORS.gray }}>
            {signup.song.title} - {signup.song.artist}
          </p>
        ) : signup.type === "solo" ? (
          <p className="text-sm" style={{ color: COLORS.gray }}>Solo performance</p>
        ) : signup.requestText ? (
          <p className="text-sm truncate" style={{ color: COLORS.gray }}>{signup.requestText}</p>
        ) : null}
      </div>

      {/* Actions */}
      {isMe && (
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href={`/signup/${event.id}?edit=${signup.id}`}
            className="text-xs font-bold uppercase"
            style={{ minHeight: 'auto', color: COLORS.white }}
          >
            Edit
          </Link>
          <button
            onClick={onLeave}
            className="text-xs font-bold uppercase"
            style={{ minHeight: 'auto', color: COLORS.gray }}
          >
            Leave
          </button>
        </div>
      )}
    </div>
  );
}
