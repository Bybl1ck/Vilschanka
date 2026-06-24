import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Home, Phone, Ruler, Users } from "lucide-react";
import { BookingCalendar } from "@/components/BookingCalendar";
import { CallChoiceDialog } from "@/components/CallChoiceDialog";
import { CallbackForm } from "@/components/CallbackForm";
import { HousePriceGrid } from "@/components/HousePriceGrid";
import { HouseGallery } from "@/components/HouseGallery";
import { Container } from "@/components/ui/Container";
import { getHouseBySlug } from "@/lib/houses";
import { PHONE_PRIMARY, PHONE_PRIMARY_HREF } from "@/lib/constants";
import { getMinimumHousePrice } from "@/lib/pricing";
import { validDateKeys } from "@/lib/date";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const house = await getHouseBySlug(slug);
  if (!house) return { title: "Будиночок не знайдено" };
  return { title: house.name, description: house.shortDescription };
}

export default async function HouseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const selectedDates = validDateKeys(query.dates || query.date);
  const house = await getHouseBySlug(slug);
  if (!house) notFound();
  const minimumPrice = getMinimumHousePrice(house.prices, house.pricePerNight);
  const galleryImages = Array.from(new Set([house.mainImage, ...house.gallery].filter(Boolean)));

  return (
    <>
      <section className="bg-forest-950 pb-8 pt-[138px] text-white sm:pb-12 sm:pt-[154px]">
        <Container>
          <Link href="/budynochky" className="mb-8 inline-flex items-center gap-2 text-sm text-sand-200 transition hover:text-white"><ArrowLeft size={16} /> До всіх будиночків</Link>
          <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-sand-300">Вільшанка · ваш простір</p>
              <h1 className="break-words font-display text-[2.6rem] leading-[1.02] sm:text-7xl">{house.name}</h1>
            </div>
            <div className="lg:text-right">
              <p className="text-sm text-sand-200">вартість проживання</p>
              <p className="mt-1 font-display text-4xl text-sand-100">від {minimumPrice.toLocaleString("uk-UA")} грн <span className="font-sans text-sm">/ доба</span></p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-forest-950 pb-14">
        <Container>
          <HouseGallery images={galleryImages} houseName={house.name} />
        </Container>
      </section>

      <section className="bg-sand-50 py-20 sm:py-28">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1.1fr_.9fr] lg:gap-24">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-gold">Про будиночок</p>
              <h2 className="mt-4 font-display text-4xl text-forest-900 sm:text-5xl">Місце для спокійних ранків</h2>
              <p className="mt-7 text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">{house.fullDescription}</p>
              <div className="mt-10 grid grid-cols-3 gap-2 sm:gap-3">
                <div className="min-w-0 rounded-2xl bg-white p-3 sm:p-5"><Users className="text-gold" size={20} /><p className="mt-3 text-[10px] text-stone-500 sm:mt-4 sm:text-xs">Гостей</p><p className="mt-1 font-display text-lg sm:text-2xl">до {house.guests}</p></div>
                <div className="min-w-0 rounded-2xl bg-white p-3 sm:p-5"><Ruler className="text-gold" size={20} /><p className="mt-3 text-[10px] text-stone-500 sm:mt-4 sm:text-xs">Площа</p><p className="mt-1 whitespace-nowrap font-display text-lg sm:text-2xl">{house.area} м²</p></div>
                <div className="min-w-0 rounded-2xl bg-white p-3 sm:p-5"><Home className="text-gold" size={20} /><p className="mt-3 text-[10px] text-stone-500 sm:mt-4 sm:text-xs">Тип</p><p className="mt-1 font-display text-base sm:text-xl">окремий</p></div>
              </div>
            </div>
            <div>
              <HousePriceGrid prices={house.prices} fallback={house.pricePerNight} />
              <div className="mt-10">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-gold">У будиночку</p>
              <h2 className="mt-4 font-display text-4xl text-forest-900">Зручності</h2>
              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {house.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-3 border-b border-stone-200 py-3 text-stone-700"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-forest-900 text-white"><Check size={14} /></span>{amenity}</div>
                ))}
              </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-sand-100 py-20 sm:py-28">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-gold">Зайнятість</p>
              <h2 className="mt-4 font-display text-4xl text-forest-900 sm:text-5xl">Перевірте вільні дати</h2>
              <p className="mt-6 leading-7 text-stone-600">Сірі дні з хрестиком уже зайняті. Натисніть на вільну дату, щоб залишити заявку. Обрана дата не є бронюванням — її підтверджує адміністратор телефоном.</p>
              <div className="mt-8 rounded-2xl bg-white p-5 sm:p-6">
                <p className="font-bold text-forest-900">Для бронювання зателефонуйте нам</p>
                <a href={PHONE_PRIMARY_HREF} className="mt-4 inline-flex items-center gap-2 text-lg font-bold text-forest-700 sm:text-xl"><Phone size={19} /> {PHONE_PRIMARY}</a>
              </div>
            </div>
            <BookingCalendar
              bookedDates={house.bookedDates}
              houseSlug={house.slug}
              houseName={house.name}
              callbackPath={`/budynochky/${house.slug}`}
              callbackAnchor="house-callback-form"
            />
          </div>
        </Container>
      </section>

      <section className="bg-sand-50 py-16 sm:py-24">
        <Container>
          <div id="house-callback-form" className="scroll-mt-28">
            <CallbackForm
              title="Залиште номер — ми уточнимо доступність будиночка"
              subtitle="Адміністратор перевірить обрану дату, відповість на запитання та зателефонує вам."
              source={`Будиночок: ${house.name}`}
              selectedDates={selectedDates}
              houseName={house.name}
            />
          </div>
        </Container>
      </section>

      <section className="bg-forest-900 py-20 text-white">
        <Container className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-sand-300">Як забронювати</p>
          <h2 className="mx-auto mt-4 max-w-3xl font-display text-4xl leading-tight sm:text-6xl">Один дзвінок — і будиночок чекатиме на вас</h2>
          <p className="mx-auto mt-6 max-w-xl leading-7 text-sand-200">Ми уточнимо кількість гостей, перевіримо дати й розповімо всі деталі. Онлайн-бронювання та оплати на сайті немає.</p>
          <CallChoiceDialog className="button-primary mt-9 w-full sm:w-auto" />
        </Container>
      </section>
    </>
  );
}
