import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthGuard } from "@/components/AuthGuard";
import { DataProvider } from "@/components/DataProvider";
import { EraProvider } from "@/context/EraContext";
import { MusicProvider } from "@/context/MusicContext";
import { AdminSettingsProvider } from "@/context/AdminSettingsContext";
import { EraContent } from "@/components/EraContent";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Talia - Our Cozy Space",
  description: "A magical space for Polina and Me",
};

import { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans text-foreground">
        <AuthGuard>
          <DataProvider>
            <EraProvider>
              <AdminSettingsProvider>
                <MusicProvider>
                  <EraContent>{children}</EraContent>
                </MusicProvider>
              </AdminSettingsProvider>
            </EraProvider>
          </DataProvider>
        </AuthGuard>
      </body>
    </html>
  );
}

