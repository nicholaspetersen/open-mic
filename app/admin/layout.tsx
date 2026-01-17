import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { AdminNav } from "./AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAdmin();

  // Allow unauthenticated access to login page
  // Auth check happens in individual pages/middleware

  return (
    <div className="min-h-dvh">
      {authenticated && <AdminNav />}
      {children}
    </div>
  );
}
