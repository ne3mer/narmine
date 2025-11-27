import type { Metadata } from "next";
import { Geist, Geist_Mono, Vazirmatn } from "next/font/google";
import "./globals.css";
import { MainNav } from "@/components/layout/MainNav";
import { CartProvider } from "@/contexts/CartContext";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";
import { ToastProvider } from "@/components/ui/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn"
});

export const metadata: Metadata = {
  title: {
    default: "نرمینه خواب | فروشگاه آنلاین کالای خواب و روتختی",
    template: "%s | نرمینه خواب"
  },
  description: "خرید آنلاین انواع روتختی، بالش، پتو و ملزومات خواب با بهترین کیفیت و قیمت. ارسال به سراسر ایران.",
  keywords: ["خرید روتختی", "بالش طبی", "پتو", "کالای خواب", "نرمینه خواب", "روتختی عروس"],
  authors: [{ name: "Narmineh Khab" }],
  creator: "Narmineh Khab",
  publisher: "Narmineh Khab",
  metadataBase: new URL("https://narminehkhab.ir"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://narminehkhab.ir",
    siteName: "نرمینه خواب",
    title: "نرمینه خواب | فروشگاه آنلاین کالای خواب",
    description: "خرید آنلاین انواع روتختی، بالش، پتو و ملزومات خواب با بهترین کیفیت و قیمت",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "نرمینه خواب - کالای خواب با کیفیت",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "نرمینه خواب | کالای خواب",
    description: "خرید آنلاین انواع روتختی، بالش و پتو",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${vazirmatn.variable} antialiased`} suppressHydrationWarning>
        <CartProvider>
          <AnalyticsProvider>
            <MainNav />
            {children}
            <ToastProvider />
          </AnalyticsProvider>
        </CartProvider>
      </body>
    </html>
  );
}
