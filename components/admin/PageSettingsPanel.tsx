"use client";

import { Check, ChevronDown, ImageUp, LoaderCircle, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ADMIN_LOGIN_PATH } from "@/lib/admin-paths";
import { PAGE_SETTING_LABELS } from "@/lib/page-settings-config";
import type { PageKey, PageSetting } from "@/types/page-setting";

const acceptedImageTypes = "image/jpeg,image/png,image/webp,image/svg+xml";
type Action = { pageKey: PageKey; type: "upload" | "save" } | null;
type Notice = { type: "success" | "error"; text: string };

export function PageSettingsPanel({ initialSettings }: { initialSettings: PageSetting[] }) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [savedSettings, setSavedSettings] = useState(initialSettings);
  const [editingPage, setEditingPage] = useState<PageKey | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState<Action>(null);
  const [notices, setNotices] = useState<Partial<Record<PageKey, Notice>>>({});

  function updateImage(pageKey: PageKey, backgroundImage: string) {
    setSettings((current) => current.map((setting) => setting.pageKey === pageKey
      ? { ...setting, backgroundImage }
      : setting));
    setNotices((current) => ({ ...current, [pageKey]: undefined }));
  }

  function expiredSession() {
    router.push(ADMIN_LOGIN_PATH);
    router.refresh();
  }

  function cancelEditing(pageKey: PageKey) {
    const saved = savedSettings.find((setting) => setting.pageKey === pageKey);
    if (saved) {
      setSettings((current) => current.map((setting) => setting.pageKey === pageKey ? saved : setting));
    }
    setNotices((current) => ({ ...current, [pageKey]: undefined }));
    setEditingPage(null);
  }

  async function uploadBackground(pageKey: PageKey, file?: File) {
    if (!file) return;
    setAction({ pageKey, type: "upload" });
    setNotices((current) => ({ ...current, [pageKey]: undefined }));

    const formData = new FormData();
    formData.append("folder", "pages");
    formData.append("files", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (response.status === 401) {
        expiredSession();
        return;
      }
      const body = await response.json() as { url?: string; error?: string };
      if (!response.ok || !body.url) throw new Error(body.error);

      updateImage(pageKey, body.url);
      setEditingPage(pageKey);
      setNotices((current) => ({
        ...current,
        [pageKey]: { type: "success", text: "Фон завантажено. Натисніть «Зберегти»." },
      }));
    } catch (error) {
      console.error("Не вдалося завантажити фон:", error);
      setNotices((current) => ({
        ...current,
        [pageKey]: { type: "error", text: "Не вдалося завантажити фон. Спробуйте ще раз." },
      }));
    } finally {
      setAction(null);
    }
  }

  async function saveBackground(setting: PageSetting) {
    setAction({ pageKey: setting.pageKey, type: "save" });
    setNotices((current) => ({ ...current, [setting.pageKey]: undefined }));
    try {
      const response = await fetch(`/api/page-settings/${setting.pageKey}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backgroundImage: setting.backgroundImage }),
      });
      if (response.status === 401) {
        expiredSession();
        return;
      }
      const body = await response.json() as PageSetting | { error?: string };
      if (!response.ok || "error" in body) throw new Error("error" in body ? body.error : undefined);

      const saved = body as PageSetting;
      setSettings((current) => current.map((item) => item.pageKey === setting.pageKey ? saved : item));
      setSavedSettings((current) => current.map((item) => item.pageKey === setting.pageKey ? saved : item));
      setEditingPage(null);
      setNotices((current) => ({
        ...current,
        [setting.pageKey]: { type: "success", text: "Фон сторінки збережено." },
      }));
      router.refresh();
    } catch (error) {
      console.error("Не вдалося зберегти фон сторінки:", error);
      setNotices((current) => ({
        ...current,
        [setting.pageKey]: { type: "error", text: "Не вдалося зберегти фон сторінки. Спробуйте ще раз." },
      }));
    } finally {
      setAction(null);
    }
  }

  return (
    <section className="border-t border-slate-200 bg-[#EEF1F5] px-4 pb-12 pt-5 sm:px-7 sm:pb-16">
      <div className="mx-auto max-w-[1500px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="page-settings-content"
          onClick={() => setIsOpen((current) => !current)}
          className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-4 text-left sm:px-6"
        >
          <div className="min-w-0">
            <span role="heading" aria-level={2} className="block font-display text-2xl text-forest-900 sm:text-3xl">Фони сторінок</span>
            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">Тут можна змінити фонові зображення основних сторінок сайту.</p>
          </div>
          <ChevronDown className={`shrink-0 text-forest-700 transition-transform ${isOpen ? "rotate-180" : ""}`} size={22} />
        </button>

        {isOpen && <div id="page-settings-content" className="border-t border-slate-200 px-3 pb-3 sm:px-5 sm:pb-5">
          <ul className="divide-y divide-slate-200">
            {settings.map((setting) => {
              const saved = savedSettings.find((item) => item.pageKey === setting.pageKey);
              const changed = setting.backgroundImage !== saved?.backgroundImage;
              const busy = action?.pageKey === setting.pageKey;
              const notice = notices[setting.pageKey];
              const editing = editingPage === setting.pageKey;

              return (
                <li key={setting.pageKey} className="py-3">
                  <div className="flex min-w-0 flex-wrap items-center gap-3">
                    <div className="relative h-[54px] w-24 shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-forest-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={setting.backgroundImage} alt="" className="h-full w-full object-cover" />
                    </div>

                    <div className="min-w-[120px] flex-1">
                      <p className="font-bold text-forest-900">{PAGE_SETTING_LABELS[setting.pageKey]}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{changed ? "Є незбережені зміни" : "Фон встановлено"}</p>
                    </div>

                    <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingPage(editing ? null : setting.pageKey)}
                        disabled={Boolean(action)}
                        className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-forest-900 transition hover:border-forest-700 disabled:opacity-60 sm:flex-none"
                      >
                        {editing ? "Згорнути" : "Змінити"}
                      </button>
                      <label className={`inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-forest-900 px-3 py-2 text-xs font-bold text-forest-900 transition hover:bg-forest-900 hover:text-white sm:flex-none ${action ? "pointer-events-none opacity-60" : ""}`}>
                        {busy && action?.type === "upload" ? <LoaderCircle className="animate-spin" size={15} /> : <ImageUp size={15} />}
                        Завантажити
                        <input
                          type="file"
                          accept={acceptedImageTypes}
                          className="sr-only"
                          disabled={Boolean(action)}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            event.target.value = "";
                            void uploadBackground(setting.pageKey, file);
                          }}
                        />
                      </label>
                      {changed && (
                        <button
                          type="button"
                          onClick={() => void saveBackground(setting)}
                          disabled={Boolean(action) || !setting.backgroundImage.trim()}
                          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-forest-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-forest-700 disabled:opacity-60 sm:flex-none"
                        >
                          {busy && action?.type === "save" ? <LoaderCircle className="animate-spin" size={15} /> : <Save size={15} />}
                          Зберегти
                        </button>
                      )}
                    </div>
                  </div>

                  {editing && (
                    <div className="mt-3 rounded-xl border border-gold/30 bg-sand-50 p-4">
                      <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-start">
                        <div className="relative aspect-[16/7] overflow-hidden rounded-lg border border-stone-200 bg-forest-900">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={setting.backgroundImage} alt={`Фон сторінки ${PAGE_SETTING_LABELS[setting.pageKey]}`} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <label className="block text-sm font-bold text-forest-900">
                            URL або локальний шлях
                            <input
                              value={setting.backgroundImage}
                              onChange={(event) => updateImage(setting.pageKey, event.target.value)}
                              className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-forest-700"
                            />
                          </label>
                          <div className="mt-3 flex flex-col gap-2 min-[430px]:flex-row">
                            <button
                              type="button"
                              onClick={() => void saveBackground(setting)}
                              disabled={Boolean(action) || !changed || !setting.backgroundImage.trim()}
                              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-forest-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                            >
                              {busy && action?.type === "save" ? <LoaderCircle className="animate-spin" size={16} /> : <Save size={16} />}
                              Зберегти
                            </button>
                            <button
                              type="button"
                              onClick={() => cancelEditing(setting.pageKey)}
                              disabled={Boolean(action)}
                              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-50"
                            >
                              <X size={16} /> Скасувати
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {notice && (
                    <p role={notice.type === "error" ? "alert" : "status"} className={`mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${notice.type === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}>
                      {notice.type === "success" && <Check size={14} />}{notice.text}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>}
      </div>
    </section>
  );
}
