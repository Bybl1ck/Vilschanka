import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Users } from "lucide-react";
import { CallChoiceDialog } from "@/components/CallChoiceDialog";
import { HousePriceGrid } from "@/components/HousePriceGrid";
import { getMinimumHousePrice } from "@/lib/pricing";
import type { House } from "@/types/house";

export function HouseCard({ house, featured = false }: { house: House; featured?: boolean }) {
  const minimumPrice = getMinimumHousePrice(house.prices, house.pricePerNight);

  return (
    <article className={`group min-w-0 overflow-hidden rounded-[1.5rem] bg-white shadow-soft sm:rounded-[2rem] ${featured ? "lg:grid lg:grid-cols-[1.15fr_.85fr]" : ""}`}>
      <Link href={`/budynochky/${house.slug}`} className={`relative block w-full overflow-hidden ${featured ? "aspect-[4/3] sm:min-h-[360px] sm:aspect-auto lg:min-h-[520px]" : "aspect-[4/3]"}`}>
        <Image src={house.mainImage} alt={`${house.name} — вигляд ззовні`} fill className="object-cover transition duration-700 group-hover:scale-[1.03]" sizes={featured ? "(max-width: 1024px) 100vw, 58vw" : "(max-width: 768px) 100vw, 50vw"} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
        <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-2 text-xs font-bold text-forest-900 backdrop-blur sm:bottom-5 sm:left-5 sm:px-4 sm:text-sm">від {minimumPrice.toLocaleString("uk-UA")} грн / доба</span>
      </Link>
      <div className={`flex flex-col p-6 sm:p-8 ${featured ? "justify-center lg:p-12" : ""}`}>
        <div className="flex items-center gap-2 text-sm text-stone-500"><Users size={17} className="text-gold" /> до {house.guests} гостей · {house.area} м²</div>
        <h3 className={`mt-4 break-words font-display leading-tight text-forest-900 ${featured ? "text-3xl sm:text-5xl" : "text-[1.75rem] sm:text-3xl"}`}>{house.name}</h3>
        <p className="mt-4 leading-7 text-stone-600">{house.shortDescription}</p>
        <HousePriceGrid prices={house.prices} fallback={house.pricePerNight} compact />
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href={`/budynochky/${house.slug}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-forest-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-forest-700">
            Детальніше <ArrowUpRight size={16} />
          </Link>
          <CallChoiceDialog className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-stone-300 px-5 py-3 text-sm font-bold text-forest-900 transition hover:border-forest-900" />
        </div>
      </div>
    </article>
  );
}
