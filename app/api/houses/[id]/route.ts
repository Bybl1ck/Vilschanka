import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { deleteHouse, updateHouse } from "@/lib/houses";
import { getMinimumHousePrice, isValidWeeklyPrices, resolveWeeklyPrices } from "@/lib/pricing";
import type { House } from "@/types/house";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Потрібен вхід" }, { status: 401 });
  const body = (await request.json()) as House;
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

  const updated = await updateHouse(id, normalized);
  if (!updated) return NextResponse.json({ error: "Будиночок не знайдено" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Потрібен вхід" }, { status: 401 });
  const { id } = await params;
  const deleted = await deleteHouse(id);
  if (!deleted) return NextResponse.json({ error: "Будиночок не знайдено" }, { status: 404 });
  return NextResponse.json({ success: true });
}
