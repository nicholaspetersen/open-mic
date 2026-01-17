import Link from "next/link";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md mx-auto animate-slide-up">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-backdrop-800 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-backdrop-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-3">Event Not Found</h1>
        <p className="text-backdrop-400 mb-6">
          We couldn&apos;t find this event. Make sure you scanned the right QR
          code!
        </p>
        <Link href="/">
          <Button variant="secondary">Go Home</Button>
        </Link>
      </div>
    </main>
  );
}
