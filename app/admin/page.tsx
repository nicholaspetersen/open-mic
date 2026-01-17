import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { AdminLogin } from "./AdminLogin";

// Color constants from Figma
const COLORS = {
  yellow: "#FAC515",
  bg: "#0A0D12",
  gray: "#A4A7AE",
  white: "#FFFFFF",
};

export default async function AdminPage() {
  const authenticated = await isAdmin();

  if (authenticated) {
    redirect("/admin/events");
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center p-6" style={{ background: COLORS.bg }}>
      <div className="max-w-md w-full mx-auto animate-slide-up">
        <div className="text-center mb-8">
          <h1 
            className="text-3xl font-bold uppercase tracking-tight mb-2"
            style={{ color: COLORS.yellow }}
          >
            Open Mic
          </h1>
          <h2 
            className="text-xl font-bold uppercase mb-2"
            style={{ color: COLORS.white }}
          >
            Host Dashboard
          </h2>
          <p style={{ color: COLORS.gray }}>Enter the passcode to continue</p>
        </div>

        <AdminLogin />
      </div>
    </main>
  );
}
