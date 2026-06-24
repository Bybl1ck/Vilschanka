import type { PageKey, PageSetting } from "@/types/page-setting";

export const PAGE_SETTING_LABELS: Record<PageKey, string> = {
  home: "Головна",
  houses: "Будиночки",
  restaurant: "Ресторан",
  activities: "Активності",
  discounts: "Знижки",
  contacts: "Контакти",
};

export const DEFAULT_PAGE_SETTINGS: Record<PageKey, PageSetting> = {
  home: {
    pageKey: "home",
    title: "Заміський комплекс відпочинку «Вільшанка»",
    subtitle: "Будиночки, баня, риболовля, SUP, каяки та ресторан серед природи.",
    backgroundImage: "/images/hero-lake.svg",
  },
  houses: {
    pageKey: "houses",
    title: "Будиночки для вашого відпочинку",
    subtitle: "Від камерного будиночка для двох до просторого дому для великої компанії.",
    backgroundImage: "/images/hero-lake.svg",
  },
  restaurant: {
    pageKey: "restaurant",
    title: "Ресторан «Вільшанка»",
    subtitle: "Тепла кухня, сезонні продукти й атмосфера для довгих розмов.",
    backgroundImage: "/images/house-big-interior.svg",
  },
  activities: {
    pageKey: "activities",
    title: "На воді, біля вогню, серед тиші",
    subtitle: "Активний і спокійний відпочинок у своєму ритмі.",
    backgroundImage: "/images/hero-lake.svg",
  },
  discounts: {
    pageKey: "discounts",
    title: "Знижки та спеціальні пропозиції",
    subtitle: "Приємні умови для особливих випадків.",
    backgroundImage: "/images/hero-lake.svg",
  },
  contacts: {
    pageKey: "contacts",
    title: "Заплануймо ваш відпочинок",
    subtitle: "Телефони, адреса та спосіб прокласти маршрут.",
    backgroundImage: "/images/hero-lake.svg",
  },
};
