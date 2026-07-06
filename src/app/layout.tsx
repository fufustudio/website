import type { Metadata } from "next";
import { DM_Mono, Instrument_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { VercelInsights } from "@/components/scripts/vercel-insights";
import { metadataBase, pageMetadata } from "@/lib/seo";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: "400",
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
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
      className={`${instrumentSerif.variable} ${instrumentSans.variable} ${dmMono.variable} antialiased`}
    >
      <body>
        {children}
        <VercelInsights />
      </body>
    </html>
  );
}
