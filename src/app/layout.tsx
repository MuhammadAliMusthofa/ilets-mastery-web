import type { Metadata } from "next";
import { Figtree, Poppins } from "next/font/google";
import "./globals.css";
import QueryProvider from "../provider/QueryProvider";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "IELTS Vibe",
    template: "%s · IELTS Vibe",
  },
  description:
    "Go from English foundations to your IELTS General Training target band, with test simulations that mirror the real format.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${figtree.variable} ${poppins.variable}`}>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
