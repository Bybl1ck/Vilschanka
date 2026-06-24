import { isValidWeeklyPrices, resolveWeeklyPrices } from "@/lib/pricing";
import type { House, HouseWeeklyPrices } from "@/types/house";

export interface SupabaseHouseRow {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  full_description: string | null;
  price_per_night: number | null;
  guests: number | null;
  area: number | null;
  main_image: string | null;
  gallery: string[] | null;
  amenities: string[] | null;
  booked_dates: string[] | null;
  prices: HouseWeeklyPrices | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface SupabaseHouseWrite {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  full_description: string;
  price_per_night: number;
  guests: number;
  area: number;
  main_image: string;
  gallery: string[];
  amenities: string[];
  booked_dates: string[];
  prices: HouseWeeklyPrices;
  is_active: boolean;
  created_at?: string;
  updated_at: string;
}

export function fromSupabaseHouse(row: SupabaseHouseRow): House {
  const fallbackPrice = Number(row.price_per_night) || 0;
  const prices = isValidWeeklyPrices(row.prices)
    ? resolveWeeklyPrices(row.prices, fallbackPrice)
    : resolveWeeklyPrices(undefined, fallbackPrice);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description || "",
    fullDescription: row.full_description || "",
    pricePerNight: fallbackPrice,
    prices,
    guests: Number(row.guests) || 0,
    area: Number(row.area) || 0,
    mainImage: row.main_image || "/images/house-water-exterior.svg",
    gallery: row.gallery || [],
    amenities: row.amenities || [],
    bookedDates: row.booked_dates || [],
    isActive: row.is_active !== false,
    createdAt: row.created_at || undefined,
    updatedAt: row.updated_at || undefined,
  };
}

export function toSupabaseHouse(house: House): SupabaseHouseWrite {
  const now = new Date().toISOString();
  const prices = resolveWeeklyPrices(house.prices, house.pricePerNight);

  const row: SupabaseHouseWrite = {
    id: house.id,
    slug: house.slug,
    name: house.name,
    short_description: house.shortDescription || "",
    full_description: house.fullDescription || "",
    price_per_night: Number(house.pricePerNight) || 0,
    guests: Number(house.guests) > 0 ? Number(house.guests) : 1,
    area: Number(house.area) > 0 ? Number(house.area) : 1,
    main_image: house.mainImage || "/images/house-water-exterior.svg",
    gallery: Array.from(new Set(Array.isArray(house.gallery) ? house.gallery : [])),
    amenities: Array.from(new Set(Array.isArray(house.amenities) ? house.amenities : [])),
    booked_dates: Array.from(new Set(Array.isArray(house.bookedDates) ? house.bookedDates : [])).sort(),
    prices,
    is_active: house.isActive !== false,
    updated_at: house.updatedAt || now,
  };

  // Не передаємо created_at із undefined/null: для нового рядка PostgreSQL
  // застосує default now(), а повторний upsert збереже початкову дату.
  if (house.createdAt) row.created_at = house.createdAt;
  return row;
}
