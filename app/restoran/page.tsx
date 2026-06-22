import type { Metadata } from "next";
import Image from "next/image";
import { CakeSlice, ChefHat, Clock, Heart, PartyPopper, Sparkles, Timer, UsersRound, UtensilsCrossed } from "lucide-react";
import { CallChoiceDialog } from "@/components/CallChoiceDialog";
import { PageHero } from "@/components/PageHero";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RESTAURANT_MENU_URL } from "@/lib/constants";

export const metadata: Metadata = { title: "Ресторан", description: "Ресторан Вільшанки для сімейних вечерь, святкувань і теплих зустрічей." };

const events = [
  { icon: CakeSlice, label: "День народження" },
  { icon: Heart, label: "Весілля" },
  { icon: Sparkles, label: "Ювілей" },
  { icon: PartyPopper, label: "Гендер-паті" },
  { icon: UsersRound, label: "Корпоратив" },
  { icon: Heart, label: "Сімейні свята" },
];

const restaurantTerms = [
  { icon: Clock, title: "Графік роботи", text: "Ресторан працює щодня з 11:00 до 22:00.", accent: "11:00–22:00" },
  { icon: ChefHat, title: "Індивідуальне меню", text: "За попереднім бронюванням ресторан може адаптувати меню під вашу компанію, формат свята або побажання гостей." },
  { icon: Timer, title: "Продовження роботи", text: "За бажанням гостей роботу ресторану можна продовжити.", accent: "4000 грн / година" },
  { icon: UsersRound, title: "Обслуговування для компаній", text: "Для компаній від 8 людей до чеку додається 10% обслуговування.", accent: "від 8 гостей · 10%" },
];

export default function RestaurantPage() {
  return (
    <>
      <PageHero eyebrow="Їжа, що збирає разом" title="Ресторан «Вільшанка»" text="Тепла кухня, сезонні продукти й атмосфера, у якій хочеться залишитися ще на одну розмову." image="/images/house-big-interior.svg" />
      <section className="bg-sand-50 py-20 sm:py-28">
        <Container>
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-24">
            <div>
              <SectionHeading eyebrow="Без зайвого" title="Зрозумілі смаки. Щедра гостинність." text="Ми готуємо страви, які пасують відпочинку за містом: чесні, свіжі й такі, якими хочеться ділитися. Тут добре снідати після тихого ранку, обідати всією родиною та збирати великий святковий стіл." />
              <a href={RESTAURANT_MENU_URL} target="_blank" rel="noopener noreferrer" className="button-dark mt-8 w-full sm:w-auto"><UtensilsCrossed size={17} /> Переглянути меню</a>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="relative min-h-[280px] overflow-hidden rounded-[1.5rem] sm:min-h-[420px] sm:rounded-[2rem]"><Image src="/images/house-family-interior.svg" alt="Зала ресторану Вільшанки" fill className="object-cover" sizes="(max-width: 640px) 100vw, 25vw" /></div>
              <div className="relative min-h-[280px] overflow-hidden rounded-[1.5rem] sm:mt-12 sm:min-h-[420px] sm:rounded-[2rem]"><Image src="/images/house-terrace-interior.svg" alt="Атмосфера ресторану Вільшанки" fill className="object-cover" sizes="(max-width: 640px) 100vw, 25vw" /></div>
            </div>
          </div>
        </Container>
      </section>
      <section className="bg-sand-100 py-20 sm:py-28">
        <Container>
          <SectionHeading eyebrow="Важливо знати" title="Умови ресторану" text="Меню можна адаптувати під ваш формат відпочинку або події за попереднім бронюванням." />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {restaurantTerms.map(({ icon: Icon, title, text, accent }) => (
              <article key={title} className="flex min-h-[310px] flex-col rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-soft sm:p-8">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-forest-900 text-gold"><Icon size={22} /></span>
                <h3 className="mt-7 font-display text-2xl text-forest-900">{title}</h3>
                {accent && <p className="mt-3 text-sm font-bold text-forest-700">{accent}</p>}
                <p className="mt-4 leading-7 text-stone-600">{text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>
      <section className="bg-forest-900 py-20 text-white sm:py-28">
        <Container>
          <SectionHeading eyebrow="Ваші події" title="Святкування у Вільшанці" text="У комплексі часто проводять весілля, корпоративи, дні народження, ювілеї, гендер-паті та сімейні свята. Простір біля води, ресторан і територія комплексу підходять для камерних подій і великих компаній." light />
          <div className="mt-12 grid gap-px overflow-hidden rounded-[2rem] bg-white/10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {events.map(({ icon: Icon, label }) => <div key={label} className="bg-forest-800 p-7"><Icon className="text-gold" size={27} strokeWidth={1.5} /><p className="mt-8 font-display text-2xl">{label}</p></div>)}
          </div>
          <CallChoiceDialog label="Зателефонувати для уточнення дати" className="button-primary mt-9 w-full sm:w-auto" />
        </Container>
      </section>
    </>
  );
}
