"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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
    <nav className="sticky top-0 z-40 bg-backdrop-950/80 backdrop-blur-lg border-b border-backdrop-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/admin/events" className="font-bold text-lg text-stage-400">
            Open Mic
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? "bg-stage-500/20 text-stage-400"
                    : "text-backdrop-400 hover:text-backdrop-100 hover:bg-backdrop-800/50"
                }`}
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
            ))}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="ml-2 px-3 py-2 rounded-lg text-sm text-backdrop-500 hover:text-backdrop-200 hover:bg-backdrop-800/50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
