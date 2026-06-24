import type { Metadata } from "next";
import { Phone } from "lucide-react";
import { CallbackForm } from "@/components/CallbackForm";
import { LocationMap } from "@/components/LocationMap";
import { FacebookIcon } from "@/components/icons/FacebookIcon";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { PageHero } from "@/components/PageHero";
import { Container } from "@/components/ui/Container";
import {
  FACEBOOK_URL,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  PHONE_PRIMARY,
  PHONE_PRIMARY_HREF,
  PHONE_SECONDARY,
  PHONE_SECONDARY_HREF,
} from "@/lib/constants";
import { getHouseBySlug } from "@/lib/houses";
import { validDateKeys } from "@/lib/date";
import { getPageSetting } from "@/lib/page-settings";

export const metadata: Metadata = { title: "Контакти", description: "Телефони, адреса та соціальні мережі заміського комплексу Вільшанка." };
export const dynamic = "force-dynamic";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const rawHouse = Array.isArray(query.house) ? query.house[0] : query.house;
  const selectedDates = validDateKeys(query.dates || query.date);
  const [selectedHouse, heroSetting] = await Promise.all([
    rawHouse ? getHouseBySlug(rawHouse) : Promise.resolve(undefined),
    getPageSetting("contacts"),
  ]);

  return (
    <>
      <PageHero eyebrow="Ми на зв’язку" title="Заплануймо ваш відпочинок" text="Зателефонуйте, щоб уточнити вільні дати, умови проживання, меню чи організацію свята." image={heroSetting.backgroundImage} />
      <section className="bg-sand-50 py-20 sm:py-28">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
            <div className="min-w-0 rounded-[1.5rem] bg-forest-900 p-6 text-white sm:rounded-[2rem] sm:p-12">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-sand-300">Контакти</p>
              <h2 className="mt-5 break-words font-display text-[2.1rem] leading-tight sm:text-5xl">Говоримо по-людськи й допомагаємо обрати</h2>
              <p className="mt-6 leading-7 text-sand-200">Будь ласка, телефонуйте за одним із номерів. Розповімо про будиночки та підтвердимо актуальні дати.</p>
              <div className="mt-10 grid gap-4">
                <a href={PHONE_PRIMARY_HREF} className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/15 p-4 transition hover:bg-white/10 sm:gap-4 sm:p-5"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sand-100 text-forest-900"><Phone size={19} /></span><span className="min-w-0"><small className="block text-sand-300">Телефон будиночки</small><strong className="text-lg sm:text-xl">{PHONE_PRIMARY}</strong></span></a>
                <a href={PHONE_SECONDARY_HREF} className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/15 p-4 transition hover:bg-white/10 sm:gap-4 sm:p-5"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sand-100 text-forest-900"><Phone size={19} /></span><span className="min-w-0"><small className="block text-sand-300">Телефон ресторан</small><strong className="text-lg sm:text-xl">{PHONE_SECONDARY}</strong></span></a>
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/15 p-4 transition hover:border-gold/50 hover:bg-white/10 sm:gap-4 sm:p-5"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold text-forest-950"><InstagramIcon size={19} /></span><span className="min-w-0"><small className="block text-sand-300">Instagram</small><strong className="break-all text-base min-[390px]:text-lg sm:text-xl">{INSTAGRAM_HANDLE}</strong></span></a>
                <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/15 p-4 transition hover:border-gold/50 hover:bg-white/10 sm:gap-4 sm:p-5"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold text-forest-950"><FacebookIcon size={19} /></span><span className="min-w-0"><small className="block text-sand-300">Facebook</small><strong className="text-lg sm:text-xl">Вільшанка</strong></span></a>
              </div>
            </div>
            <LocationMap />
          </div>
          <div id="callback-form" className="mt-10 scroll-mt-28 sm:mt-14">
            <CallbackForm
              title="Залиште свій номер — ми вам передзвонимо"
              subtitle="Адміністратор відповість на ваші запитання, підкаже вільні дати та умови відпочинку."
              source="Контакти"
              selectedDates={selectedDates}
              houseName={selectedHouse?.name}
            />
          </div>
        </Container>
      </section>
    </>
  );
}
