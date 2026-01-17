import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center p-6 text-center">
      <div className="animate-slide-up max-w-md mx-auto">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-stage-400 to-stage-600 flex items-center justify-center animate-pulse-glow">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-stage-300 to-stage-500 bg-clip-text text-transparent">
          Open Mic Night
        </h1>

        <p className="text-backdrop-300 text-lg mb-10">
          Ready to take the stage? Scan the QR code at the venue to sign up.
        </p>

        <div className="space-y-4">
          <Link
            href="/admin"
            className="block w-full py-4 px-6 bg-backdrop-800 hover:bg-backdrop-700 rounded-xl text-backdrop-100 font-medium transition-all"
          >
            Host Dashboard
          </Link>

          <p className="text-backdrop-500 text-sm">
            Are you performing? Ask for the QR code!
          </p>
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-stage-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-stage-600/10 rounded-full blur-3xl" />
      </div>
    </main>
  );
}
