import { NextResponse } from "next/server";
import { clearAdminSession, requireAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  await clearAdminSession();
  return NextResponse.json({ success: true }, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
