import Link from "next/link";

// Color constants from Figma
const COLORS = {
  yellow: "#FAC515",
  bg: "#0A0D12",
  card: "#181D27",
  border: "#252B37",
  gray: "#A4A7AE",
  grayDark: "#414651",
  white: "#FFFFFF",
};

export default function Home() {
  return (
    <main 
      className="min-h-dvh flex flex-col items-center justify-center p-6 text-center"
      style={{ background: COLORS.bg }}
    >
      <div className="animate-slide-up max-w-md mx-auto">
        {/* Logo */}
        <div className="mb-8">
          <h1 
            className="text-5xl font-bold uppercase tracking-tight"
            style={{ color: COLORS.yellow }}
          >
            Open Mic
          </h1>
        </div>

        <p className="text-lg mb-10" style={{ color: COLORS.gray }}>
          Ready to take the stage? Scan the QR code at the venue to sign up.
        </p>

        <div className="space-y-4">
          <Link
            href="/admin"
            className="block w-full py-4 px-6 font-bold uppercase tracking-tight transition-all"
            style={{ 
              backgroundColor: COLORS.card, 
              border: `1px solid ${COLORS.border}`,
              color: COLORS.white 
            }}
          >
            Host Dashboard
          </Link>

          <p className="text-sm" style={{ color: COLORS.grayDark }}>
            Are you performing? Ask for the QR code!
          </p>
        </div>
      </div>
    </main>
  );
}
