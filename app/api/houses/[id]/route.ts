import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { deleteHouse, updateHouse } from "@/lib/houses";
import { getMinimumHousePrice, isValidWeeklyPrices, resolveWeeklyPrices } from "@/lib/pricing";
import type { House } from "@/types/house";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  let body: House;
  try {
    body = (await request.json()) as House;
  } catch {
    return NextResponse.json({ error: "Некоректні дані будиночка." }, { status: 400 });
  }
  const { id } = await params;

  if (!body.name?.trim() || !body.slug?.trim()) {
    return NextResponse.json({ error: "Вкажіть назву та адресу сторінки" }, { status: 400 });
  }

  if (body.prices !== undefined && !isValidWeeklyPrices(body.prices)) {
    return NextResponse.json({ error: "Заповніть усі чотири ціни додатними числами" }, { status: 400 });
  }

  const prices = resolveWeeklyPrices(body.prices, Number(body.pricePerNight) || 0);
  if (!isValidWeeklyPrices(prices)) {
    return NextResponse.json({ error: "Заповніть усі чотири ціни додатними числами" }, { status: 400 });
  }

  const normalized: House = {
    ...body,
    prices,
    // pricePerNight лишається сумісним fallback і завжди дорівнює мінімальному тарифу.
    pricePerNight: getMinimumHousePrice(prices, body.pricePerNight),
  };

  try {
    const updated = await updateHouse(id, normalized);
    if (!updated) return NextResponse.json({ error: "Будиночок не знайдено" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Не вдалося оновити будиночок:", error);
    return NextResponse.json({ error: "Не вдалося зберегти зміни. Спробуйте ще раз." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  return PUT(request, context);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  try {
    const deleted = await deleteHouse(id);
    if (!deleted) return NextResponse.json({ error: "Будиночок не знайдено" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Не вдалося видалити будиночок:", error);
    return NextResponse.json({ error: "Не вдалося видалити будиночок. Спробуйте ще раз." }, { status: 500 });
  }
}
