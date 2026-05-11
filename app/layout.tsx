import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Travel Outfits",
  description: "Planificador de outfits para viajes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col bg-[#faf9f7]">{children}</body>
    </html>
  );
}
