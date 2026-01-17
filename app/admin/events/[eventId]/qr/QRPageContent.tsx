"use client";

import Link from "next/link";

interface QRPageContentProps {
  eventId: number;
  eventName: string;
  venue: string | null;
  signupUrl: string;
}

export function QRPageContent({
  eventId,
  eventName,
  venue,
  signupUrl,
}: QRPageContentProps) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(signupUrl)}&bgcolor=ffffff&color=000000&margin=20`;

  return (
    <main className="min-h-dvh bg-white text-gray-900 print:bg-white">
      {/* Print-hidden navigation */}
      <div className="print:hidden p-4 bg-backdrop-950 text-backdrop-100">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href={`/admin/queue/${eventId}`}
            className="text-backdrop-400 hover:text-backdrop-200"
          >
            ← Back to Queue
          </Link>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-stage-500 text-white rounded-lg hover:bg-stage-400 transition-colors"
          >
            Print QR Code
          </button>
        </div>
      </div>

      {/* Printable Content */}
      <div className="max-w-md mx-auto p-8 text-center">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{eventName}</h1>
          {venue && <p className="text-xl text-gray-600">{venue}</p>}
        </div>

        {/* QR Code */}
        <div className="bg-white p-4 rounded-2xl shadow-lg inline-block mb-6">
          <img
            src={qrUrl}
            alt="QR Code to sign up"
            className="w-64 h-64 mx-auto"
            width={256}
            height={256}
          />
        </div>

        {/* Call to action */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Scan to Sign Up!</h2>
          <p className="text-gray-600 text-lg">
            Want to perform? Scan this QR code to join the queue.
          </p>

          {/* Manual URL */}
          <div className="mt-6 p-4 bg-gray-100 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">Or visit:</p>
            <p className="font-mono text-sm break-all">{signupUrl}</p>
          </div>
        </div>

        {/* Footer icons */}
        <div className="mt-8 flex justify-center gap-6 text-gray-400">
          <div className="flex items-center gap-2">
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
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            <span className="text-sm">Pick a song</span>
          </div>
          <div className="flex items-center gap-2">
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="text-sm">Join the queue</span>
          </div>
        </div>
      </div>

      {/* Print styles - using standard style tag for print media */}
      <style>
        {`
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            @page {
              margin: 0.5in;
            }
            .print\\:hidden {
              display: none !important;
            }
          }
        `}
      </style>
    </main>
  );
}
