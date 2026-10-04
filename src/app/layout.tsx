import type { Metadata, Viewport } from "next";
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
import { PERSON, SITE_NAME, SITE_URL, isIndexable } from "@/features/seo/site";

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

// Archivo (headings) + Space Grotesk (body) are the published theme and are
// preloaded. The others only render when a visitor or admin picks another font
// preset, so they are fetched on demand instead of preloaded on every page.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-manrope",
});

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-outfit",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-plus-jakarta",
});

const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-sora",
});

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-urbanist",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-jetbrains-mono",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-playfair",
});

// Arabic UI font: self-hosted, not preloaded — only fetched when RTL text actually renders it.
const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  display: "swap",
  preload: false,
  variable: "--font-noto-arabic",
});

// Site-wide metadata defaults. `app/[locale]/layout.tsx` only localizes the
// default description; every public page sets its own title, canonical,
// hreflang and Open Graph via `buildPageMetadata`. Admin routes add `noindex`.
const verification: Metadata["verification"] = {
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
  ...(process.env.BING_SITE_VERIFICATION
    ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }
    : {}),
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${PERSON.name} — ${PERSON.jobTitle}`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Keltoum Malouki, Full Stack Web Developer in Casablanca, Morocco, builds web applications with React, Next.js, NestJS, Laravel and Ruby on Rails.",
  applicationName: SITE_NAME,
  authors: [{ name: PERSON.name, url: SITE_URL }],
  creator: PERSON.name,
  publisher: PERSON.name,
  keywords: [
    "Keltoum Malouki",
    ...PERSON.alternateName,
    "Full Stack Web Developer",
    "Développeuse Web Full Stack",
    "مطورة ويب متكاملة",
    "Web Developer Casablanca",
    "Casablanca",
    "Morocco",
    "Maroc",
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
    "NestJS",
    "Laravel",
    "Ruby on Rails",
    "Angular",
    "PostgreSQL",
    "Docker",
  ],
  formatDetection: { telephone: false, email: false, address: false },
  robots: isIndexable()
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
      }
    : { index: false, follow: false },
  ...(Object.keys(verification).length > 0 ? { verification } : {}),
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
  },
  category: "technology",
};

// Browser UI tint (mobile address bar, PWA title bar) matches the canvas.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0B0F19" },
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
  ],
  colorScheme: "dark light",
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
