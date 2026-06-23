import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { createCallbackRequest, getCallbackRequests } from "@/lib/callback-requests";
import { validateUkrainianName } from "@/lib/callback-validation";
import { formatUkrainianPhone, isValidUkrainianPhone } from "@/lib/phone";
import { validDateKey } from "@/lib/date";
import type { CreateCallbackRequestInput } from "@/types/callback-request";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const allowedSources = new Set(["Будиночки", "Контакти"]);
const allowedSourcePrefixes = ["Будиночки — ", "Контакти — ", "Будиночок: "];

function validateRequest(body: Partial<CreateCallbackRequestInput>) {
  const name = body.name?.trim() || "";
  const phone = body.phone?.trim() || "";
  const comment = body.comment?.trim() || "";
  const source = body.source?.trim() || "";
  const houseName = body.houseName?.trim() || "";
  const selectedDates = Array.from(new Set([
    ...(Array.isArray(body.selectedDates) ? body.selectedDates : []),
    ...(body.selectedDate ? [body.selectedDate] : []),
  ]));

  const nameError = validateUkrainianName(name);
  if (nameError) return nameError;
  if (!isValidUkrainianPhone(phone)) return "Введіть повний номер телефону у форматі +38 (0XX) XXX XX XX.";
  if (comment.length > 500) return "Коментар не може бути довшим за 500 символів.";
  if (!allowedSources.has(source) && !allowedSourcePrefixes.some((prefix) => source.startsWith(prefix))) return "Некоректне джерело заявки.";
  if (source.length > 300) return "Назва джерела заявки надто довга.";
  if (houseName.length > 100) return "Назва будиночка надто довга.";
  if (selectedDates.length > 5 || selectedDates.some((date) => !validDateKey(date))) {
    return "Оберіть від однієї до п’яти коректних дат.";
  }

  return {
    name,
    phone: formatUkrainianPhone(phone),
    comment: comment || undefined,
    source,
    selectedDate: selectedDates[0],
    selectedDates: selectedDates.length ? selectedDates : undefined,
    houseName: houseName || undefined,
  };
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Потрібен вхід до адмін-панелі." }, {
      status: 401,
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  }
  try {
    return NextResponse.json(await getCallbackRequests(), {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    console.error("Не вдалося отримати заявки:", error);
    return NextResponse.json({ error: "Не вдалося отримати заявки." }, {
      status: 500,
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  }
}

export async function POST(request: Request) {
  let body: Partial<CreateCallbackRequestInput>;
  try {
    body = await request.json() as Partial<CreateCallbackRequestInput>;
  } catch {
    return NextResponse.json({ error: "Некоректні дані заявки." }, { status: 400 });
  }

  const validated = validateRequest(body);
  if (typeof validated === "string") {
    return NextResponse.json({ error: validated }, { status: 400 });
  }

  try {
    return NextResponse.json(await createCallbackRequest(validated), { status: 201 });
  } catch (error) {
    console.error("Не вдалося створити заявку:", error);
    return NextResponse.json({ error: "Не вдалося надіслати заявку. Перевірте дані та спробуйте ще раз." }, { status: 500 });
  }
}
