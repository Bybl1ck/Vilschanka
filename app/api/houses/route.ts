import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { createHouse, getHouses } from "@/lib/houses";
import { getMinimumHousePrice, isValidWeeklyPrices, resolveWeeklyPrices } from "@/lib/pricing";
import type { House } from "@/types/house";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getHouses());
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Потрібен вхід" }, { status: 401 });

  const body = (await request.json()) as Partial<House>;
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

  return NextResponse.json(await createHouse(house), { status: 201 });
}
