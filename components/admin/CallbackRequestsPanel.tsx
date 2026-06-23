"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Archive, CheckCircle2, Clock3, LoaderCircle, Phone, RefreshCw, Trash2 } from "lucide-react";
import { formatUkrainianPhone, phoneToTelHref } from "@/lib/phone";
import type { CallbackRequest, CallbackRequestStatus } from "@/types/callback-request";

const statusOptions: { value: CallbackRequestStatus; label: string }[] = [
  { value: "new", label: "Нова" },
  { value: "called", label: "Передзвонили" },
  { value: "archived", label: "Архів" },
];

const emptyMessages: Record<CallbackRequestStatus, string> = {
  new: "Нових заявок поки немає.",
  called: "Оброблених заявок поки немає.",
  archived: "Архів заявок поки порожній.",
};

const statusStyles: Record<CallbackRequestStatus, string> = {
  new: "bg-amber-100 text-amber-900",
  called: "bg-emerald-100 text-emerald-900",
  archived: "bg-slate-200 text-slate-700",
};

function requestDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Kyiv",
  }).format(new Date(value));
}

function sortRequests(requests: CallbackRequest[]) {
  return [...requests].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

function refreshTime(value: Date) {
  return new Intl.DateTimeFormat("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Europe/Kyiv",
  }).format(value);
}

function formatSelectedDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
}

