import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { LoginForm } from "@/components/admin/LoginForm";
import { isAdmin } from "@/lib/auth";

export const metadata = { title: "Вхід до адмін-панелі" };

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin/panel");

  return (
    <section className="relative flex min-h-[calc(100vh-76px)] items-center justify-center overflow-hidden bg-forest-900 px-5 py-12">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#D7C08A 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border-[90px] border-gold/10" />
      <div className="relative w-full max-w-md rounded-[2rem] border border-gold/25 bg-forest-950 p-7 text-sand-100 shadow-2xl sm:p-10">
        <BrandLogo
          className="mx-auto h-36 w-44 sm:h-44 sm:w-60"
          imageClassName="object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.24)]"
          fallbackClassName="font-display text-4xl text-gold sm:text-5xl"
          fallbackText="Вільшанка"
        />
        <span className="mt-7 grid h-12 w-12 place-items-center rounded-full bg-gold text-forest-950"><ShieldCheck size={22} /></span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-gold">Службовий вхід</p>
        <h1 className="mt-3 font-display text-4xl text-sand-100">Адмін-панель Вільшанки</h1>
        <p className="mt-4 leading-7 text-muted">Увійдіть, щоб редагувати будиночки та відмічати зайняті дати.</p>
        <LoginForm />
      </div>
    </section>
  );
}
