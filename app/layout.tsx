import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";

const displayFont = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Travel Outfits",
  description: "Planificador de outfits para viajes",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Travel Outfits",
  },
};

export const viewport: Viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`h-full ${displayFont.variable} ${bodyFont.variable}`}>
      <body className="min-h-full flex flex-col bg-[#EDE8DF]">{children}</body>
    </html>
  );
}