export function CallbackRequestsPanel({ initialRequests }: { initialRequests: CallbackRequest[] }) {
  const [requests, setRequests] = useState(() => sortRequests(initialRequests));
  const [activeStatus, setActiveStatus] = useState<CallbackRequestStatus>("new");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [refreshError, setRefreshError] = useState("");
  const [actionError, setActionError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const refreshing = useRef(false);
  const statusMutationInFlight = useRef(false);
  const mutationVersion = useRef(0);

  const fetchRequests = useCallback(async () => {
    if (refreshing.current || statusMutationInFlight.current) return;
    refreshing.current = true;
    const versionAtStart = mutationVersion.current;

    try {
      const response = await fetch("/api/callback-requests", { cache: "no-store" });
      const body = await response.json() as CallbackRequest[] | { error?: string };
      if (!response.ok || !Array.isArray(body)) throw new Error("Не вдалося оновити заявки.");

      // Не застосовуємо відповідь polling, яка стартувала до ручної зміни статусу.
      if (versionAtStart !== mutationVersion.current) return;
      setRequests(sortRequests(body));
      setRefreshError("");
      setLastUpdated(new Date());
    } catch {
      if (versionAtStart === mutationVersion.current) {
        setRefreshError("Не вдалося оновити заявки. Спробуємо ще раз автоматично.");
      }
    } finally {
      refreshing.current = false;
    }
  }, []);

  useEffect(() => {
    void fetchRequests();
    const intervalId = window.setInterval(() => void fetchRequests(), 5000);
    return () => window.clearInterval(intervalId);
  }, [fetchRequests]);

  async function updateStatus(id: string, status: CallbackRequestStatus) {
    if (statusMutationInFlight.current) return;
    statusMutationInFlight.current = true;
    mutationVersion.current += 1;
    setUpdatingId(id);
    setActionError("");
    try {
      const response = await fetch(`/api/callback-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = await response.json() as CallbackRequest | { error?: string };
      if (!response.ok || "error" in body) throw new Error("Не вдалося змінити статус заявки. Спробуйте ще раз.");
      setRequests((current) => sortRequests(current.map((item) => item.id === id ? body as CallbackRequest : item)));
      setLastUpdated(new Date());
    } catch {
      setActionError("Не вдалося змінити статус заявки. Спробуйте ще раз.");
    } finally {
      statusMutationInFlight.current = false;
      setUpdatingId(null);
    }
  }

  async function deleteRequest(id: string) {
    const confirmed = window.confirm("Ви впевнені, що хочете видалити цю заявку? Цю дію неможливо скасувати.");
    if (!confirmed || statusMutationInFlight.current) return;

    statusMutationInFlight.current = true;
    mutationVersion.current += 1;
    setUpdatingId(id);
    setActionError("");

    try {
      const response = await fetch(`/api/callback-requests/${id}`, { method: "DELETE" });
      const body = await response.json() as { success?: boolean; error?: string };
      if (!response.ok || !body.success) throw new Error(body.error);

      setRequests((current) => current.filter((request) => request.id !== id));
      setLastUpdated(new Date());
    } catch {
      setActionError("Не вдалося видалити заявку. Спробуйте ще раз.");
    } finally {
      statusMutationInFlight.current = false;
      setUpdatingId(null);
    }
  }

  const counts = {
    new: requests.filter((request) => request.status === "new").length,
    called: requests.filter((request) => request.status === "called").length,
    archived: requests.filter((request) => request.status === "archived").length,
  };
  const visibleRequests = requests.filter((request) => request.status === activeStatus);

  function availableActions(status: CallbackRequestStatus): { status: CallbackRequestStatus; label: string }[] {
    if (status === "new") return [{ status: "called", label: "Передзвонили" }, { status: "archived", label: "В архів" }];
    if (status === "called") return [{ status: "new", label: "Повернути в нові" }, { status: "archived", label: "В архів" }];
    return [{ status: "new", label: "Повернути в нові" }, { status: "called", label: "Передзвонили" }];
  }

  return (
    <section id="callback-requests" className="bg-[#EEF1F5] pt-8 sm:pt-10">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-7">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-forest-700">Зворотний зв’язок</p>
            <h1 className="mt-2 font-display text-4xl text-forest-900 sm:text-5xl">Заявки</h1>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <p className="text-sm font-bold text-forest-900">Нові заявки: {counts.new}</p>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/35 bg-white px-3 py-1.5 text-xs font-bold text-forest-700"><RefreshCw size={13} /> Автооновлення увімкнено</span>
            <p className="text-xs text-slate-500">Останнє оновлення: {lastUpdated ? refreshTime(lastUpdated) : "завантажуємо…"}</p>
          </div>
        </div>

        {refreshError && <p role="status" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{refreshError}</p>}
        {actionError && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{actionError}</p>}

        <div role="tablist" aria-label="Статуси заявок" className="mb-6 grid grid-cols-3 gap-2 rounded-2xl border border-gold/25 bg-white p-2 sm:inline-grid sm:min-w-[560px]">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={activeStatus === option.value}
              onClick={() => setActiveStatus(option.value)}
              className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[11px] font-bold leading-tight transition min-[390px]:text-xs min-[430px]:min-h-12 min-[430px]:flex-row min-[430px]:gap-1.5 sm:gap-2 sm:px-4 sm:text-sm ${activeStatus === option.value ? "bg-forest-900 text-sand-100 shadow-sm" : "text-forest-700 hover:bg-sand-50"}`}
            >
              <span>{option.label === "Нова" ? "Нові" : option.label}</span>
              <span className={`grid min-h-6 min-w-6 place-items-center rounded-full px-1.5 text-[11px] ${activeStatus === option.value ? "bg-gold text-forest-950" : "bg-slate-100 text-slate-600"}`}>{counts[option.value]}</span>
            </button>
          ))}
        </div>

        {visibleRequests.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">{emptyMessages[activeStatus]}</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {visibleRequests.map((request) => (
              <article key={request.id} className={`rounded-[1.5rem] border p-5 shadow-sm transition-colors sm:p-6 ${request.status === "new" ? "border-gold/70 bg-sand-50/70 ring-1 ring-gold/20" : "border-slate-200 bg-white"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="break-words font-display text-2xl text-forest-900">{request.name}</h2>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[request.status]}`}>{statusOptions.find((option) => option.value === request.status)?.label}</span>
                    </div>
                    <a href={phoneToTelHref(request.phone)} className="mt-3 inline-flex min-h-11 items-center gap-2 break-all text-lg font-bold text-forest-700 hover:text-forest-900"><Phone size={17} />{formatUkrainianPhone(request.phone)}</a>
                    <div className="mt-4 grid gap-2 break-words text-sm text-slate-500">
                      <p><strong className="text-slate-700">Джерело:</strong> {request.source}</p>
                      {request.houseName && <p><strong className="text-slate-700">Будиночок:</strong> {request.houseName}</p>}
                      {request.selectedDates?.length ? <p><strong className="text-slate-700">{request.selectedDates.length === 1 ? "Обрана дата:" : "Обрані дати:"}</strong> {request.selectedDates.map(formatSelectedDate).join(", ")}</p> : null}
                      {request.comment && <p><strong className="text-slate-700">Коментар:</strong> {request.comment}</p>}
                      <p className="inline-flex items-center gap-2"><Clock3 size={15} />{requestDate(request.createdAt)}</p>
                    </div>
                  </div>
                  {updatingId === request.id && <LoaderCircle className="mt-1 shrink-0 animate-spin text-slate-500" size={20} />}
                </div>
                <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 min-[430px]:flex-row min-[430px]:flex-wrap">
                  {availableActions(request.status).map((action) => (
                    <button
                      key={action.status}
                      type="button"
                      disabled={updatingId !== null}
                      onClick={() => void updateStatus(request.id, action.status)}
                      className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:opacity-60 min-[430px]:w-auto ${action.status === "archived" ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50" : "bg-forest-900 text-sand-100 hover:bg-forest-700"}`}
                    >
                      {action.status === "archived" ? <Archive size={16} /> : <CheckCircle2 size={16} />}
                      {action.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={updatingId !== null}
                    onClick={() => void deleteRequest(request.id)}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:opacity-60 min-[430px]:ml-auto min-[430px]:w-auto"
                  >
                    <Trash2 size={16} />
                    Видалити заявку
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
