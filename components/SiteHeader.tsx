"use client";

import Link from "next/link";
import { MapPin, Menu, X } from "lucide-react";
import { useRef } from "react";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { CallChoiceDialog } from "@/components/CallChoiceDialog";
import { FacebookIcon } from "@/components/icons/FacebookIcon";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { Container } from "@/components/ui/Container";
import { FACEBOOK_URL, GOOGLE_MAPS_URL, INSTAGRAM_URL, SITE_ADDRESS } from "@/lib/constants";

const links = [
  { href: "/budynochky", label: "Будиночки" },
  { href: "/restoran", label: "Ресторан" },
  { href: "/aktyvnosti", label: "Активності" },
  { href: "/znyzhky", label: "Знижки" },
  { href: "/kontakty", label: "Контакти" },
];
const mobileLinks = [{ href: "/", label: "Головна" }, ...links];

export function SiteHeader() {
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const closeMobileMenu = () => {
    if (mobileMenuRef.current) mobileMenuRef.current.open = false;
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gold/20 bg-forest-950/95 text-sand-100 shadow-[0_8px_30px_rgba(7,18,32,0.22)] backdrop-blur-xl">
      <div className="border-b border-white/10 bg-forest-900/80">
        <Container className="flex min-h-[34px] items-center justify-center py-1.5 sm:justify-start">
          <a href={GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] leading-4 text-sand-200 transition hover:text-white sm:text-xs">
            <MapPin size={13} className="shrink-0 text-gold" />
            <span className="hidden sm:inline">{SITE_ADDRESS}</span>
            <span className="sm:hidden">вул. Лиманна, 3, Лозівок</span>
          </a>
        </Container>
      </div>
      <Container className="flex h-[76px] items-center justify-between">
        <Link href="/" className="group flex items-center" aria-label="Вільшанка — головна">
          <BrandLogo
            className="h-12 w-32 overflow-hidden rounded-xl border border-gold/35 bg-forest-900 transition group-hover:border-gold/70 min-[390px]:h-14 min-[390px]:w-36 sm:h-16 sm:w-44"
            imageClassName="!object-contain object-center"
            fallbackClassName="grid h-full w-full place-items-center px-3 font-display text-xl text-gold sm:text-2xl"
            fallbackText="Вільшанка"
          />
        </Link>

        <nav className="hidden items-center gap-5 lg:flex" aria-label="Головна навігація">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`relative py-2 text-xs transition after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:bg-gold after:transition-transform xl:text-sm ${
                isActive(link.href) ? "text-white after:scale-x-100" : "text-sand-200 after:scale-x-0 hover:text-white hover:after:scale-x-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-1 sm:flex">
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="rounded-full p-2.5 text-sand-100 transition hover:bg-white/10" aria-label="Instagram Вільшанки">
            <InstagramIcon size={18} />
          </a>
          <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="rounded-full p-2.5 text-sand-100 transition hover:bg-white/10" aria-label="Facebook Вільшанки">
            <FacebookIcon size={18} />
          </a>
          <CallChoiceDialog className="ml-2 inline-flex min-h-11 items-center gap-2 rounded-full bg-gold px-4 py-3 text-sm font-bold text-forest-950 transition hover:bg-sand-100 xl:px-5" />
        </div>

        <details ref={mobileMenuRef} className="group relative lg:hidden">
          <summary className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-full border border-white/20 [&::-webkit-details-marker]:hidden">
            <Menu className="group-open:hidden" size={21} />
            <X className="hidden group-open:block" size={21} />
          </summary>
          <div className="fixed inset-x-0 top-[110px] max-h-[calc(100dvh-110px)] overflow-y-auto border-t border-white/10 bg-forest-950 px-5 py-5 shadow-2xl sm:px-8">
            <nav className="flex flex-col" aria-label="Мобільна навігація">
              {mobileLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={closeMobileMenu} aria-current={isActive(link.href) ? "page" : undefined} className={`border-b border-white/10 px-2 py-3.5 font-display text-xl min-[390px]:text-2xl ${isActive(link.href) ? "text-gold" : "text-sand-100"}`}>
                  {link.label}
                </Link>
              ))}
              <div className="mt-5 flex items-center justify-center gap-2">
                <a href={INSTAGRAM_URL} onClick={closeMobileMenu} target="_blank" rel="noopener noreferrer" className="grid h-12 w-12 place-items-center rounded-full border border-white/15 text-sand-100" aria-label="Instagram Вільшанки"><InstagramIcon size={19} /></a>
                <a href={FACEBOOK_URL} onClick={closeMobileMenu} target="_blank" rel="noopener noreferrer" className="grid h-12 w-12 place-items-center rounded-full border border-white/15 text-sand-100" aria-label="Facebook Вільшанки"><FacebookIcon size={19} /></a>
              </div>
              <CallChoiceDialog onSelect={closeMobileMenu} className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 font-bold text-forest-950" />
            </nav>
          </div>
        </details>
      </Container>
    </header>
  );
}
