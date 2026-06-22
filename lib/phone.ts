export const FORMATTED_PHONE_MAX_LENGTH = 19;

export function normalizePhoneDigits(value: string) {
  const allDigits = value.replace(/\D/g, "");
  const openingBracket = value.indexOf("(");

  let nationalDigits: string;
  if (allDigits.startsWith("38")) {
    nationalDigits = allDigits.slice(2);
  } else if (openingBracket >= 0) {
    // Якщо користувач на mobile пошкодив префікс, зберігаємо цифри в дужках,
    // а контрольований input одразу відновить незмінний префікс +38.
    nationalDigits = value.slice(openingBracket).replace(/\D/g, "");
  } else {
    nationalDigits = allDigits;
  }

  if (!nationalDigits.startsWith("0")) return "";
  return nationalDigits.slice(0, 10);
}

export function formatUkrainianPhone(value: string) {
  const digits = normalizePhoneDigits(value);
  if (!digits) return "+38";

  let formatted = `+38 (${digits.slice(0, 3)}`;
  if (digits.length >= 3) formatted += ")";
  if (digits.length > 3) formatted += ` ${digits.slice(3, 6)}`;
  if (digits.length > 6) formatted += ` ${digits.slice(6, 8)}`;
  if (digits.length > 8) formatted += ` ${digits.slice(8, 10)}`;
  return formatted;
}

export function isValidUkrainianPhone(value: string) {
  return normalizePhoneDigits(value).length === 10;
}

export function phoneToTelHref(value: string) {
  const digits = normalizePhoneDigits(value);
  return digits.length === 10
    ? `tel:+38${digits}`
    : `tel:${value.replace(/[^\d+]/g, "")}`;
}
