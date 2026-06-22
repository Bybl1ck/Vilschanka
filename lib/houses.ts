import { promises as fs } from "fs";
import path from "path";
import type { House } from "@/types/house";

const dataFile = path.join(process.cwd(), "data", "houses.json");

export async function getHouses(): Promise<House[]> {
  const raw = await fs.readFile(dataFile, "utf8");
  return JSON.parse(raw) as House[];
}

export async function getHouseBySlug(slug: string): Promise<House | undefined> {
  const houses = await getHouses();
  return houses.find((house) => house.slug === slug);
}

export async function createHouse(house: House): Promise<House> {
  const houses = await getHouses();
  houses.push(house);
  await writeHouses(houses);
  return house;
}

export async function updateHouse(id: string, nextHouse: House): Promise<House | null> {
  const houses = await getHouses();
  const index = houses.findIndex((house) => house.id === id);

  if (index === -1) return null;
  houses[index] = { ...nextHouse, id };
  await writeHouses(houses);
  return houses[index];
}

export async function deleteHouse(id: string): Promise<boolean> {
  const houses = await getHouses();
  const nextHouses = houses.filter((house) => house.id !== id);
  if (nextHouses.length === houses.length) return false;
  await writeHouses(nextHouses);
  return true;
}

async function writeHouses(houses: House[]) {
  // Один послідовний запис достатній для MVP. У production цей адаптер
  // замінюється репозиторієм Supabase/Prisma без змін у компонентах сайту.
  await fs.writeFile(dataFile, `${JSON.stringify(houses, null, 2)}\n`, "utf8");
}
