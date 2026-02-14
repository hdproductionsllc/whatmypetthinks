import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F59E0B",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://petsubtitles.com"),
  title: "PetSubtitles — What Is Your Pet Really Thinking?",
  description:
    "Upload a photo of your pet and our AI will translate their inner monologue into hilarious movie-style subtitles. Share the laughs!",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PetSubtitles",
  },
  openGraph: {
    title: "PetSubtitles — What Is Your Pet Really Thinking?",
    description:
      "Upload a photo of your pet and AI translates their thoughts into movie-style subtitles.",
    url: "https://petsubtitles.com",
    siteName: "PetSubtitles",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PetSubtitles — AI-powered pet thought translation",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PetSubtitles — What Is Your Pet Really Thinking?",
    description:
      "Upload a photo of your pet and AI translates their thoughts into movie-style subtitles.",
    images: ["/og-image.png"],
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fredoka.variable} ${nunito.variable}`}>
        {children}
      </body>
    </html>
  );
}
