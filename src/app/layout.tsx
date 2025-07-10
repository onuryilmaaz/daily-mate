import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "./providers/SessionProvider";
import Analytics from "./components/Analytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Daily Mate - Günlük Çalışma Takip Uygulaması",
    template: "%s | Daily Mate",
  },
  description:
    "Günlük çalışma saatlerinizi, kazançlarınızı ve iş yerlerinizi kolayca takip edin. Modern ve kullanıcı dostu arayüzü ile çalışma verilerinizi analiz edin.",
  keywords: [
    "çalışma takip",
    "günlük kazanç hesaplama",
    "iş yeri yönetimi",
    "çalışma saati takip",
    "freelancer takip",
    "günlük iş raporu",
    "work tracking",
    "daily earnings",
    "time tracking",
    "work management",
  ],
  authors: [
    {
      name: "Daily Mate Team",
      url: "https://dailymate.app",
    },
  ],
  creator: "Daily Mate",
  publisher: "Daily Mate",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://dailymate.app"
  ),
  alternates: {
    canonical: "/",
    languages: {
      "tr-TR": "/tr",
      "en-US": "/en",
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "/",
    title: "Daily Mate - Günlük Çalışma Takip Uygulaması",
    description:
      "Günlük çalışma saatlerinizi, kazançlarınızı ve iş yerlerinizi kolayca takip edin. Modern ve kullanıcı dostu arayüzü ile çalışma verilerinizi analiz edin.",
    siteName: "Daily Mate",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Daily Mate - Günlük Çalışma Takip Uygulaması",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Mate - Günlük Çalışma Takip Uygulaması",
    description:
      "Günlük çalışma saatlerinizi, kazançlarınızı ve iş yerlerinizi kolayca takip edin.",
    images: ["/twitter-image.png"],
    creator: "@dailymate",
    site: "@dailymate",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "productivity",
  classification: "Business Application",
  referrer: "origin-when-cross-origin",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#10b981" },
    { media: "(prefers-color-scheme: dark)", color: "#059669" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        {/* Additional SEO Tags */}
        <meta
          name="google-site-verification"
          content="your-google-verification-code"
        />
        <meta name="msvalidate.01" content="your-bing-verification-code" />
        <meta
          name="yandex-verification"
          content="your-yandex-verification-code"
        />

        {/* Performance & Security */}
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />

        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="manifest" href="/site.webmanifest" />

        {/* PWA */}
        <meta name="application-name" content="Daily Mate" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Daily Mate" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#10b981" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Daily Mate",
              description:
                "Günlük çalışma saatlerinizi, kazançlarınızı ve iş yerlerinizi kolayca takip edin.",
              url: process.env.NEXT_PUBLIC_APP_URL || "https://dailymate.app",
              applicationCategory: "ProductivityApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "TRY",
              },
              author: {
                "@type": "Organization",
                name: "Daily Mate Team",
              },
              datePublished: "2024-01-01",
              inLanguage: "tr-TR",
              isAccessibleForFree: true,
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Analytics />
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
