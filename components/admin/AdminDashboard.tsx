"use client";

import { useState } from "react";
import { Check, HousePlus, LoaderCircle, Save, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { BookingCalendar } from "@/components/BookingCalendar";
import { ADMIN_LOGIN_PATH } from "@/lib/admin-paths";
import { getMinimumHousePrice, isValidWeeklyPrices, resolveWeeklyPrices } from "@/lib/pricing";
import type { House, HousePriceKey } from "@/types/house";

const inputClass = "mt-2 min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-forest-900 outline-none transition focus:border-forest-700";
const acceptedImageTypes = "image/jpeg,image/png,image/webp,image/svg+xml";

type UploadTarget = "main" | "gallery";
type UploadResponse = { url?: string; urls?: string[]; error?: string };

function createDraft(): House {
  return {
    id: "",
    name: "Новий будиночок",
    slug: `novyi-budynochok-${Date.now()}`,
    shortDescription: "Коротко опишіть головну перевагу будиночка.",
    fullDescription: "Додайте повний теплий опис будиночка для майбутніх гостей.",
    pricePerNight: 3000,
    prices: { monWed: 3000, thu: 3400, friSun: 4000, sat: 4500 },
    guests: 2,
    area: 30,
    amenities: ["Wi-Fi", "Душ і санвузол"],
    mainImage: "/images/house-water-exterior.svg",
    gallery: ["/images/house-water-exterior.svg", "/images/house-water-interior.svg"],
    bookedDates: [],
  };
}

function editableHouse(house: House): House {
  return {
    ...house,
    prices: resolveWeeklyPrices(house.prices, house.pricePerNight),
    amenities: [...house.amenities],
    gallery: [...house.gallery],
    bookedDates: [...house.bookedDates],
  };
}

export function AdminDashboard({ initialHouses }: { initialHouses: House[] }) {
  const router = useRouter();
  const [houses, setHouses] = useState(initialHouses);
  const [selectedId, setSelectedId] = useState(initialHouses[0]?.id || "");
  const [draft, setDraft] = useState<House | null>(initialHouses[0] ? editableHouse(initialHouses[0]) : null);
  const [status, setStatus] = useState<"idle" | "saving" | "deleting" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState<UploadTarget | null>(null);
  const [uploadError, setUploadError] = useState("");

  const isNew = draft?.id === "";

  function handleExpiredSession() {
    setStatus("error");
    setMessage("Сесія завершилася. Увійдіть знову.");
    router.push(ADMIN_LOGIN_PATH);
    router.refresh();
  }

  function chooseHouse(house: House) {
    setSelectedId(house.id);
    setDraft(editableHouse(house));
    setStatus("idle");
    setMessage("");
    setUploadError("");
  }

  function update<K extends keyof House>(key: K, value: House[K]) {
    setDraft((current) => current ? { ...current, [key]: value } : current);
    setStatus("idle");
  }

  function updatePrice(key: HousePriceKey, value: number) {
    setDraft((current) => current ? {
      ...current,
      prices: { ...resolveWeeklyPrices(current.prices, current.pricePerNight), [key]: value },
    } : current);
    setStatus("idle");
  }

  async function uploadImages(files: File[], target: UploadTarget) {
    if (!files.length) return;

    setUploading(target);
    setUploadError("");
    const formData = new FormData();
    formData.append("folder", "houses");
    files.forEach((file) => formData.append("files", file));

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (response.status === 401) {
        handleExpiredSession();
        throw new Error("Сесія завершилася. Увійдіть знову.");
      }
      const body = await response.json() as UploadResponse;
      const uploadedUrls = body.urls?.length ? body.urls : body.url ? [body.url] : [];
      if (!response.ok || !uploadedUrls.length) {
        throw new Error("Не вдалося завантажити зображення. Спробуйте ще раз.");
      }

      if (target === "main") {
        update("mainImage", uploadedUrls[0]);
      } else {
        setDraft((current) => current ? {
          ...current,
          gallery: Array.from(new Set([...current.gallery, ...uploadedUrls])),
        } : current);
        setStatus("idle");
      }
      setMessage("Фото завантажено. Натисніть «Зберегти зміни», щоб оновити будиночок.");
    } catch (error) {
      setUploadError(error instanceof Error && error.message.includes("Сесія завершилася")
        ? error.message
        : "Не вдалося завантажити зображення. Спробуйте ще раз.");
    } finally {
      setUploading(null);
    }
  }

  async function save() {
    if (!draft) return;
    if (!isValidWeeklyPrices(draft.prices)) {
      setStatus("error");
      setMessage("Заповніть усі чотири ціни додатними числами.");
      return;
    }

    const normalizedDraft: House = {
      ...draft,
      // Сумісне поле автоматично тримаємо рівним найнижчому тарифу.
      pricePerNight: getMinimumHousePrice(draft.prices, draft.pricePerNight),
    };
    setStatus("saving");
    setMessage("");
    try {
      const response = await fetch(isNew ? "/api/houses" : `/api/houses/${draft.id}`, {
        method: isNew ? "POST" : "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizedDraft),
      });
      if (response.status === 401) {
        handleExpiredSession();
        return;
      }
      const body = await response.json() as House | { error?: string };

      if (!response.ok || "error" in body) {
        throw new Error("error" in body ? body.error : undefined);
      }

      const saved = body as House;
      setHouses((current) => isNew ? [...current, saved] : current.map((item) => item.id === saved.id ? saved : item));
      setSelectedId(saved.id);
      setDraft(editableHouse(saved));
      setStatus("saved");
      setMessage("Зміни збережено й уже видно відвідувачам сайту.");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error && error.message
        ? error.message
        : "Не вдалося зберегти зміни. Спробуйте ще раз.");
    }
  }

  async function removeHouse() {
    if (!draft?.id || !window.confirm("Ви впевнені, що хочете видалити цей будиночок?")) return;
    setStatus("deleting");
    setMessage("");
    try {
      const response = await fetch(`/api/houses/${draft.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.status === 401) {
        handleExpiredSession();
        return;
      }
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error || "Не вдалося видалити будиночок.");

      const remainingHouses = houses.filter((house) => house.id !== draft.id);
      const nextHouse = remainingHouses[0];
      setHouses(remainingHouses);
      setSelectedId(nextHouse?.id || "");
      setDraft(nextHouse ? editableHouse(nextHouse) : null);
      setStatus("saved");
      setMessage("Будиночок видалено.");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Не вдалося видалити будиночок.");
    }
  }

  return (
    <section className="min-h-[calc(100vh-76px)] bg-[#EEF1F5] pb-16 pt-8 sm:pt-10">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-7">
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-forest-700">Керування даними</p><h1 className="mt-2 font-display text-4xl text-forest-900 sm:text-5xl">Будиночки</h1></div>
          <p className="max-w-md text-sm leading-6 text-slate-500">Оберіть будиночок у списку, внесіть зміни й натисніть «Зберегти зміни».</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="h-fit rounded-[1.5rem] border border-gold/15 bg-forest-950 p-4 text-sand-100 lg:sticky lg:top-24">
            <div className="mb-3 flex items-center justify-between px-2"><p className="text-xs font-bold uppercase tracking-[0.2em] text-sand-300">Усі будиночки</p><span className="text-xs text-sand-200">{houses.length}</span></div>
            <div className="grid gap-2">
              {houses.map((house) => <button key={house.id} type="button" onClick={() => chooseHouse(house)} className={`rounded-xl px-4 py-4 text-left transition ${selectedId === house.id && !isNew ? "bg-gold text-forest-950" : "bg-white/5 hover:bg-white/10"}`}><strong className="block">{house.name}</strong><span className={`mt-1 block text-xs ${selectedId === house.id && !isNew ? "text-forest-950/70" : "text-sand-200"}`}>від {getMinimumHousePrice(house.prices, house.pricePerNight).toLocaleString("uk-UA")} грн · до {house.guests} гостей</span></button>)}
            </div>
            <button type="button" onClick={() => { setDraft(createDraft()); setSelectedId(""); setStatus("idle"); setUploadError(""); }} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-sand-300/40 px-4 py-4 text-sm font-bold text-sand-100 transition hover:bg-white/10"><HousePlus size={17} /> Додати будиночок</button>
          </aside>

          {draft && (
            <div className="rounded-[1.5rem] bg-white p-5 shadow-sm sm:p-8">
              <div className="flex flex-col gap-5 border-b border-stone-200 pb-7 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-sm text-stone-500">{isNew ? "Створення" : "Редагування"}</p><h2 className="mt-1 font-display text-3xl text-forest-900">{draft.name}</h2></div>
                <button type="button" onClick={save} disabled={status === "saving" || status === "deleting"} className="button-dark disabled:opacity-60">{status === "saving" ? <LoaderCircle className="animate-spin" size={17} /> : status === "saved" ? <Check size={17} /> : <Save size={17} />} {isNew ? "Створити" : "Зберегти зміни"}</button>
              </div>
              {message && <p className={`mt-5 rounded-xl p-4 text-sm ${status === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}>{message}</p>}

              <div className="mt-8 grid gap-8 xl:grid-cols-2">
                <div className="grid content-start gap-5">
                  <label className="text-sm font-bold">Назва<input className={inputClass} value={draft.name} onChange={(e) => update("name", e.target.value)} /></label>
                  <label className="text-sm font-bold">Адреса сторінки (slug)<input className={inputClass} value={draft.slug} onChange={(e) => update("slug", e.target.value)} /></label>
                  <label className="text-sm font-bold">Короткий опис<textarea rows={3} className={inputClass} value={draft.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} /></label>
                  <label className="text-sm font-bold">Повний опис<textarea rows={6} className={inputClass} value={draft.fullDescription} onChange={(e) => update("fullDescription", e.target.value)} /></label>
                  <div className="rounded-2xl border border-gold/40 bg-sand-50 p-4">
                    <p className="text-sm font-bold text-forest-900">Ціни за добу</p>
                    <p className="mt-1 text-xs leading-5 text-stone-500">Усі чотири поля обов’язкові. Мінімальна ціна автоматично зберігається як сумісний базовий тариф.</p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <label className="text-sm font-bold">Ціна Пн–Ср<input required type="number" min="1" className={inputClass} value={draft.prices?.monWed ?? draft.pricePerNight} onChange={(e) => updatePrice("monWed", Number(e.target.value))} /></label>
                      <label className="text-sm font-bold">Ціна Чт<input required type="number" min="1" className={inputClass} value={draft.prices?.thu ?? draft.pricePerNight} onChange={(e) => updatePrice("thu", Number(e.target.value))} /></label>
                      <label className="text-sm font-bold">Ціна Пт–Нд<input required type="number" min="1" className={inputClass} value={draft.prices?.friSun ?? draft.pricePerNight} onChange={(e) => updatePrice("friSun", Number(e.target.value))} /></label>
                      <label className="text-sm font-bold">Ціна Сб<input required type="number" min="1" className={inputClass} value={draft.prices?.sat ?? draft.pricePerNight} onChange={(e) => updatePrice("sat", Number(e.target.value))} /></label>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-sm font-bold">Гостей<input type="number" min="1" className={inputClass} value={draft.guests} onChange={(e) => update("guests", Number(e.target.value))} /></label>
                    <label className="text-sm font-bold">Площа, м²<input type="number" min="1" className={inputClass} value={draft.area} onChange={(e) => update("area", Number(e.target.value))} /></label>
                  </div>
                </div>
                <div className="grid content-start gap-5">
                  <div className="rounded-2xl border border-stone-200 bg-slate-50 p-4 sm:p-5">
                    <label className="block text-sm font-bold">
                      Головне фото
                      <input className={inputClass} value={draft.mainImage} onChange={(e) => update("mainImage", e.target.value)} />
                    </label>
                    <p className="mt-2 text-xs leading-5 text-stone-500">Можна вставити URL вручну або завантажити фото з пристрою.</p>
                    <label className={`mt-4 inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-forest-900 px-4 py-3 text-sm font-bold text-sand-50 transition hover:bg-forest-800 ${uploading ? "pointer-events-none opacity-60" : ""}`}>
                      {uploading === "main" ? <LoaderCircle className="animate-spin" size={17} /> : <Upload size={17} />}
                      {uploading === "main" ? "Завантаження…" : "Завантажити головне фото"}
                      <input
                        type="file"
                        accept={acceptedImageTypes}
                        className="sr-only"
                        disabled={uploading !== null}
                        onChange={(event) => {
                          const files = Array.from(event.target.files || []);
                          event.target.value = "";
                          void uploadImages(files, "main");
                        }}
                      />
                    </label>
                    {draft.mainImage && (
                      <div className="mt-4 aspect-[16/9] overflow-hidden rounded-xl border border-stone-200 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={draft.mainImage} alt="Попередній перегляд головного фото" className="h-full w-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-stone-200 bg-slate-50 p-4 sm:p-5">
                    <label className="block text-sm font-bold">
                      Галерея
                      <textarea rows={6} className={inputClass} value={draft.gallery.join("\n")} onChange={(e) => update("gallery", e.target.value.split("\n").map((item) => item.trim()).filter(Boolean))} />
                    </label>
                    <p className="mt-2 text-xs leading-5 text-stone-500">Кожне фото галереї з нового рядка. Можна вставити URL вручну або завантажити фото з пристрою.</p>
                    <label className={`mt-4 inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-forest-900 px-4 py-3 text-sm font-bold text-forest-900 transition hover:bg-forest-900 hover:text-sand-50 ${uploading ? "pointer-events-none opacity-60" : ""}`}>
                      {uploading === "gallery" ? <LoaderCircle className="animate-spin" size={17} /> : <Upload size={17} />}
                      {uploading === "gallery" ? "Завантаження…" : "Завантажити фото для галереї"}
                      <input
                        type="file"
                        accept={acceptedImageTypes}
                        multiple
                        className="sr-only"
                        disabled={uploading !== null}
                        onChange={(event) => {
                          const files = Array.from(event.target.files || []);
                          event.target.value = "";
                          void uploadImages(files, "gallery");
                        }}
                      />
                    </label>
                    {draft.gallery.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {draft.gallery.map((image, index) => (
                          <div key={`${image}-${index}`} className="aspect-[4/3] overflow-hidden rounded-lg border border-stone-200 bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={image} alt={`Попередній перегляд фото ${index + 1}`} className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {uploadError && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{uploadError}</p>}
                  <label className="text-sm font-bold">Зручності <span className="font-normal text-stone-500">(кожна з нового рядка)</span><textarea rows={8} className={inputClass} value={draft.amenities.join("\n")} onChange={(e) => update("amenities", e.target.value.split("\n").map((item) => item.trim()).filter(Boolean))} /></label>
                </div>
              </div>

              <div className="mt-10 border-t border-stone-200 pt-8">
                <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Календар</p><h3 className="mt-2 font-display text-3xl text-forest-900">Позначте зайняті дати</h3><p className="mt-2 text-sm text-stone-500">Натисніть на дату, щоб зробити її зайнятою або знову вільною. Після цього збережіть зміни.</p></div>
                <BookingCalendar editable bookedDates={draft.bookedDates} onChange={(dates) => update("bookedDates", dates)} />
              </div>
              <div className="mt-8 flex flex-col gap-3 border-t border-stone-200 pt-7 sm:flex-row sm:items-center sm:justify-between">
                {!isNew ? (
                  <button type="button" onClick={removeHouse} disabled={status === "saving" || status === "deleting"} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-red-300 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-60 sm:w-auto">
                    {status === "deleting" ? <LoaderCircle className="animate-spin" size={17} /> : <Trash2 size={17} />} Видалити будиночок
                  </button>
                ) : <span />}
                <button type="button" onClick={save} disabled={status === "saving" || status === "deleting"} className="button-dark w-full disabled:opacity-60 sm:w-auto">
                  {status === "saving" ? <LoaderCircle className="animate-spin" size={17} /> : status === "saved" ? <Check size={17} /> : <Save size={17} />} {isNew ? "Створити" : "Зберегти зміни"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
