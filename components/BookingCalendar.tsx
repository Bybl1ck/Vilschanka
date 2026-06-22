"use client";

import { useMemo, useRef, useState, type TouchEvent } from "react";
import { CalendarCheck, ChevronLeft, ChevronRight, Info, X } from "lucide-react";

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
const monthNames = [
  "Січень",
  "Лютий",
  "Березень",
  "Квітень",
  "Травень",
  "Червень",
  "Липень",
  "Серпень",
  "Вересень",
  "Жовтень",
  "Листопад",
  "Грудень",
];

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatDateKey(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}.${month}.${year}`;
}

export function BookingCalendar({
  bookedDates,
  editable = false,
  onChange,
  houseSlug,
  houseName,
  callbackPath = "/kontakty",
  callbackAnchor = "callback-form",
}: {
  bookedDates: string[];
  editable?: boolean;
  onChange?: (dates: string[]) => void;
  houseSlug?: string;
  houseName?: string;
  callbackPath?: string;
  callbackAnchor?: string;
}) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [multiSelect, setMultiSelect] = useState(false);
  const [publicNotice, setPublicNotice] = useState<"booked" | "limit" | null>(null);
  const lastDateTouch = useRef(0);
  const lastCallbackTouch = useRef(0);
  const lastMonthTouch = useRef(0);
  const booked = useMemo(() => new Set(bookedDates), [bookedDates]);
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const bookedYears = bookedDates
      .map((date) => Number(date.slice(0, 4)))
      .filter((value) => Number.isFinite(value));
    const firstYear = Math.min(2026, currentYear, year, ...bookedYears);
    const lastYear = Math.max(2030, currentYear + 4, year, ...bookedYears);
    return Array.from({ length: lastYear - firstYear + 1 }, (_, index) => firstYear + index);
  }, [bookedDates, year]);
  const daysCount = new Date(year, month + 1, 0).getDate();
  const mondayOffset = (new Date(year, month, 1).getDay() + 6) % 7;

  function changeMonth(delta: number) {
    setVisibleMonth(new Date(year, month + delta, 1));
    if (!editable) setPublicNotice(null);
  }

  function toggleDate(date: string) {
    if (!editable || !onChange) return;
    const next = booked.has(date) ? bookedDates.filter((item) => item !== date) : [...bookedDates, date].sort();
    onChange(next);
  }

  function selectPublicDate(date: string, isBooked: boolean) {
    if (editable) return;
    if (isBooked) {
      setPublicNotice("booked");
      return;
    }
    setPublicNotice(null);
    if (!multiSelect) {
      setSelectedDates([date]);
      return;
    }
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter((item) => item !== date));
      return;
    }
    if (selectedDates.length >= 5) {
      setPublicNotice("limit");
      return;
    }
    setSelectedDates([...selectedDates, date].sort());
  }

  const dateQuery = selectedDates.length === 1
    ? `date=${encodeURIComponent(selectedDates[0])}`
    : `dates=${encodeURIComponent(selectedDates.join(","))}`;
  const callbackHref = selectedDates.length
    ? `${callbackPath}?${dateQuery}${houseSlug ? `&house=${encodeURIComponent(houseSlug)}` : ""}#${callbackAnchor}`
    : `${callbackPath}#${callbackAnchor}`;

  function openCallbackForm() {
    const form = document.getElementById(callbackAnchor);
    if (!form) {
      window.location.assign(callbackHref);
      return;
    }
    window.history.replaceState(window.history.state, "", callbackHref);
    window.dispatchEvent(new CustomEvent("vilshanka:house-date-selection", {
      detail: { dates: selectedDates, houseName },
    }));
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function activateDateFromTouch(event: TouchEvent<HTMLButtonElement>, date: string, isBooked: boolean) {
    event.preventDefault();
    lastDateTouch.current = Date.now();
    if (editable) toggleDate(date);
    else selectPublicDate(date, isBooked);
  }

  function activateDateFromClick(date: string, isBooked: boolean) {
    if (Date.now() - lastDateTouch.current < 700) return;
    if (editable) toggleDate(date);
    else selectPublicDate(date, isBooked);
  }

  function openCallbackFromTouch(event: TouchEvent<HTMLButtonElement>) {
    event.preventDefault();
    lastCallbackTouch.current = Date.now();
    openCallbackForm();
  }

  function openCallbackFromClick() {
    if (Date.now() - lastCallbackTouch.current < 700) return;
    openCallbackForm();
  }

  function changeMonthFromTouch(event: TouchEvent<HTMLButtonElement>, delta: number) {
    event.preventDefault();
    lastMonthTouch.current = Date.now();
    changeMonth(delta);
  }

  function changeMonthFromClick(delta: number) {
    if (Date.now() - lastMonthTouch.current < 700) return;
    changeMonth(delta);
  }

  return (
    <div className="relative isolate z-0 min-w-0 rounded-[1.5rem] border border-stone-200 bg-white p-3 shadow-soft sm:rounded-[1.75rem] sm:p-7" data-booking-calendar>
      {editable && (
        <div className="mb-6 grid grid-cols-2 gap-3 rounded-2xl border border-gold/35 bg-sand-50 p-4 sm:flex sm:items-end sm:gap-4">
          <label className="min-w-0 flex-1 text-xs font-bold uppercase tracking-[0.14em] text-forest-700">
            Місяць
            <select
              value={month}
              onChange={(event) => setVisibleMonth(new Date(year, Number(event.target.value), 1))}
              className="mt-2 h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm font-bold normal-case tracking-normal text-forest-900 outline-none transition focus:border-gold"
            >
              {monthNames.map((name, index) => <option key={name} value={index}>{name}</option>)}
            </select>
          </label>
          <label className="min-w-0 flex-1 text-xs font-bold uppercase tracking-[0.14em] text-forest-700">
            Рік
            <select
              value={year}
              onChange={(event) => setVisibleMonth(new Date(Number(event.target.value), month, 1))}
              className="mt-2 h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm font-bold normal-case tracking-normal text-forest-900 outline-none transition focus:border-gold"
            >
              {yearOptions.map((optionYear) => <option key={optionYear} value={optionYear}>{optionYear}</option>)}
            </select>
          </label>
          <p className="col-span-2 hidden max-w-sm pb-2 text-xs leading-5 text-stone-500 lg:block">Оберіть потрібний період або скористайтеся стрілками нижче.</p>
        </div>
      )}
      {!editable && (
        <label className="relative z-10 mb-5 flex min-h-11 cursor-pointer touch-manipulation items-center gap-3 rounded-xl border border-gold/35 bg-sand-50 px-4 py-3 text-sm font-bold text-forest-900">
          <input
            type="checkbox"
            checked={multiSelect}
            onChange={(event) => {
              setMultiSelect(event.target.checked);
              setPublicNotice(null);
              if (!event.target.checked) setSelectedDates((current) => current.slice(0, 1));
            }}
            className="h-5 w-5 shrink-0 accent-[#D7C08A]"
          />
          Вибрати кілька дат
        </label>
      )}
      <div className="mb-5 flex items-center justify-between gap-2 sm:mb-6">
        <button type="button" onClick={() => changeMonthFromClick(-1)} onTouchEnd={(event) => changeMonthFromTouch(event, -1)} className="relative z-10 grid h-11 w-11 shrink-0 touch-manipulation place-items-center rounded-full border border-stone-200 text-forest-900 transition hover:border-forest-700" aria-label="Попередній місяць">
          <ChevronLeft size={20} />
        </button>
        <p className="min-w-0 text-center font-display text-lg capitalize leading-tight text-forest-900 min-[390px]:text-xl sm:text-2xl">{visibleMonth.toLocaleDateString("uk-UA", { month: "long", year: "numeric" })}</p>
        <button type="button" onClick={() => changeMonthFromClick(1)} onTouchEnd={(event) => changeMonthFromTouch(event, 1)} className="relative z-10 grid h-11 w-11 shrink-0 touch-manipulation place-items-center rounded-full border border-stone-200 text-forest-900 transition hover:border-forest-700" aria-label="Наступний місяць">
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {weekDays.map((day) => <div key={day} className="pb-2 text-center text-[10px] font-bold uppercase tracking-wider text-stone-400 sm:text-xs">{day}</div>)}
        {Array.from({ length: mondayOffset }).map((_, index) => <div key={`empty-${index}`} aria-hidden="true" />)}
        {Array.from({ length: daysCount }).map((_, index) => {
          const day = index + 1;
          const key = toDateKey(year, month, day);
          const isBooked = booked.has(key);
          const isSelected = !editable && selectedDates.includes(key);
          const className = `relative z-10 grid min-w-0 touch-manipulation aspect-square place-items-center rounded-lg text-xs font-bold transition min-[390px]:rounded-xl min-[390px]:text-sm sm:rounded-2xl sm:text-base ${
            isBooked
              ? "bg-slate-300 text-slate-700 ring-1 ring-inset ring-slate-400/70 hover:bg-slate-400/80"
              : isSelected
                ? "bg-sand-100 text-forest-950 ring-2 ring-inset ring-gold shadow-sm"
              : editable
                ? "bg-sand-50 text-forest-900 hover:bg-sand-200"
                : "bg-sand-50 text-forest-900 hover:bg-sand-100"
          } ${editable ? "cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold" : isBooked ? "cursor-help focus:outline-none focus:ring-2 focus:ring-slate-500" : "cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold"}`;

          const content = (
            <>
              <span className="relative z-10">{day}</span>
              {isBooked && <X className="pointer-events-none absolute h-7 w-7 text-slate-800/55 min-[390px]:h-8 min-[390px]:w-8 sm:h-10 sm:w-10" strokeWidth={1.8} />}
              {isBooked && <span className="pointer-events-none absolute bottom-1 hidden rounded-full bg-slate-700/85 px-1.5 py-0.5 text-[7px] leading-none text-white min-[430px]:block sm:text-[8px]">Зайнято</span>}
              {isSelected && <span className="pointer-events-none absolute bottom-1 hidden rounded-full bg-gold px-1.5 py-0.5 text-[7px] leading-none text-forest-950 min-[430px]:block sm:text-[8px]">Вибрано</span>}
            </>
          );

          return editable ? (
            <button key={key} type="button" onClick={() => activateDateFromClick(key, isBooked)} onTouchEnd={(event) => activateDateFromTouch(event, key, isBooked)} className={className} aria-label={`${day} — ${isBooked ? "зайнято" : "вільно"}`} aria-pressed={isBooked} data-date={key}>
              {content}
            </button>
          ) : (
            <button
              key={key}
              type="button"
              onClick={() => activateDateFromClick(key, isBooked)}
              onTouchEnd={(event) => activateDateFromTouch(event, key, isBooked)}
              className={className}
              aria-label={`${formatDateKey(key)} — ${isBooked ? "зайнято, натисніть для пояснення" : isSelected ? "вибрано" : "вільно"}`}
              aria-pressed={isSelected}
              data-date={key}
              data-booked={isBooked ? "true" : "false"}
            >
              {content}
            </button>
          );
        })}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-stone-100 pt-5 text-xs text-stone-500 sm:text-sm">
        <span className="flex items-center gap-2"><i className="h-4 w-4 rounded-md bg-sand-50 ring-1 ring-stone-200" /> Вільно</span>
        <span className="flex items-center gap-2"><i className="relative grid h-4 w-4 place-items-center rounded-md bg-slate-300 text-slate-700 not-italic ring-1 ring-slate-400"><X size={12} strokeWidth={2} /></i> Зайнято</span>
        {editable && <span className="ml-auto text-forest-700">Натисніть на дату, щоб змінити статус</span>}
      </div>
      {!editable && publicNotice === "booked" && (
        <div role="status" aria-live="polite" className="mt-5 rounded-2xl border border-slate-300 bg-slate-100 p-4 text-slate-700 sm:p-5">
          <p className="flex items-center gap-2 font-bold text-forest-900"><Info size={18} /> Ця дата вже заброньована</p>
          <p className="mt-2 text-sm leading-6">Оберіть іншу вільну дату або залиште заявку — адміністратор допоможе підібрати варіант.</p>
        </div>
      )}
      {!editable && publicNotice === "limit" && (
        <div role="status" aria-live="polite" className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-bold text-amber-900 sm:p-5">
          Можна вибрати не більше 5 дат одночасно.
        </div>
      )}
      {!editable && selectedDates.length > 0 && (
        <div role="status" aria-live="polite" className="mt-5 rounded-2xl border border-gold/60 bg-sand-50 p-4 sm:p-5">
          <p className="flex items-start gap-2 break-words font-bold text-forest-900">
            <CalendarCheck size={18} className="mt-0.5 shrink-0 text-gold" />
            <span>{selectedDates.length === 1 ? "Обрана дата:" : "Обрані дати:"} {selectedDates.map(formatDateKey).join(", ")}</span>
          </p>
          {houseName && <p className="mt-2 text-sm font-bold text-forest-900">Будиночок: {houseName}</p>}
          <p className="mt-2 text-sm leading-6 text-stone-600">Бронювання підтвердить адміністратор після дзвінка.</p>
          <button type="button" onClick={openCallbackFromClick} onTouchEnd={openCallbackFromTouch} className="button-dark relative z-10 mt-4 min-h-12 w-full touch-manipulation sm:w-auto">Надіслати заявку</button>
        </div>
      )}
    </div>
  );
}
