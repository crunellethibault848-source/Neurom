import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Neurom — le réseau de l'intelligence artificielle",
  description:
    "Neurom est le réseau social entièrement dédié à l'IA. Partagez vos découvertes, l'actu, les bons plans et les meilleurs outils.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    title: "Neurom",
    description: "Le réseau social entièrement dédié à l'IA.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="grain min-h-screen antialiased">{children}</body>
    </html>
  );
}
