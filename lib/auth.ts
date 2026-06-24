import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_LOGIN_PATH, ADMIN_PANEL_PATH } from "@/lib/admin-paths";

export const ADMIN_COOKIE = "vilshanka_admin_session";
export { ADMIN_LOGIN_PATH, ADMIN_PANEL_PATH };

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const DEVELOPMENT_PASSWORD = "vilshanka-admin";
const DEVELOPMENT_SECRET = "vilshanka-local-development-secret";

interface AdminSessionPayload {
  role: "admin";
  expiresAt: number;
  nonce: string;
}

function configuredPassword() {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (password) return password;
  return process.env.NODE_ENV === "production" ? null : DEVELOPMENT_PASSWORD;
}

function configuredSecret() {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (secret) return secret;
  return process.env.NODE_ENV === "production" ? null : DEVELOPMENT_SECRET;
}

export function hasAdminConfiguration() {
  return Boolean(configuredPassword() && configuredSecret());
}

function signPayload(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function createSessionToken(secret: string) {
  const session: AdminSessionPayload = {
    role: "admin",
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
    nonce: randomBytes(18).toString("base64url"),
  };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${signPayload(payload, secret)}`;
}

function validateSessionToken(token: string | undefined, secret: string | null) {
  if (!token || !secret) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  if (!safeEqual(signature, signPayload(payload, secret))) return false;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<AdminSessionPayload>;
    return session.role === "admin"
      && typeof session.expiresAt === "number"
      && session.expiresAt > Date.now()
      && typeof session.nonce === "string"
      && session.nonce.length >= 16;
  } catch {
    return false;
  }
}

export function verifyAdminPassword(password: string) {
  const expected = configuredPassword();
  if (!expected) return false;
  return safeEqual(password, expected);
}

export async function createAdminSession() {
  const secret = configuredSecret();
  if (!secret) throw new Error("ADMIN_SECRET не налаштовано.");

  (await cookies()).set(ADMIN_COOKIE, createSessionToken(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function verifyAdminSession() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return validateSessionToken(token, configuredSecret());
}

export async function clearAdminSession() {
  (await cookies()).set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}

export async function isAdminAuthenticated() {
  return verifyAdminSession();
}

export function isSameOriginRequest(request: Request) {
  const requestUrl = new URL(request.url);
  const allowedHosts = new Set([
    requestUrl.host,
    request.headers.get("host"),
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim(),
  ].filter((value): value is string => Boolean(value)).map((value) => value.toLowerCase()));
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
  const allowedProtocols = new Set([
    requestUrl.protocol,
    forwardedProtocol ? `${forwardedProtocol}:` : undefined,
  ].filter((value): value is string => Boolean(value)));

  function matchesCurrentSite(value: string) {
    try {
      const candidate = new URL(value);
      return allowedHosts.has(candidate.host.toLowerCase()) && allowedProtocols.has(candidate.protocol.toLowerCase());
    } catch {
      return false;
    }
  }

  const origin = request.headers.get("origin");
  if (origin) return matchesCurrentSite(origin);

  const referer = request.headers.get("referer");
  if (referer) return matchesCurrentSite(referer);

  // SameSite=Lax не передає cookie для cross-site mutation. Відсутність обох
  // заголовків лишає працездатними server-to-server та локальні API-тести.
  return true;
}

export async function requireAdmin(request?: Request) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
  }
  if (request && !isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Недійсне джерело запиту" }, { status: 403 });
  }
  return null;
}
