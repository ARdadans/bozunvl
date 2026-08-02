import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { BLOG } from "@/config/site";
import Script from "next/script";
import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#000000",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(BLOG.URL),
  title: {
    default: BLOG.TITLE,
    template: `%s | ${BLOG.TITLE}`,
  },
  description: BLOG.DESCRIPTION,
  keywords: [...BLOG.KEYWORDS],
  openGraph: {
    title: BLOG.TITLE,
    description: BLOG.DESCRIPTION,
    url: BLOG.URL,
    siteName: BLOG.TITLE,
    locale: BLOG.LOCALE.replace("-", "_"),
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: BLOG.TITLE,
    description: BLOG.DESCRIPTION,
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
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json', // Manifest will be loaded here
  verification: {
    google: '', // Empty for now, for Search Console
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={BLOG.LOCALE}
      className={`${geistSans.variable} ${geistMono.variable} ${bricolageGrotesque.variable} h-full antialiased dark`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Toaster />
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="PW4s6faP4mMxKG2LStALTw"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
