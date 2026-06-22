import { NextResponse } from "next/server";
import { ADMIN_COOKIE, getAdminSessionToken, verifyAdminPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { password?: string };
  const { hostname, protocol } = new URL(request.url);

  if (!body.password || !verifyAdminPassword(body.password)) {
    return NextResponse.json({ error: "Неправильний пароль" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, getAdminSessionToken(), {
    httpOnly: true,
    sameSite: "strict",
    // На реальному HTTPS-домені cookie захищена. На localhost це лишає
    // адмін-вхід працездатним і після `npm run build && npm start`.
    secure: protocol === "https:" && hostname !== "localhost" && hostname !== "127.0.0.1",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
  return response;
}
