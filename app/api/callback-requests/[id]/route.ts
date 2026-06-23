import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { deleteCallbackRequest, updateCallbackRequestStatus } from "@/lib/callback-requests";
import type { CallbackRequestStatus } from "@/types/callback-request";

export const dynamic = "force-dynamic";

const allowedStatuses = new Set<CallbackRequestStatus>(["new", "called", "archived"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Потрібен вхід до адмін-панелі." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json() as { status?: CallbackRequestStatus };
    if (!body.status || !allowedStatuses.has(body.status)) {
      return NextResponse.json({ error: "Оберіть коректний статус заявки." }, { status: 400 });
    }

    const updated = await updateCallbackRequestStatus(id, body.status);
    if (!updated) return NextResponse.json({ error: "Заявку не знайдено." }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Не вдалося оновити статус заявки:", error);
    return NextResponse.json({ error: "Не вдалося оновити статус заявки." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Потрібен вхід до адмін-панелі." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const deleted = await deleteCallbackRequest(id);
    if (!deleted) return NextResponse.json({ error: "Заявку не знайдено." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Не вдалося видалити заявку:", error);
    return NextResponse.json({ error: "Не вдалося видалити заявку. Спробуйте ще раз." }, { status: 500 });
  }
}
