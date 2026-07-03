import type { Metadata } from "next";
import { Libre_Baskerville, Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { VercelInsights } from "@/components/scripts/vercel-insights";
import { metadataBase, pageMetadata } from "@/lib/seo";

const baskerville = Libre_Baskerville({
  variable: "--font-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase,
  ...pageMetadata({ path: "/" }),
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${baskerville.variable} ${manrope.variable} ${plexMono.variable} antialiased`}
    >
      <body>
        {children}
        <VercelInsights />
      </body>
    </html>
  );
}
