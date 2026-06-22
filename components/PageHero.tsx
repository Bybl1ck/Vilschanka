import Image from "next/image";
import { Container } from "@/components/ui/Container";

export function PageHero({ eyebrow, title, text, image = "/images/hero-lake.svg" }: { eyebrow: string; title: string; text: string; image?: string }) {
  return (
    <section className="relative min-h-[520px] overflow-hidden bg-forest-950 pt-[110px] text-white sm:min-h-[564px]">
      <Image src={image} alt="Природа комплексу Вільшанка" fill priority className="object-cover object-[62%_center] opacity-65 sm:object-center" sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-r from-forest-950 via-forest-950/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-transparent" />
      <Container className="relative flex min-h-[410px] items-end pb-12 pt-16 sm:min-h-[454px] sm:pb-20 sm:pt-20">
        <div className="max-w-3xl">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.24em] text-sand-300 sm:mb-5 sm:text-xs sm:tracking-[0.3em]">{eyebrow}</p>
          <h1 className="break-words font-display text-[2.55rem] leading-[1.02] sm:text-6xl lg:text-7xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-sand-100 sm:text-lg">{text}</p>
        </div>
      </Container>
    </section>
  );
}
