import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "vilshanka_admin";

function sessionToken() {
  const secret = process.env.ADMIN_SECRET || "vilshanka-local-development-secret";
  return createHmac("sha256", secret).update("vilshanka-admin-session").digest("hex");
}

export function verifyAdminPassword(password: string) {
  const expected = Buffer.from(process.env.ADMIN_PASSWORD || "vilshanka-admin");
  const actual = Buffer.from(password);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function hasValidAdminToken(token?: string) {
  if (!token) return false;
  const expected = Buffer.from(sessionToken());
  const actual = Buffer.from(token);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function isAdmin() {
  return hasValidAdminToken((await cookies()).get(ADMIN_COOKIE)?.value);
}

export function getAdminSessionToken() {
  return sessionToken();
}
