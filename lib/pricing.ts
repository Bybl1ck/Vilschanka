import type { HousePriceKey, HouseWeeklyPrices } from "@/types/house";

export const HOUSE_PRICE_KEYS: HousePriceKey[] = ["monWed", "thu", "friSun", "sat"];

export const HOUSE_PRICE_LABELS: Record<HousePriceKey, string> = {
  monWed: "Пн–Ср",
  thu: "Чт",
  friSun: "Пт–Нд",
  sat: "Сб",
};

export type KyivWeekday = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

const KYIV_WEEKDAY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  timeZone: "Europe/Kyiv",
});

const PRICE_KEY_BY_WEEKDAY: Record<KyivWeekday, HousePriceKey> = {
  Monday: "monWed",
  Tuesday: "monWed",
  Wednesday: "monWed",
  Thursday: "thu",
  Friday: "friSun",
  Saturday: "sat",
  Sunday: "friSun",
};

export function getKyivWeekday(date = new Date()): KyivWeekday {
  return KYIV_WEEKDAY_FORMATTER.format(date) as KyivWeekday;
}

export function getTodayPriceKey(date = new Date()): HousePriceKey {
  return PRICE_KEY_BY_WEEKDAY[getKyivWeekday(date)];
}

/** Зворотна сумісність для компонентів, які використовували стару назву. */
export function getCurrentPriceKey(date = new Date()): HousePriceKey {
  return getTodayPriceKey(date);
}

export function getTodayPrice(
  prices: Partial<HouseWeeklyPrices> | undefined,
  fallback: number,
  date = new Date(),
) {
  const todayPrice = prices?.[getTodayPriceKey(date)];
  if (isPositivePrice(todayPrice)) return Number(todayPrice);
  if (isPositivePrice(fallback)) return Number(fallback);

  const firstAvailable = HOUSE_PRICE_KEYS
    .map((key) => prices?.[key])
    .find(isPositivePrice);
  return firstAvailable ? Number(firstAvailable) : 0;
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
  return isPositivePrice(value) ? Number(value) : fallback;
}

function isPositivePrice(value: unknown): value is number {
  return Number.isFinite(value) && Number(value) > 0;
}
