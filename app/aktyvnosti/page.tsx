import type { Metadata } from "next";
import { Bath, Fish, FlameKindling, Phone, ShipWheel, Sun, Waves } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PHONE_PRIMARY_HREF } from "@/lib/constants";

export const metadata: Metadata = { title: "Активності", description: "Риболовля, баня, SUP-дошки, каяки, альтанки та відпочинок біля води у Вільшанці." };

const activities = [
  { icon: Fish, number: "01", title: "Риболовля", text: "Знайдіть своє тихе місце біля води й дозвольте ранку тривати довше. Підійде і досвідченим рибалкам, і тим, хто хоче спробувати вперше." },
  { icon: Bath, number: "02", title: "Баня та сауна", text: "Глибоке тепло, аромат дерева й заслужений відпочинок після активного дня. Час відвідування узгоджується заздалегідь телефоном." },
  { icon: Waves, number: "03", title: "SUP-дошки", text: "Спокійна прогулянка по воді, свіже повітря та зовсім інший ракурс на природу навколо." },
  { icon: ShipWheel, number: "04", title: "Каяки", text: "Для короткої водної мандрівки вдвох або неквапливого дослідження берегів усією компанією." },
  { icon: FlameKindling, number: "05", title: "Альтанки", text: "Власний затишний простір для обіду на свіжому повітрі, вечірніх розмов і страв із вогню." },
  { icon: Sun, number: "06", title: "Відпочинок біля води", text: "Іноді найкращий план — не планувати нічого. Плед, книжка, берег і багато часу попереду." },
];

export default function ActivitiesPage() {
  return (
    <>
      <PageHero eyebrow="День у своєму ритмі" title="На воді, біля вогню, серед тиші" text="Будьте активними або не робіть нічого — у «Вільшанці» обидва плани однаково правильні." />
      <section className="bg-forest-900 py-16 text-sand-100 sm:py-24">
        <Container>
          <div className="grid gap-8 rounded-[2rem] border border-gold/25 bg-forest-800 p-6 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
            <div className="max-w-3xl">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-gold text-forest-950"><Waves size={25} /></span>
              <p className="mt-7 text-xs font-bold uppercase tracking-[0.24em] text-gold">Активний відпочинок на воді</p>
              <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">SUP-дошки та каяки</h2>
              <p className="mt-5 text-base leading-7 text-sand-200 sm:text-lg">Активний відпочинок на воді для компанії, пари або сім’ї. Оренда доступна погодинно.</p>
            </div>
            <div className="rounded-[1.5rem] bg-sand-50 p-6 text-forest-900 shadow-soft sm:min-w-[300px] sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest-700">Вартість оренди</p>
              <p className="mt-3 font-display text-4xl font-bold">350 грн</p>
              <p className="mt-1 text-sm text-stone-500">за 1 годину</p>
            </div>
          </div>
        </Container>
      </section>
      <section className="bg-sand-50 py-20 sm:py-28">
        <Container>
          <SectionHeading eyebrow="Чим зайнятися" title="Шість способів відчути вихідні" text="Наявність інвентарю та вільний час для бані краще уточнити телефоном перед приїздом." />
          <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-14 md:grid-cols-2 lg:grid-cols-3">
            {activities.map(({ icon: Icon, number, title, text }) => (
              <article key={title} className="group flex min-h-[310px] min-w-0 flex-col rounded-[1.5rem] border border-stone-200 bg-white p-6 transition hover:-translate-y-1 hover:bg-forest-900 hover:text-white hover:shadow-soft sm:min-h-[360px] sm:rounded-[2rem] sm:p-10">
                <div className="flex items-start justify-between"><Icon size={34} strokeWidth={1.4} className="text-gold" /><span className="text-xs text-stone-400">{number}</span></div>
                <div className="mt-auto pt-12 sm:pt-16"><h2 className="font-display text-3xl">{title}</h2><p className="mt-4 leading-7 text-stone-600 transition group-hover:text-sand-200">{text}</p></div>
              </article>
            ))}
          </div>
        </Container>
      </section>
      <section className="bg-sand-100 py-20 sm:py-28">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <SectionHeading eyebrow="Окрема послуга" title="Риболовля у Вільшанці" text="У Вільшанці можна приїхати не лише на відпочинок у будиночку, а й окремо на риболовлю. У ставках вирощується щука, судак, окунь, короп та інша риба." />
            <div className="rounded-[1.5rem] bg-forest-900 p-6 text-sand-100 sm:p-8">
              <div className="flex items-center gap-3"><Fish className="text-gold" size={28} /><h3 className="font-display text-2xl">Риба у ставках</h3></div>
              <p className="mt-4 leading-7 text-sand-200">У ставках вирощується щука, судак, окунь, короп та інша риба.</p>
            </div>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <article className="rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-soft sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-forest-700">Тариф 01</p>
              <h3 className="mt-3 font-display text-3xl text-forest-900">Для гостей без проживання</h3>
              <div className="mt-7 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-sand-50 p-4"><strong className="block font-display text-2xl text-forest-900">500 грн</strong><span className="mt-1 block text-xs text-stone-500">день · з особи</span></div>
                <div className="rounded-xl bg-sand-50 p-4"><strong className="block font-display text-2xl text-forest-900">800 грн</strong><span className="mt-1 block text-xs text-stone-500">доба · з особи</span></div>
              </div>
            </article>
            <article className="rounded-[1.5rem] border border-gold/50 bg-forest-900 p-6 text-sand-100 shadow-soft sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Тариф 02</p>
              <h3 className="mt-3 font-display text-3xl">Для гостей будиночків</h3>
              <div className="mt-7 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/10 p-4"><strong className="block font-display text-2xl text-gold">300 грн</strong><span className="mt-1 block text-xs text-sand-200">день · з особи</span></div>
                <div className="rounded-xl bg-white/10 p-4"><strong className="block font-display text-2xl text-gold">600 грн</strong><span className="mt-1 block text-xs text-sand-200">доба · з особи</span></div>
              </div>
            </article>
          </div>
          <a href={PHONE_PRIMARY_HREF} className="button-dark mt-8 w-full sm:w-auto"><Phone size={18} /> Уточнити умови риболовлі</a>
        </Container>
      </section>
    </>
  );
}
