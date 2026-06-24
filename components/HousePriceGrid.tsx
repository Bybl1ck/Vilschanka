import { CalendarDays } from "lucide-react";
import { getTodayPrice, getTodayPriceKey, HOUSE_PRICE_KEYS, HOUSE_PRICE_LABELS, resolveWeeklyPrices } from "@/lib/pricing";
import type { HouseWeeklyPrices } from "@/types/house";

export function HousePriceGrid({
  prices,
  fallback,
  compact = false,
}: {
  prices?: Partial<HouseWeeklyPrices>;
  fallback: number;
  compact?: boolean;
}) {
  const resolved = resolveWeeklyPrices(prices, fallback);
  const now = new Date();
  const activeKey = getTodayPriceKey(now);
  const todayPrice = getTodayPrice(prices, fallback, now);

  return (
    <div className={compact ? "mt-6" : "rounded-[1.5rem] border border-gold/35 bg-white p-5 shadow-soft sm:p-7"}>
      <div className="flex items-center gap-2">
        <CalendarDays size={compact ? 16 : 19} className="text-gold" />
        <h3 className={`${compact ? "text-xs uppercase tracking-[0.16em]" : "font-display text-2xl"} font-bold text-forest-900`}>Ціни за добу</h3>
      </div>
      <div className={`grid grid-cols-2 ${compact ? "mt-3 gap-2" : "mt-5 gap-3"}`}>
        {HOUSE_PRICE_KEYS.map((key) => {
          const active = key === activeKey;
          return (
            <div key={key} className={`min-w-0 rounded-xl border ${compact ? "p-3" : "p-4"} ${active ? "border-gold bg-gold/25" : "border-stone-200 bg-sand-50"}`}>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-[0.1em] text-forest-700">{HOUSE_PRICE_LABELS[key]}</span>
                {active && <span className="rounded-full bg-forest-900 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">Сьогодні</span>}
              </div>
              <p className={`mt-2 whitespace-nowrap font-display font-bold text-forest-900 ${compact ? "text-lg" : "text-2xl"}`}>
                {(active ? todayPrice : resolved[key]).toLocaleString("uk-UA")} <span className="font-sans text-xs font-bold">грн</span>
              </p>
            </div>
          );
        })}
      </div>
      {!compact && <p className="mt-4 text-xs leading-5 text-stone-500">Тарифи відрізняються залежно від дня тижня. Актуальний тариф на сьогодні позначено золотистим акцентом.</p>}
    </div>
  );
}
