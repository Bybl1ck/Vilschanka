import type { HousePriceKey, HouseWeeklyPrices } from "@/types/house";

export const HOUSE_PRICE_KEYS: HousePriceKey[] = ["monWed", "thu", "friSun", "sat"];

export const HOUSE_PRICE_LABELS: Record<HousePriceKey, string> = {
  monWed: "Пн–Ср",
  thu: "Чт",
  friSun: "Пт–Нд",
  sat: "Сб",
};

export function getCurrentPriceKey(date = new Date()): HousePriceKey {
  const day = date.getDay();
  if (day >= 1 && day <= 3) return "monWed";
  if (day === 4) return "thu";
  if (day === 6) return "sat";
  return "friSun";
}

export function isValidWeeklyPrices(value: unknown): value is HouseWeeklyPrices {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<HouseWeeklyPrices>;
  return HOUSE_PRICE_KEYS.every((key) => Number.isFinite(candidate[key]) && Number(candidate[key]) > 0);
}

export function resolveWeeklyPrices(prices: Partial<HouseWeeklyPrices> | undefined, fallback: number): HouseWeeklyPrices {
  const safeFallback = Number.isFinite(fallback) && fallback > 0 ? fallback : 0;
  return {
    monWed: validPrice(prices?.monWed, safeFallback),
    thu: validPrice(prices?.thu, safeFallback),
    friSun: validPrice(prices?.friSun, safeFallback),
    sat: validPrice(prices?.sat, safeFallback),
  };
}

export function getMinimumHousePrice(prices: Partial<HouseWeeklyPrices> | undefined, fallback: number) {
  const resolved = resolveWeeklyPrices(prices, fallback);
  return Math.min(...HOUSE_PRICE_KEYS.map((key) => resolved[key]));
}

function validPrice(value: number | undefined, fallback: number) {
  return Number.isFinite(value) && Number(value) > 0 ? Number(value) : fallback;
}
