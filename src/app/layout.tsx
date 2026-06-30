import type { Metadata } from "next";
import {
  Archivo,
  Inter,
  JetBrains_Mono,
  Manrope,
  Noto_Sans_Arabic,
  Outfit,
  Playfair_Display,
  Plus_Jakarta_Sans,
  Sora,
  Space_Grotesk,
  Urbanist,
} from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { getLocale } from 'next-intl/server';

const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sora",
});

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-urbanist",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

// Arabic UI font: self-hosted, not preloaded — only fetched when RTL text actually renders it.
const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  display: "swap",
  preload: false,
  variable: "--font-noto-arabic",
});

// Base metadata. Per-locale title/description and canonical/hreflang alternates
// are added by `app/[locale]/layout.tsx`; admin routes override with `noindex`.
export const metadata: Metadata = {
  keywords: ["Full Stack Developer", "Web Developer", "React", "Next.js", "TypeScript", "Portfolio", "Keltoum Malouki", "Morocco", "Casablanca"],
  authors: [{ name: "Keltoum Malouki" }],
  creator: "Keltoum Malouki",
  metadataBase: new URL("https://www.keltoummalouki.com"),
  openGraph: {
    type: "website",
    siteName: "Keltoum Malouki Portfolio",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Single root layout for both the localized public site and the unprefixed
// `/admin` area. `lang`/`dir` follow the active locale (URL-derived for public
// routes via the i18n middleware; default locale for `/admin`). The locale's
// `NextIntlClientProvider` is supplied by `app/[locale]/layout.tsx`.
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const isRTL = locale === 'ar';

  return (
    <html
      lang={locale}
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`${archivo.variable} ${spaceGrotesk.variable} ${inter.variable} ${manrope.variable} ${outfit.variable} ${plusJakarta.variable} ${sora.variable} ${urbanist.variable} ${jetbrainsMono.variable} ${playfair.variable} ${notoSansArabic.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
          >
            Skip to content
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
