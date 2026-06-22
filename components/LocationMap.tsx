"use client";

import { useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { GOOGLE_MAPS_URL, SITE_ADDRESS } from "@/lib/constants";

export function LocationMap() {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="relative min-h-[540px] min-w-0 overflow-hidden rounded-[1.5rem] border border-gold/40 bg-forest-900 shadow-soft sm:min-h-[560px] sm:rounded-[2rem]">
      {imageFailed ? (
        <div className="absolute inset-0 grid place-items-center bg-forest-800 p-8 text-center text-sand-100">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#D7C08A 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="relative max-w-md">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold text-forest-950"><MapPin size={27} /></span>
            <h2 className="mt-6 font-display text-4xl">Вільшанка на карті</h2>
            <p className="mt-4 leading-7 text-sand-200">{SITE_ADDRESS}</p>
          </div>
        </div>
      ) : (
        // Скрін карти надає власник; onError залишає сторінку корисною,
        // навіть якщо файл ще не додано або перейменовано.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/images/location-map.png"
          alt={`Карта розташування комплексу Вільшанка: ${SITE_ADDRESS}`}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      )}

      <div className="absolute inset-x-3 bottom-3 rounded-[1.25rem] border border-white/70 bg-sand-50/95 p-4 text-forest-900 shadow-xl backdrop-blur min-[390px]:inset-x-4 min-[390px]:bottom-4 min-[390px]:p-5 sm:inset-x-6 sm:bottom-6 sm:flex sm:items-center sm:justify-between sm:gap-5 sm:rounded-[1.5rem] sm:p-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest-900 text-white"><MapPin size={18} /></span>
          <div className="min-w-0"><small className="text-[10px] font-bold uppercase tracking-[0.14em] text-forest-700 sm:text-xs sm:tracking-[0.18em]">Наша адреса</small><p className="mt-1 max-w-md break-words text-xs font-bold leading-5 min-[390px]:text-sm min-[390px]:leading-6 sm:text-base">{SITE_ADDRESS}</p></div>
        </div>
        <a href={GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="button-dark mt-5 w-full shrink-0 sm:mt-0 sm:w-auto">
          <Navigation size={17} /> Прокласти маршрут
        </a>
      </div>
    </div>
  );
}
