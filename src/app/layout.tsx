import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AyAnime | Premium Anime Catalog",
  description: "Browse, track and discuss your favorite anime on AyAnime.",
};

import Providers from "@/components/shared/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground flex min-h-screen flex-col`}
        suppressHydrationWarning
      >
        <Providers>
          <div className="flex-1">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
