"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CalendarDays, CheckCircle2, Home, LoaderCircle, PhoneCall, Send } from "lucide-react";
import {
  CALLBACK_NAME_MAX_LENGTH,
  sanitizeUkrainianName,
  validateUkrainianName,
} from "@/lib/callback-validation";
import {
  FORMATTED_PHONE_MAX_LENGTH,
  formatUkrainianPhone,
  isValidUkrainianPhone,
  normalizePhoneDigits,
} from "@/lib/phone";

interface CallbackFormProps {
  title: string;
  subtitle: string;
  source: string;
  selectedDate?: string;
  selectedDates?: string[];
  houseName?: string;
}

type FormStatus = "idle" | "sending" | "success" | "error";
type FieldErrors = { name?: string; phone?: string };

const PHONE_ERROR = "Введіть повний номер телефону у форматі +38 (0XX) XXX XX XX.";
const SUBMISSION_ERROR = "Не вдалося надіслати заявку. Перевірте дані та спробуйте ще раз.";
const NETWORK_ERROR = "Не вдалося з’єднатися з сервером. Спробуйте ще раз або зателефонуйте нам.";

function formatDateKey(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}.${month}.${year}`;
}

export function CallbackForm({ title, subtitle, source, selectedDate, selectedDates, houseName }: CallbackFormProps) {
  const [name, setName] = useState("");
  const [nameHadInvalidCharacters, setNameHadInvalidCharacters] = useState(false);
  const [phoneDigits, setPhoneDigits] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const submitting = useRef(false);
  const [activeDates, setActiveDates] = useState<string[]>(() => selectedDates?.length ? selectedDates : selectedDate ? [selectedDate] : []);

  useEffect(() => {
    setActiveDates(selectedDates?.length ? selectedDates : selectedDate ? [selectedDate] : []);
  }, [selectedDate, selectedDates]);

  useEffect(() => {
    function receiveDates(event: Event) {
      const detail = (event as CustomEvent<{ dates?: string[] }>).detail;
      if (Array.isArray(detail?.dates)) setActiveDates(detail.dates.slice(0, 5));
    }
    window.addEventListener("vilshanka:house-date-selection", receiveDates);
    return () => window.removeEventListener("vilshanka:house-date-selection", receiveDates);
  }, []);

  function markPhoneChanged() {
    setFieldErrors((current) => ({ ...current, phone: undefined }));
    setStatus("idle");
    setMessage("");
  }

  function handleNameValue(value: string) {
    const sanitized = sanitizeUkrainianName(value);
    const hadInvalidCharacters = sanitized !== value;
    setName(sanitized);
    setNameHadInvalidCharacters(hadInvalidCharacters);
    setFieldErrors((current) => ({ ...current, name: hadInvalidCharacters ? "Ім’я має містити лише українські літери." : undefined }));
    setStatus("idle");
    setMessage("");
  }

  function handlePhoneValue(value: string) {
    setPhoneDigits(normalizePhoneDigits(value));
    markPhoneChanged();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    setMessage("");

    const nextErrors: FieldErrors = {
      name: nameHadInvalidCharacters ? "Ім’я має містити лише українські літери." : validateUkrainianName(name) || undefined,
      phone: isValidUkrainianPhone(phoneDigits) ? undefined : PHONE_ERROR,
    };
    setFieldErrors(nextErrors);
    if (nextErrors.name || nextErrors.phone) {
      setStatus("idle");
      return;
    }
    submitting.current = true;
    setStatus("sending");

    const sourceDetails = [
      activeDates.length === 1 ? `дата ${formatDateKey(activeDates[0])}` : "",
      activeDates.length > 1 ? `дати ${activeDates.map(formatDateKey).join(", ")}` : "",
      houseName && !source.startsWith("Будиночок:") ? `будиночок: ${houseName}` : "",
    ].filter(Boolean);
    const requestSource = sourceDetails.length ? `${source} — ${sourceDetails.join(", ")}` : source;

    let response: Response;
    try {
      response = await fetch("/api/callback-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: formatUkrainianPhone(phoneDigits),
          comment,
          source: requestSource,
          selectedDates: activeDates.length ? activeDates : undefined,
          houseName,
        }),
      });
    } catch {
      submitting.current = false;
      setStatus("error");
      setMessage(NETWORK_ERROR);
      return;
    }

    let body: { error?: string } = {};
    try {
      body = await response.json() as { error?: string };
    } catch {
      // Невалідна відповідь сервера все одно обробляється як помилка нижче.
    }

    submitting.current = false;
    if (!response.ok) {
      setStatus("error");
      setMessage(body.error || SUBMISSION_ERROR);
      return;
    }

    setName("");
    setNameHadInvalidCharacters(false);
    setPhoneDigits("");
    setComment("");
    setFieldErrors({});
    setStatus("success");
    setMessage("Дякуємо! Ми отримали вашу заявку та скоро передзвонимо.");
  }

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-gold/30 bg-forest-900 text-sand-50 shadow-soft sm:rounded-[2rem]">
      <div className="grid lg:grid-cols-[1.05fr_.95fr]">
        <div className="relative overflow-hidden p-6 sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-gold/20" />
          <div className="pointer-events-none absolute -right-4 -top-8 h-40 w-40 rounded-full border border-gold/20" />
          <div className="relative">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-gold text-forest-950"><PhoneCall size={21} /></span>
            <h2 className="mt-6 max-w-2xl font-display text-3xl leading-tight sm:text-4xl">{title}</h2>
            <p className="mt-4 max-w-2xl leading-7 text-sand-200">{subtitle}</p>
          </div>
        </div>

        <form noValidate onSubmit={submit} className="relative z-10 grid content-center gap-4 bg-white p-6 text-forest-900 sm:p-10 lg:p-12" data-callback-form>
          {(activeDates.length > 0 || houseName) && (
            <div className="grid gap-2 rounded-xl border border-gold/40 bg-sand-50 p-4 text-sm text-forest-900">
              {activeDates.length > 0 && (
                <p className="flex items-start gap-2 break-words">
                  <CalendarDays className="mt-0.5 shrink-0 text-gold" size={17} />
                  <span><strong>{activeDates.length === 1 ? "Обрана дата:" : "Обрані дати:"}</strong> {activeDates.map(formatDateKey).join(", ")}</span>
                </p>
              )}
              {houseName && <p className="flex items-center gap-2"><Home className="shrink-0 text-gold" size={17} /><strong>Будиночок:</strong> {houseName}</p>}
            </div>
          )}
          <label className="text-sm font-bold">
            Ім’я
            <input
              required
              minLength={2}
              maxLength={CALLBACK_NAME_MAX_LENGTH}
              autoComplete="name"
              inputMode="text"
              lang="uk"
              autoCapitalize="words"
              value={name}
              onChange={(event) => handleNameValue(event.currentTarget.value)}
              onInput={(event) => handleNameValue(event.currentTarget.value)}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "callback-name-error" : undefined}
              className={`mt-2 min-h-12 w-full rounded-xl border bg-white px-4 py-3 text-base outline-none transition focus:border-gold ${fieldErrors.name ? "border-red-400" : "border-stone-300"}`}
              placeholder="Ваше ім’я"
            />
            {fieldErrors.name && <span id="callback-name-error" className="mt-2 block text-xs font-normal text-red-700">{fieldErrors.name}</span>}
          </label>
          <label className="text-sm font-bold">
            Номер телефону
            <input
              required
              type="tel"
              inputMode="tel"
              maxLength={FORMATTED_PHONE_MAX_LENGTH}
              autoComplete="tel"
              enterKeyHint="next"
              value={formatUkrainianPhone(phoneDigits)}
              onChange={(event) => handlePhoneValue(event.currentTarget.value)}
              onInput={(event) => handlePhoneValue(event.currentTarget.value)}
              data-phone-input
              onKeyDown={(event) => {
                const input = event.currentTarget;
                const hasCollapsedSelection = input.selectionStart === input.selectionEnd;
                const cursorAtEnd = input.selectionEnd === input.value.length;
                if (event.key === "Backspace" && hasCollapsedSelection && cursorAtEnd && input.value.endsWith(")")) {
                  event.preventDefault();
                  setPhoneDigits((current) => current.slice(0, -1));
                  markPhoneChanged();
                }
              }}
              onBeforeInput={(event) => {
                const inputEvent = event.nativeEvent as InputEvent;
                const input = event.currentTarget;
                const hasCollapsedSelection = input.selectionStart === input.selectionEnd;
                const cursorAtEnd = input.selectionEnd === input.value.length;
                // Після трьох цифр маска завершується дужкою. На мобільній клавіатурі
                // Backspace інакше видаляє лише дужку, яку React одразу повертає.
                if (inputEvent.inputType === "deleteContentBackward" && hasCollapsedSelection && cursorAtEnd && input.value.endsWith(")")) {
                  event.preventDefault();
                  setPhoneDigits((current) => current.slice(0, -1));
                  markPhoneChanged();
                }
              }}
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-describedby={fieldErrors.phone ? "callback-phone-error" : undefined}
              className={`mt-2 min-h-12 w-full rounded-xl border bg-white px-4 py-3 text-base outline-none transition focus:border-gold ${fieldErrors.phone ? "border-red-400" : "border-stone-300"}`}
              placeholder="+38 (___) ___ __ __"
            />
            {fieldErrors.phone && <span id="callback-phone-error" className="mt-2 block text-xs font-normal text-red-700">{fieldErrors.phone}</span>}
          </label>
          <label className="text-sm font-bold">
            Коментар <span className="font-normal text-stone-500">(необов’язково)</span>
            <textarea
              rows={3}
              maxLength={500}
              value={comment}
              onChange={(event) => { setComment(event.target.value); setStatus("idle"); setMessage(""); }}
              className="mt-2 min-h-24 w-full resize-y rounded-xl border border-stone-300 bg-white px-4 py-3 text-base outline-none transition focus:border-gold"
              placeholder="Кількість гостей, побажання або запитання"
            />
          </label>
          <button type="submit" disabled={status === "sending"} className="button-dark mt-1 w-full disabled:cursor-wait disabled:opacity-60">
            {status === "sending" ? <LoaderCircle className="animate-spin" size={18} /> : <Send size={18} />}
            {status === "sending" ? "Надсилаємо…" : "Надіслати заявку"}
          </button>
          {message && (
            <p role="status" className={`flex items-start gap-2 rounded-xl p-3 text-sm leading-6 ${status === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
              {status === "success" && <CheckCircle2 className="mt-0.5 shrink-0" size={17} />}
              {message}
            </p>
          )}
          <p className="text-xs leading-5 text-stone-500">Надсилаючи заявку, ви погоджуєтеся на використання номера для зворотного дзвінка.</p>
        </form>
      </div>
    </div>
  );
}
