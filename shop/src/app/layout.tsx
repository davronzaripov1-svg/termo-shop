import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Termo stik - Термотрансферы и виниловые наклейки",
    template: "%s | Termo stik",
  },
  description: "Термотрансферы, виниловые наклейки, DTF и UV DTF печать. Быстрая доставка по всему Узбекистану.",
  keywords: ["термотрансферы", "виниловые наклейки", "DTF печать", "UV DTF", "Узбекистан", "Ташкент"],
  authors: [{ name: "Termo stik" }],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Termo stik",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="min-h-screen flex flex-col antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
