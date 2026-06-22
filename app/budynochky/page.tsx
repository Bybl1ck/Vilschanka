import type { Metadata } from "next";
import { CallbackForm } from "@/components/CallbackForm";
import { HouseCard } from "@/components/HouseCard";
import { PageHero } from "@/components/PageHero";
import { Container } from "@/components/ui/Container";
import { getHouses } from "@/lib/houses";

export const metadata: Metadata = {
  title: "Будиночки для відпочинку",
  description: "Оберіть затишний будиночок у Вільшанці та перегляньте вільні дати.",
};

export const dynamic = "force-dynamic";

export default async function HousesPage() {
  const houses = await getHouses();

  return (
    <>
      <PageHero eyebrow="Жити ближче до природи" title="Будиночки для вашого відпочинку" text="Від камерного будиночка для двох до просторого дому для великої компанії. У кожного — свій характер, тераса й природа поруч." />
      <section className="bg-sand-50 py-20 sm:py-28">
        <Container>
          <div className="grid gap-8 md:grid-cols-2">
            {houses.map((house) => <HouseCard key={house.id} house={house} />)}
          </div>
          <div className="mt-14 sm:mt-16">
            <CallbackForm
              title="Залиште номер — ми допоможемо обрати будиночок"
              subtitle="Адміністратор уточнить вільні дати, ціни та допоможе підібрати будиночок для вашої компанії."
              source="Будиночки"
            />
          </div>
        </Container>
      </section>
    </>
  );
}
