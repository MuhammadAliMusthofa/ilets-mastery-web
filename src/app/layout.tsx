import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Asumsi pakai font Inter
import "./globals.css";
import QueryProvider from "../provider/QueryProvider";

// Import QueryProvider yang barusan lu bikin

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IELTS App Platform",
  description: "Platform ujian IELTS terbaik",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Bungkus seluruh aplikasi dengan QueryProvider */}
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}