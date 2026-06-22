"use client";

import Link from "next/link";
import { ExternalLink, LogOut, ShieldCheck } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const isPanel = pathname.startsWith("/admin/panel");

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gold/25 bg-forest-950 text-sand-100 shadow-lg">
      <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between px-4 sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <BrandLogo
            className="h-10 w-12 rounded-lg border border-gold/30 bg-white/5 p-1 sm:h-11 sm:w-14"
            fallbackClassName="font-display text-xl text-gold"
            fallbackText="В"
          />
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold text-forest-950">
            <ShieldCheck size={19} />
          </span>
          <span className="min-w-0">
            <strong className="block truncate text-sm sm:text-base">Адмін-панель Вільшанки</strong>
            <small className="block text-[9px] uppercase tracking-[0.2em] text-muted">службова зона</small>
          </span>
        </div>

        <div className="ml-3 flex items-center gap-2">
          <Link href="/" target="_blank" className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 px-3 text-xs font-bold text-sand-200 transition hover:border-gold/60 hover:text-white sm:px-4">
            <ExternalLink size={15} /> <span className="hidden sm:inline">Відкрити сайт</span>
          </Link>
          {isPanel && (
            <button type="button" onClick={logout} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-sand-200 transition hover:border-gold/60 hover:text-white" aria-label="Вийти з адмін-панелі">
              <LogOut size={17} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
