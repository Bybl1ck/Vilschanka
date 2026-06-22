import type { Metadata } from "next";
import { Gift, Info, Medal } from "lucide-react";
import { CallChoiceDialog } from "@/components/CallChoiceDialog";
import { PageHero } from "@/components/PageHero";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Знижки та спеціальні пропозиції",
  description: "Знижки для іменинників і військовослужбовців у заміському комплексі Вільшанка.",
};

const offers = [
  {
    icon: Gift,
    title: "Іменинникам знижка 20%",
    text: "Для отримання знижки покажіть адміністратору закладу документ, де зазначено дату вашого народження.",
    dark: true,
  },
  {
    icon: Medal,
    title: "Пропозиція для військовослужбовців: знижка 20%",
    text: "Для отримання знижки покажіть адміністратору закладу посвідчення учасника бойових дій.",
    dark: false,
  },
];

export default function DiscountsPage() {
  return (
    <>
      <PageHero
        eyebrow="Особливі умови"
        title="Знижки та спеціальні пропозиції"
        text="Ми цінуємо наших гостей і підготували приємні умови для особливих випадків."
      />

      <section className="bg-sand-50 py-20 sm:py-28">
        <Container>
          <div className="grid gap-6 lg:grid-cols-2">
            {offers.map(({ icon: Icon, title, text, dark }, index) => (
              <article key={title} className={`relative flex min-h-[380px] min-w-0 flex-col overflow-hidden rounded-[1.5rem] border p-6 shadow-soft sm:min-h-[430px] sm:rounded-[2rem] sm:p-11 ${dark ? "border-gold/30 bg-forest-900 text-sand-100" : "border-gold/50 bg-white text-forest-900"}`}>
                <div className={`absolute -right-16 -top-16 h-56 w-56 rounded-full border-[55px] ${dark ? "border-white/5" : "border-forest-900/5"}`} />
                <div className="relative flex items-start justify-between">
                  <span className={`grid h-14 w-14 place-items-center rounded-full sm:h-16 sm:w-16 ${dark ? "bg-gold text-forest-950" : "bg-forest-900 text-gold"}`}><Icon size={26} strokeWidth={1.6} /></span>
                  <span className={`font-display text-5xl sm:text-6xl ${dark ? "text-gold" : "text-forest-900"}`}>20%</span>
                </div>
                <div className="relative mt-auto pt-12 sm:pt-16">
                  <p className={`text-xs font-bold uppercase tracking-[0.22em] ${dark ? "text-gold" : "text-forest-700"}`}>Пропозиція 0{index + 1}</p>
                  <h2 className="mt-4 max-w-xl break-words font-display text-[1.7rem] leading-tight sm:text-4xl">{title}</h2>
                  <p className={`mt-5 max-w-xl leading-7 ${dark ? "text-sand-200" : "text-stone-600"}`}>{text}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-gold/50 bg-sand-100 p-5 text-sm leading-6 text-forest-900 sm:items-center sm:p-6">
            <Info size={20} className="mt-0.5 shrink-0 text-forest-700 sm:mt-0" />
            <p><strong>Зверніть увагу:</strong> знижки не сумуються з іншими акційними пропозиціями. Деталі уточнюйте в адміністратора.</p>
          </div>

          <div className="mt-12 rounded-[1.5rem] bg-forest-950 px-5 py-10 text-center text-sand-100 sm:mt-14 sm:rounded-[2rem] sm:px-12 sm:py-16">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">Уточнити деталі</p>
            <h2 className="mx-auto mt-4 max-w-3xl break-words font-display text-[2rem] leading-tight sm:text-5xl">Розповімо про умови та допоможемо запланувати відпочинок</h2>
            <CallChoiceDialog className="button-primary mt-8 w-full sm:w-auto" />
          </div>
        </Container>
      </section>
    </>
  );
}
