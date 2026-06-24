import type { Metadata } from "next";
import { Archivo, Space_Grotesk, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';

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

// Arabic UI font: self-hosted, not preloaded — only fetched when RTL text actually renders it.
const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  display: "swap",
  preload: false,
  variable: "--font-noto-arabic",
});

// NOTE: title & description are rendered as literal <head> tags below (localized, always
// in the SSR <head>) instead of via this API. The Metadata API streams tags into <body>
// for non-bot UAs on this cookie-dynamic route, which static SEO crawlers/Lighthouse miss.
export const metadata: Metadata = {
  keywords: ["Full Stack Developer", "Web Developer", "React", "Next.js", "TypeScript", "Portfolio", "Keltoum Malouki", "Morocco", "Casablanca"],
  authors: [{ name: "Keltoum Malouki" }],
  creator: "Keltoum Malouki",
  metadataBase: new URL("https://www.keltoummalouki.com"),
  openGraph: {
    title: "Keltoum Malouki | Full Stack Web Developer",
    description: "Building modern, performant, and accessible web experiences.",
    type: "website",
    locale: "fr_MA",
    url: "https://www.keltoummalouki.com",
    siteName: "Keltoum Malouki Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Keltoum Malouki | Full Stack Web Developer",
    description: "Building modern, performant, and accessible web experiences.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const isRTL = locale === 'ar';

  const m = messages as unknown as {
    hero: { name: string; role: string };
    about: { description: string };
  };
  const seoTitle = `${m.hero.name} | ${m.hero.role}`;
  const seoDescription = m.about.description;

  return (
    <html
      lang={locale}
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`${archivo.variable} ${spaceGrotesk.variable} ${notoSansArabic.variable}`}
      suppressHydrationWarning
    >
      <head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href="https://www.keltoummalouki.com" />
      </head>
      <body className="min-h-screen">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
            >
              Skip to content
            </a>
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
