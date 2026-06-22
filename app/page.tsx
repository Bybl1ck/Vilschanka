import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  Bath,
  ChefHat,
  Fish,
  House,
  PartyPopper,
  ShipWheel,
  Sparkles,
  Trees,
  UtensilsCrossed,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HouseCard } from "@/components/HouseCard";
import { CallChoiceDialog } from "@/components/CallChoiceDialog";
import { getHouses } from "@/lib/houses";
import { RESTAURANT_MENU_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

const benefits = [
  { icon: House, title: "Будиночки", text: "Затишні простори для двох, родини чи компанії." },
  { icon: ChefHat, title: "Ресторан", text: "Зрозумілі страви, сезонні продукти та щедрі столи." },
  { icon: Bath, title: "Баня", text: "Тепло, пара й відновлення після дня на природі." },
  { icon: Fish, title: "Риболовля", text: "Тихі ранки з вудкою просто біля води." },
  { icon: ShipWheel, title: "SUP і каяки", text: "Оренда SUP-дошок та каяків — 350 грн / година." },
  { icon: PartyPopper, title: "Святкування", text: "Події, про які приємно згадувати разом." },
];

const celebrationTypes = ["Весілля", "Корпоративи", "Дні народження", "Ювілеї", "Гендер-паті", "Сімейні свята"];

export default async function HomePage() {
  const houses = await getHouses();

  return (
    <>
      <section className="relative flex min-h-[720px] items-end overflow-hidden bg-forest-950 pt-[110px] text-white sm:min-h-[854px]">
        <Image src="/images/hero-lake.svg" alt="Будиночок Вільшанки серед природи біля води" fill priority className="object-cover object-[68%_center] opacity-85 sm:object-center" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950/95 via-forest-950/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-transparent to-forest-950/20" />
        <Container className="relative pb-12 sm:pb-20 lg:pb-24">
          <div className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-sand-100 backdrop-blur sm:mb-7 sm:gap-3 sm:px-4 sm:text-xs sm:tracking-[0.22em]">
              <Trees size={15} className="text-sand-300" /> тиша ближче, ніж здається
            </div>
            <h1 className="break-words font-display text-[clamp(2.65rem,12vw,4rem)] leading-[.94] tracking-[-0.035em] sm:text-[clamp(4rem,7.4vw,7rem)] sm:leading-[.88]">
              Заміський комплекс відпочинку <span className="text-sand-300">«Вільшанка»</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-sand-100 sm:text-xl sm:leading-8">Будиночки, баня, риболовля, SUP, каяки та ресторан серед природи.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/budynochky" className="button-primary w-full sm:w-auto">Переглянути будиночки <ArrowUpRight size={17} /></Link>
              <CallChoiceDialog className="button-outline-light w-full sm:w-auto" />
              <a href={RESTAURANT_MENU_URL} target="_blank" rel="noopener noreferrer" className="button-outline-light w-full sm:w-auto"><UtensilsCrossed size={17} /> Меню ресторану</a>
            </div>
          </div>
          <a href="#pro-nas" className="absolute bottom-16 right-12 hidden h-14 w-14 place-items-center rounded-full border border-white/30 text-white transition hover:bg-white/10 lg:grid" aria-label="Дізнатися більше">
            <ArrowDown size={20} />
          </a>
        </Container>
      </section>

      <section id="pro-nas" className="bg-sand-50 py-24 sm:py-32">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <SectionHeading eyebrow="Місце для своїх" title="Тут можна просто бути" />
            <div className="grid gap-8 sm:grid-cols-2">
              <p className="text-lg leading-8 text-stone-600">Приїхати на вихідні без складного плану. Прокинутися без будильника, випити каву на терасі й провести день біля води.</p>
              <p className="text-lg leading-8 text-stone-600">У «Вільшанці» є простір і для тихого відпочинку, і для теплого свята — з людьми, яких хочеться бачити поруч.</p>
            </div>
          </div>
          <div className="mt-16 grid gap-px overflow-hidden rounded-[2rem] bg-stone-200 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map(({ icon: Icon, title, text }, index) => (
              <div key={title} className="group bg-white p-6 transition hover:bg-sand-100 sm:p-10">
                <div className="flex items-start justify-between">
                  <Icon size={29} strokeWidth={1.5} className="text-gold" />
                  <span className="text-xs text-stone-400">0{index + 1}</span>
                </div>
                <h3 className="mt-8 font-display text-3xl text-forest-900 sm:mt-10">{title}</h3>
                <p className="mt-3 leading-7 text-stone-600">{text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-forest-900 py-24 sm:py-32">
        <Container>
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow="Ваш простір" title="Будиночки для повільних вихідних" text="Обирайте за настроєм і кількістю гостей. Актуальні вільні дати можна перевірити на сторінці кожного будиночка." light />
            <Link href="/budynochky" className="button-outline-light shrink-0">Усі будиночки <ArrowUpRight size={17} /></Link>
          </div>
          <div className="mt-14 grid gap-7">
            {houses.slice(0, 1).map((house) => <HouseCard key={house.id} house={house} featured />)}
            <div className="grid gap-7 md:grid-cols-2">
              {houses.slice(1, 3).map((house) => <HouseCard key={house.id} house={house} />)}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-sand-100 py-24 sm:py-32">
        <Container>
          <div className="grid overflow-hidden rounded-[2.5rem] bg-forest-950 text-white shadow-soft lg:grid-cols-2">
            <div className="relative min-h-[280px] sm:min-h-[380px]">
              <Image src="/images/house-big-interior.svg" alt="Затишний ресторан Вільшанки" fill className="object-cover opacity-85" sizes="(max-width: 1024px) 100vw, 50vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/50 to-transparent" />
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-12 lg:p-16">
              <Sparkles className="text-gold" size={30} strokeWidth={1.5} />
              <p className="mt-8 text-xs font-bold uppercase tracking-[0.28em] text-sand-300">Ресторан і події</p>
              <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">Смачний привід зібратися разом</h2>
              <p className="mt-6 leading-7 text-sand-200">Родинна вечеря, день народження, весілля чи просто довгий обід після прогулянки — ми подбаємо про стіл і спокійну атмосферу.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/restoran" className="button-primary w-full sm:w-auto">Про ресторан <ArrowUpRight size={17} /></Link>
                <a href={RESTAURANT_MENU_URL} target="_blank" rel="noopener noreferrer" className="button-outline-light w-full sm:w-auto">Переглянути меню</a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-forest-900 py-20 text-sand-100 sm:py-28">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:gap-20">
            <div>
              <PartyPopper className="text-gold" size={34} strokeWidth={1.5} />
              <p className="mt-7 text-xs font-bold uppercase tracking-[0.25em] text-gold">Події біля води</p>
              <h2 className="mt-4 font-display text-[2.4rem] leading-tight sm:text-6xl">Святкування у Вільшанці</h2>
              <p className="mt-6 max-w-3xl text-base leading-7 text-sand-200 sm:text-lg sm:leading-8">У комплексі часто проводять весілля, корпоративи, дні народження, ювілеї, гендер-паті та сімейні свята. Простір біля води, ресторан і територія комплексу підходять для камерних подій і великих компаній.</p>
              <CallChoiceDialog label="Зателефонувати для уточнення дати" className="button-primary mt-8 w-full sm:w-auto" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {celebrationTypes.map((item, index) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
                  <span className="text-xs font-bold text-gold">0{index + 1}</span>
                  <p className="mt-3 font-display text-xl sm:text-2xl">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-sand-50 py-24 text-center sm:py-32">
        <Container>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-gold">Час видихнути</p>
          <h2 className="mx-auto mt-5 max-w-4xl font-display text-[2.4rem] leading-[1.05] text-forest-900 sm:text-7xl">Ваші тихі вихідні починаються з одного дзвінка</h2>
          <p className="mx-auto mt-6 max-w-xl leading-7 text-stone-600">Підкажемо, який будиночок підійде саме вам, і підтвердимо вільні дати.</p>
          <CallChoiceDialog className="button-dark mt-9 w-full sm:w-auto" />
        </Container>
      </section>
    </>
  );
}
