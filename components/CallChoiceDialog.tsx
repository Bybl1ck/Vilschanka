"use client";

import { useEffect, useId, useRef, useState, type TouchEvent } from "react";
import { createPortal } from "react-dom";
import { Building2, Phone, UtensilsCrossed, X } from "lucide-react";
import {
  PHONE_PRIMARY,
  PHONE_PRIMARY_HREF,
  PHONE_SECONDARY,
  PHONE_SECONDARY_HREF,
} from "@/lib/constants";

interface CallChoiceDialogProps {
  label?: string;
  className?: string;
  onSelect?: () => void;
}

export function CallChoiceDialog({
  label = "Зателефонувати",
  className = "button-dark",
  onSelect,
}: CallChoiceDialogProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const touchActivated = useRef(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  function finishChoice() {
    setOpen(false);
    onSelect?.();
  }

  function openFromTouch(event: TouchEvent<HTMLButtonElement>) {
    // На iOS усуваємо залежність від синтетичного click після touchend.
    event.preventDefault();
    touchActivated.current = true;
    setOpen(true);
    window.setTimeout(() => { touchActivated.current = false; }, 700);
  }

  function openFromClick() {
    if (touchActivated.current) return;
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={openFromClick}
        onTouchEnd={openFromTouch}
        className={`${className} touch-manipulation`}
        aria-haspopup="dialog"
        aria-expanded={open}
        data-call-choice-trigger
      >
        <Phone size={18} /> {label}
      </button>
      {open && createPortal(
        <div
          className="pointer-events-auto fixed inset-0 z-[9999] isolate flex items-end justify-center bg-[#071220]/75 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 w-full max-w-lg rounded-t-[1.75rem] border border-gold/35 bg-forest-950 p-5 text-sand-100 shadow-2xl sm:rounded-[1.75rem] sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Оберіть напрямок</p>
                <h2 id={titleId} className="mt-2 font-display text-3xl">Куди зателефонувати?</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/15 transition hover:bg-white/10" aria-label="Закрити вікно">
                <X size={20} />
              </button>
            </div>
            <div className="mt-6 grid gap-3">
              <a href={PHONE_PRIMARY_HREF} onClick={finishChoice} className="flex min-h-16 items-center gap-4 rounded-2xl border border-gold/35 bg-white/5 p-4 transition hover:border-gold hover:bg-white/10">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold text-forest-950"><Building2 size={20} /></span>
                <span className="min-w-0"><strong className="block">Зателефонувати за будиночками</strong><small className="mt-1 block text-sand-200">{PHONE_PRIMARY}</small></span>
              </a>
              <a href={PHONE_SECONDARY_HREF} onClick={finishChoice} className="flex min-h-16 items-center gap-4 rounded-2xl border border-gold/35 bg-white/5 p-4 transition hover:border-gold hover:bg-white/10">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold text-forest-950"><UtensilsCrossed size={20} /></span>
                <span className="min-w-0"><strong className="block">Зателефонувати за рестораном</strong><small className="mt-1 block text-sand-200">{PHONE_SECONDARY}</small></span>
              </a>
            </div>
          </section>
        </div>,
        document.body,
      )}
    </>
  );
}
