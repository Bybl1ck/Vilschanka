import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getPageSetting, updatePageSetting } from "@/lib/page-settings";
import { isPageKey } from "@/types/page-setting";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function validImage(value: string) {
  if (value.startsWith("/")) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET(_request: Request, { params }: { params: Promise<{ pageKey: string }> }) {
  const { pageKey } = await params;
  if (!isPageKey(pageKey)) {
    return NextResponse.json({ error: "Сторінку не знайдено." }, { status: 404 });
  }
  return NextResponse.json(await getPageSetting(pageKey), {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ pageKey: string }> }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { pageKey } = await params;
  if (!isPageKey(pageKey)) {
    return NextResponse.json({ error: "Сторінку не знайдено." }, { status: 404 });
  }

  try {
    const body = await request.json() as { backgroundImage?: string };
    const backgroundImage = body.backgroundImage?.trim() || "";
    if (!validImage(backgroundImage)) {
      return NextResponse.json({ error: "Вкажіть коректний шлях або HTTPS-посилання на зображення." }, { status: 400 });
    }
    return NextResponse.json(await updatePageSetting(pageKey, { backgroundImage }));
  } catch (error) {
    console.error("Не вдалося зберегти фон сторінки:", error);
    return NextResponse.json({ error: "Не вдалося зберегти фон сторінки. Спробуйте ще раз." }, { status: 500 });
  }
}
