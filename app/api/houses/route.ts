import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createHouse, getHouses } from "@/lib/houses";
import { getMinimumHousePrice, isValidWeeklyPrices, resolveWeeklyPrices } from "@/lib/pricing";
import type { House } from "@/types/house";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    return NextResponse.json(await getHouses(), {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    console.error("Не вдалося отримати будиночки:", error);
    return NextResponse.json({ error: "Не вдалося завантажити будиночки." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  let body: Partial<House>;
  try {
    body = (await request.json()) as Partial<House>;
  } catch {
    return NextResponse.json({ error: "Некоректні дані будиночка." }, { status: 400 });
  }
  if (!body.name?.trim() || !body.slug?.trim()) {
    return NextResponse.json({ error: "Вкажіть назву та адресу сторінки" }, { status: 400 });
  }

  if (body.prices !== undefined && !isValidWeeklyPrices(body.prices)) {
    return NextResponse.json({ error: "Заповніть усі чотири ціни додатними числами" }, { status: 400 });
  }

  const fallbackPrice = Number(body.pricePerNight) || 0;
  const prices = resolveWeeklyPrices(body.prices, fallbackPrice);
  if (!isValidWeeklyPrices(prices)) {
    return NextResponse.json({ error: "Заповніть усі чотири ціни додатними числами" }, { status: 400 });
  }

  const house: House = {
    id: randomUUID(),
    name: body.name.trim(),
    slug: body.slug.trim(),
    shortDescription: body.shortDescription || "Новий затишний будиночок у Вільшанці.",
    fullDescription: body.fullDescription || "Додайте повний опис будиночка.",
    // Старе поле зберігаємо для сумісності та синхронізуємо з мінімальним тарифом.
    pricePerNight: getMinimumHousePrice(prices, fallbackPrice),
    prices,
    guests: Number(body.guests) || 2,
    area: Number(body.area) || 20,
    amenities: body.amenities || [],
    mainImage: body.mainImage || "/images/house-water-exterior.svg",
    gallery: body.gallery?.length ? body.gallery : [body.mainImage || "/images/house-water-exterior.svg"],
    bookedDates: body.bookedDates || [],
  };

  try {
    return NextResponse.json(await createHouse(house), { status: 201 });
  } catch (error) {
    console.error("Не вдалося створити будиночок:", error);
    return NextResponse.json({ error: "Не вдалося зберегти зміни. Спробуйте ще раз." }, { status: 500 });
  }
}
