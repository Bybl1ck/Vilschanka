import { NextResponse } from "next/server";
import {
  createAdminSession,
  hasAdminConfiguration,
  isSameOriginRequest,
  verifyAdminPassword,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

const MAX_FAILED_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const failedAttempts = new Map<string, { count: number; resetAt: number }>();

function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "local";
}

function currentAttempts(ip: string) {
  const now = Date.now();
  const attempt = failedAttempts.get(ip);
  if (!attempt || attempt.resetAt <= now) {
    failedAttempts.delete(ip);
    return null;
  }
  return attempt;
}

function registerFailedAttempt(ip: string) {
  const current = currentAttempts(ip);
  failedAttempts.set(ip, current
    ? { ...current, count: current.count + 1 }
    : { count: 1, resetAt: Date.now() + ATTEMPT_WINDOW_MS });

  // Захист від необмеженого росту Map у довгоживучому Node.js runtime.
  if (failedAttempts.size > 1000) {
    const now = Date.now();
    failedAttempts.forEach((value, key) => {
      if (value.resetAt <= now) failedAttempts.delete(key);
    });
  }
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Недійсне джерело запиту" }, { status: 403 });
  }
  if (!hasAdminConfiguration()) {
    console.error("Адмін-вхід вимкнено: не налаштовано ADMIN_PASSWORD або ADMIN_SECRET.");
    return NextResponse.json({ error: "Сталася помилка сервера" }, { status: 500 });
  }

  const ip = clientIp(request);
  if ((currentAttempts(ip)?.count || 0) >= MAX_FAILED_ATTEMPTS) {
    return NextResponse.json({ error: "Забагато спроб. Спробуйте пізніше." }, { status: 429 });
  }

  let body: { password?: string };
  try {
    body = await request.json() as { password?: string };
  } catch {
    return NextResponse.json({ error: "Некоректні дані" }, { status: 400 });
  }

  if (!body.password || !verifyAdminPassword(body.password)) {
    registerFailedAttempt(ip);
    await new Promise((resolve) => setTimeout(resolve, 400));
    return NextResponse.json({ error: "Неправильний пароль" }, { status: 401 });
  }

  failedAttempts.delete(ip);
  try {
    await createAdminSession();
    return NextResponse.json({ success: true }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    console.error("Не вдалося створити адмін-сесію:", error);
    return NextResponse.json({ error: "Сталася помилка сервера" }, { status: 500 });
  }
}
