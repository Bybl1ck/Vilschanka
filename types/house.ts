export type HousePriceKey = "monWed" | "thu" | "friSun" | "sat";

export interface HouseWeeklyPrices {
  monWed: number;
  thu: number;
  friSun: number;
  sat: number;
}

export interface House {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  pricePerNight: number;
  prices?: HouseWeeklyPrices;
  guests: number;
  area: number;
  amenities: string[];
  mainImage: string;
  gallery: string[];
  bookedDates: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
