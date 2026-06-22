import type { Metadata } from "next";
import "./globals.css";
import { SiteChrome } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: {
    default: "Вільшанка — заміський комплекс відпочинку",
    template: "%s | Вільшанка",
  },
  description: "Будиночки для відпочинку, ресторан, баня, риболовля, SUP-дошки та каяки серед природи.",
  metadataBase: new URL("https://vilshanka.example"),
  icons: {
    icon: [{ url: "/images/favicon-vilshanka.png", type: "image/png" }],
    shortcut: "/images/favicon-vilshanka.png",
    apple: "/images/favicon-vilshanka.png",
  },
  openGraph: {
    title: "Вільшанка — заміський комплекс відпочинку",
    description: "Будиночки, ресторан, баня та активності біля води.",
    locale: "uk_UA",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk">
      <body className="font-sans">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
