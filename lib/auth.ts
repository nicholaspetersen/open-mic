import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "admin_session";
const ADMIN_SESSION_VALUE = "authenticated";

// Check if the request has admin privileges
export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME);
  return session?.value === ADMIN_SESSION_VALUE;
}

// Verify admin passcode and set session cookie
export async function authenticateAdmin(passcode: string): Promise<boolean> {
  const correctPasscode = process.env.ADMIN_PASSCODE || "openmic2024";
  
  if (passcode === correctPasscode) {
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, ADMIN_SESSION_VALUE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
    return true;
  }
  
  return false;
}

// Log out admin
export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
