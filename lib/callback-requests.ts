import { randomUUID } from "crypto";
import { getSupabase, getSupabaseAdmin } from "@/lib/supabase";
import type {
  CallbackRequest,
  CallbackRequestStatus,
  CreateCallbackRequestInput,
} from "@/types/callback-request";

interface CallbackRequestRow {
  id: string;
  name: string;
  phone: string;
  comment: string | null;
  source: string;
  house_name: string | null;
  selected_date: string | null;
  selected_dates: string[] | null;
  status: string | null;
  created_at: string;
}

function normalizeStatus(status: string | null): CallbackRequestStatus {
  return status === "called" || status === "archived" ? status : "new";
}

function mapCallbackRequest(row: CallbackRequestRow): CallbackRequest {
  const selectedDates = row.selected_dates?.length
    ? row.selected_dates
    : row.selected_date
      ? [row.selected_date]
      : undefined;

  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    comment: row.comment || undefined,
    source: row.source,
    houseName: row.house_name || undefined,
    selectedDate: row.selected_date || undefined,
    selectedDates,
    status: normalizeStatus(row.status),
    createdAt: row.created_at,
  };
}

export async function getCallbackRequests(): Promise<CallbackRequest[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("callback_requests")
    .select("id,name,phone,comment,source,house_name,selected_date,selected_dates,status,created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Не вдалося отримати заявки з Supabase: ${error.message}`);
  return ((data || []) as CallbackRequestRow[]).map(mapCallbackRequest);
}

export async function createCallbackRequest(input: CreateCallbackRequestInput): Promise<CallbackRequest> {
  const selectedDates = input.selectedDates?.length
    ? input.selectedDates
    : input.selectedDate
      ? [input.selectedDate]
      : undefined;
  const selectedDate = input.selectedDate || selectedDates?.[0] || null;

  const row: CallbackRequestRow = {
      id: randomUUID(),
      name: input.name,
      phone: input.phone,
      comment: input.comment || null,
      source: input.source,
      house_name: input.houseName || null,
      selected_date: selectedDate,
      selected_dates: selectedDates || null,
      // Статус завжди задає сервер, значення від клієнта не використовується.
      status: "new",
      created_at: new Date().toISOString(),
  };
  const { error } = await getSupabase()
    .from("callback_requests")
    .insert(row);

  if (error) {
    throw new Error(`Не вдалося створити заявку в Supabase: ${error.message}`);
  }
  return mapCallbackRequest(row);
}

export async function updateCallbackRequestStatus(
  id: string,
  status: CallbackRequestStatus,
): Promise<CallbackRequest | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("callback_requests")
    .update({ status })
    .eq("id", id)
    .select("id,name,phone,comment,source,house_name,selected_date,selected_dates,status,created_at")
    .maybeSingle();

  if (error) throw new Error(`Не вдалося оновити заявку в Supabase: ${error.message}`);
  return data ? mapCallbackRequest(data as CallbackRequestRow) : null;
}

export async function deleteCallbackRequest(id: string): Promise<boolean> {
  const { data, error } = await getSupabaseAdmin()
    .from("callback_requests")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) throw new Error(`Не вдалося видалити заявку із Supabase: ${error.message}`);
  return Boolean(data);
}
