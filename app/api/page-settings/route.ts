import { NextResponse } from "next/server";
import { getPageSettings } from "@/lib/page-settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(await getPageSettings(), {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
