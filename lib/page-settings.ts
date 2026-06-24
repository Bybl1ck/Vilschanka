import { getSupabase, getSupabaseAdmin } from "@/lib/supabase";
import { DEFAULT_PAGE_SETTINGS } from "@/lib/page-settings-config";
import { PAGE_KEYS, type PageKey, type PageSetting } from "@/types/page-setting";

interface PageSettingRow {
  page_key: string;
  title: string | null;
  subtitle: string | null;
  background_image: string | null;
  created_at: string | null;
  updated_at: string | null;
}

function fromSupabasePageSetting(row: PageSettingRow): PageSetting | null {
  if (!PAGE_KEYS.includes(row.page_key as PageKey)) return null;
  const key = row.page_key as PageKey;
  const fallback = DEFAULT_PAGE_SETTINGS[key];
  return {
    pageKey: key,
    title: row.title || fallback.title,
    subtitle: row.subtitle || fallback.subtitle,
    backgroundImage: row.background_image || fallback.backgroundImage,
    createdAt: row.created_at || undefined,
    updatedAt: row.updated_at || undefined,
  };
}

export async function getPageSettings(): Promise<PageSetting[]> {
  try {
    const { data, error } = await getSupabase()
      .from("page_settings")
      .select("page_key,title,subtitle,background_image,created_at,updated_at");
    if (error) throw error;

    const settingsByKey = new Map<PageKey, PageSetting>();
    for (const row of (data || []) as PageSettingRow[]) {
      const setting = fromSupabasePageSetting(row);
      if (setting) settingsByKey.set(setting.pageKey, setting);
    }
    return PAGE_KEYS.map((key) => settingsByKey.get(key) || DEFAULT_PAGE_SETTINGS[key]);
  } catch (error) {
    console.error("Не вдалося отримати фони сторінок із Supabase:", error);
    return PAGE_KEYS.map((key) => DEFAULT_PAGE_SETTINGS[key]);
  }
}

export async function getPageSetting(pageKey: PageKey): Promise<PageSetting> {
  const settings = await getPageSettings();
  return settings.find((setting) => setting.pageKey === pageKey) || DEFAULT_PAGE_SETTINGS[pageKey];
}

export async function updatePageSetting(
  pageKey: PageKey,
  data: Pick<PageSetting, "backgroundImage">,
): Promise<PageSetting> {
  const fallback = DEFAULT_PAGE_SETTINGS[pageKey];
  const { data: saved, error } = await getSupabaseAdmin()
    .from("page_settings")
    .upsert({
      page_key: pageKey,
      title: fallback.title,
      subtitle: fallback.subtitle,
      background_image: data.backgroundImage,
      updated_at: new Date().toISOString(),
    }, { onConflict: "page_key" })
    .select("page_key,title,subtitle,background_image,created_at,updated_at")
    .single();

  if (error || !saved) {
    throw new Error(`Не вдалося зберегти фон сторінки в Supabase: ${error?.message || "порожня відповідь"}`);
  }
  return fromSupabasePageSetting(saved as PageSettingRow) || fallback;
}
