const UKRAINIAN_NAME_CHARACTER = /[А-ЩЬЮЯЄІЇҐа-щьюяєіїґ '’\-]/;
const UKRAINIAN_NAME_ONLY = /^[А-ЩЬЮЯЄІЇҐа-щьюяєіїґ '’\-]+$/;
const UKRAINIAN_LETTER = /[А-ЩЬЮЯЄІЇҐа-щьюяєіїґ]/g;

export const CALLBACK_NAME_MAX_LENGTH = 40;

export function sanitizeUkrainianName(value: string) {
  return Array.from(value)
    .filter((character) => UKRAINIAN_NAME_CHARACTER.test(character))
    .join("")
    .slice(0, CALLBACK_NAME_MAX_LENGTH);
}

export function validateUkrainianName(value: string): string | null {
  const name = value.trim();
  if (name.length < 2 || (name.match(UKRAINIAN_LETTER) || []).length < 2) {
    return "Ім’я має містити щонайменше 2 символи.";
  }
  if (name.length > CALLBACK_NAME_MAX_LENGTH) {
    return "Ім’я не може бути довшим за 40 символів.";
  }
  if (!UKRAINIAN_NAME_ONLY.test(name)) {
    return "Ім’я має містити лише українські літери.";
  }
  return null;
}
