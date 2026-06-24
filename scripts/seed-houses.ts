import { readFile } from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { toSupabaseHouse } from "../lib/house-mapper";
import { getSupabaseAdmin } from "../lib/supabase";
import type { House } from "../types/house";

loadEnvConfig(process.cwd());

async function seedHouses() {
  const file = path.join(process.cwd(), "data", "houses.json");
  const houses = JSON.parse(await readFile(file, "utf8")) as House[];
  const rows = houses.map((house) => toSupabaseHouse({ ...house, isActive: true }));

  const { error } = await getSupabaseAdmin()
    .from("houses")
    .upsert(rows, { onConflict: "id" });

  if (error) {
    if (error.message.includes("Could not find the table 'public.houses'")) {
      throw new Error("Таблицю houses не знайдено. Спочатку виконайте supabase/houses.sql у Supabase SQL Editor.");
    }
    throw new Error(`Не вдалося перенести будиночки: ${error.message}`);
  }
  console.log(`Готово: у Supabase перенесено ${houses.length} будиночки.`);
}

seedHouses().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
