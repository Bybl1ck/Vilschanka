import Link from "next/link";
import { Phone } from "lucide-react";
import { FacebookIcon } from "@/components/icons/FacebookIcon";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
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

export function SiteFooter() {
  return (
    <footer className="bg-forest-950 py-16 text-sand-100">
      <Container>
        <div className="grid gap-12 border-b border-white/10 pb-14 md:grid-cols-[1.2fr_0.8fr_1fr]">
          <div>
            <Link href="/" className="font-display text-4xl">Вільшанка</Link>
            <p className="mt-5 max-w-sm leading-7 text-sand-200/80">Місце біля води, де шум міста змінюється шелестом дерев, а поспіх — довгими розмовами на терасі.</p>
          </div>
          <div>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-gold">Навігація</p>
            <div className="grid gap-3 text-sm text-sand-200">
              <Link href="/budynochky" className="hover:text-white">Будиночки</Link>
              <Link href="/restoran" className="hover:text-white">Ресторан</Link>
              <Link href="/aktyvnosti" className="hover:text-white">Активності</Link>
              <Link href="/znyzhky" className="hover:text-white">Знижки</Link>
              <Link href="/kontakty" className="hover:text-white">Контакти</Link>
            </div>
          </div>
          <div>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-gold">Зв’язатися</p>
            <div className="grid gap-3 text-lg">
              <a href={PHONE_PRIMARY_HREF} className="flex items-center gap-3 hover:text-white"><Phone size={17} /> {PHONE_PRIMARY}</a>
              <a href={PHONE_SECONDARY_HREF} className="flex items-center gap-3 hover:text-white"><Phone size={17} /> {PHONE_SECONDARY}</a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-white"><InstagramIcon size={17} /> {INSTAGRAM_HANDLE}</a>
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-white"><FacebookIcon size={17} /> Facebook</a>
            </div>
          </div>
        </div>
        <div className="pt-7 text-xs text-sand-200/60">
          <p>© {new Date().getFullYear()} Вільшанка. Відпочивайте повільніше.</p>
        </div>
      </Container>
    </footer>
  );
}
