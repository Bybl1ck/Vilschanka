import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <section className="flex min-h-[75vh] items-center bg-sand-50 pb-20 pt-32 text-center">
      <Container>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-gold">404</p>
        <h1 className="mt-5 font-display text-5xl text-forest-900 sm:text-7xl">Схоже, ця стежка нікуди не веде</h1>
        <p className="mx-auto mt-6 max-w-xl leading-7 text-stone-600">Поверніться на головну або перегляньте наші будиночки.</p>
        <Link href="/" className="button-dark mt-8">На головну</Link>
      </Container>
    </section>
  );
}
