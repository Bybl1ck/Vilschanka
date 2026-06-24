import { promises as fs } from "fs";
import path from "path";
import { fromSupabaseHouse, toSupabaseHouse, type SupabaseHouseRow } from "@/lib/house-mapper";
import { getSupabase, getSupabaseAdmin } from "@/lib/supabase";
import type { House } from "@/types/house";

const dataFile = path.join(process.cwd(), "data", "houses.json");
const houseColumns = "id,slug,name,short_description,full_description,price_per_night,guests,area,main_image,gallery,amenities,booked_dates,prices,is_active,created_at,updated_at";

interface GetHousesOptions {
  /** JSON використовується лише для публічного відображення при помилці Supabase. */
  allowFallback?: boolean;
}

async function getFallbackHouses(): Promise<House[]> {
  const raw = await fs.readFile(dataFile, "utf8");
  return JSON.parse(raw) as House[];
}

export async function getHouses({ allowFallback = true }: GetHousesOptions = {}): Promise<House[]> {
  try {
    const { data, error } = await getSupabase()
      .from("houses")
      .select(houseColumns)
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error) throw error;
    const houses = ((data || []) as SupabaseHouseRow[]).map(fromSupabaseHouse);
    return houses;
  } catch (error) {
    console.error("Не вдалося отримати будиночки із Supabase:", error);
    if (!allowFallback) throw error;
  }

  return getFallbackHouses();
}

export async function getHouseBySlug(slug: string): Promise<House | undefined> {
  const houses = await getHouses();
  return houses.find((house) => house.slug === slug);
}

export async function getHouseById(id: string): Promise<House | undefined> {
  const { data, error } = await getSupabaseAdmin()
    .from("houses")
    .select(houseColumns)
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(`Не вдалося отримати будиночок із Supabase: ${error.message}`);
  return data ? fromSupabaseHouse(data as SupabaseHouseRow) : undefined;
}

export async function createHouse(house: House): Promise<House> {
  const { data, error } = await getSupabaseAdmin()
    .from("houses")
    .insert(toSupabaseHouse({ ...house, isActive: true }))
    .select(houseColumns)
    .single();

  if (error || !data) {
    throw new Error(`Не вдалося створити будиночок у Supabase: ${error?.message || "порожня відповідь"}`);
  }
  return fromSupabaseHouse(data as SupabaseHouseRow);
}

export async function updateHouse(id: string, nextHouse: House): Promise<House | null> {
  const row = toSupabaseHouse({ ...nextHouse, id, isActive: true });
  // Дата створення не змінюється під час редагування.
  delete row.created_at;

  const { data, error } = await getSupabaseAdmin()
    .from("houses")
    .update(row)
    .eq("id", id)
    .eq("is_active", true)
    .select(houseColumns)
    .maybeSingle();

  if (error) throw new Error(`Не вдалося оновити будиночок у Supabase: ${error.message}`);
  return data ? fromSupabaseHouse(data as SupabaseHouseRow) : null;
}

export async function deleteHouse(id: string): Promise<boolean> {
  const current = await getHouseById(id);
  if (!current) return false;

  const { error } = await getSupabaseAdmin()
    .from("houses")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("is_active", true);

  if (error) throw new Error(`Не вдалося видалити будиночок у Supabase: ${error.message}`);
  return true;
}
