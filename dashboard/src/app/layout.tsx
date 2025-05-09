import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Raedificare - Suivi V3",
  description: "Dashboard pour le suivi de la production des documents V3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="font-sans">{children}</body>
    </html>
  );
}
