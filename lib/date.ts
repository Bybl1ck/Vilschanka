export function validDateKey(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toISOString().slice(0, 10) === value ? value : undefined;
}

export function validDateKeys(value?: string | string[]) {
  const values = Array.isArray(value) ? value : value?.split(",") || [];
  return Array.from(new Set(values.map((item) => validDateKey(item.trim())).filter((item): item is string => Boolean(item)))).slice(0, 5);
}
