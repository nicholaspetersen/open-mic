"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/admin/events", label: "Events", icon: "calendar" },
    { href: "/admin/songs", label: "Songs", icon: "music" },
  ];

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin");
    router.refresh();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "calendar":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        );
      case "music":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        );
      default:
        return null;
    }
  };

  return (
    <nav className="sticky top-0 z-40" style={{ backgroundColor: COLORS.bg, borderBottom: `1px solid ${COLORS.border}` }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/admin/events" className="font-bold text-lg uppercase tracking-tight leading-none flex items-center" style={{ color: COLORS.yellow }}>
            Open Mic
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {links.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-bold uppercase transition-colors"
                  style={{
                    backgroundColor: isActive ? "rgba(250, 197, 21, 0.1)" : "transparent",
                    color: isActive ? COLORS.yellow : COLORS.gray,
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {getIcon(link.icon)}
                  </svg>
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="ml-2 px-3 py-2 text-sm uppercase transition-colors"
              style={{ color: COLORS.borderLight }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
