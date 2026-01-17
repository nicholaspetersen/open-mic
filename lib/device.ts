import { cookies } from "next/headers";
import { db } from "./db";
import { devices } from "./schema";

const DEVICE_COOKIE_NAME = "device_id";

// Generate a random device ID
function generateDeviceId(): string {
  return crypto.randomUUID();
}

// Get or create device ID from cookies
export async function getDeviceId(): Promise<string> {
  const cookieStore = await cookies();
  let deviceId = cookieStore.get(DEVICE_COOKIE_NAME)?.value;

  if (!deviceId) {
    deviceId = generateDeviceId();
    // Note: Cookie will be set in the response via setDeviceCookie
  }

  return deviceId;
}

// Set the device cookie in the response
export async function setDeviceCookie(deviceId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(DEVICE_COOKIE_NAME, deviceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });
}

// Ensure device exists in database
export async function ensureDevice(deviceId: string): Promise<void> {
  await db
    .insert(devices)
    .values({ id: deviceId })
    .onConflictDoNothing();
}

// Get device ID and ensure it's in the database
export async function getOrCreateDevice(): Promise<string> {
  const deviceId = await getDeviceId();
  await ensureDevice(deviceId);
  return deviceId;
}
