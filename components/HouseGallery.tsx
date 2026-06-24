"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const FALLBACK_IMAGE = "/images/hero-lake.svg";

export function HouseGallery({ images, houseName }: { images: string[]; houseName: string }) {
  const cleanImages = Array.from(new Set(images.map((image) => image.trim()).filter(Boolean)));
  const gallery = cleanImages.length ? cleanImages : [FALLBACK_IMAGE];
  const [activeIndex, setActiveIndex] = useState(0);
  const hasNavigation = gallery.length > 1;

  function showPrevious() {
    setActiveIndex((current) => (current - 1 + gallery.length) % gallery.length);
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % gallery.length);
  }

  return (
    <div className="overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]">
      <div className="relative min-h-[280px] overflow-hidden bg-forest-900 sm:min-h-[480px] lg:min-h-[620px]">
        <Image
          key={gallery[activeIndex]}
          src={gallery[activeIndex]}
          alt={`${houseName} — фото ${activeIndex + 1}`}
          fill
          priority={activeIndex === 0}
          className="object-cover"
          sizes="(max-width: 1536px) 100vw, 1400px"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

        {hasNavigation && (
          <>
            <button
              type="button"
              onClick={showPrevious}
              aria-label="Попереднє фото"
              className="absolute left-3 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/35 bg-forest-950/75 text-white shadow-lg backdrop-blur transition hover:bg-forest-950 sm:left-5 sm:h-14 sm:w-14"
            >
              <ChevronLeft size={25} />
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label="Наступне фото"
              className="absolute right-3 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/35 bg-forest-950/75 text-white shadow-lg backdrop-blur transition hover:bg-forest-950 sm:right-5 sm:h-14 sm:w-14"
            >
              <ChevronRight size={25} />
            </button>
          </>
        )}

        <span className="absolute bottom-4 right-4 z-10 rounded-full bg-forest-950/80 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
          {activeIndex + 1} / {gallery.length}
        </span>
      </div>

      {gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto bg-forest-950 p-3 [scrollbar-width:thin] sm:gap-3 sm:p-4">
          {gallery.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Показати фото ${index + 1}`}
              aria-current={activeIndex === index ? "true" : undefined}
              className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-24 sm:w-36 ${activeIndex === index ? "border-gold opacity-100" : "border-transparent opacity-65 hover:opacity-100"}`}
            >
              <Image src={image} alt="" fill className="object-cover" sizes="144px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
