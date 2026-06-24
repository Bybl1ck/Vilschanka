export const PAGE_KEYS = ["home", "houses", "restaurant", "activities", "discounts", "contacts"] as const;

export type PageKey = (typeof PAGE_KEYS)[number];

export interface PageSetting {
  pageKey: PageKey;
  title: string;
  subtitle: string;
  backgroundImage: string;
  createdAt?: string;
  updatedAt?: string;
}

export function isPageKey(value: string): value is PageKey {
  return (PAGE_KEYS as readonly string[]).includes(value);
}
