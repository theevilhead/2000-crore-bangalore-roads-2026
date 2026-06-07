import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

// Single clean, institutional sans for the whole app (display + body).
const sans = Plus_Jakarta_Sans({
  variable: "--font-sans-base",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const mono = Geist_Mono({
  variable: "--font-mono-base",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fix Bengaluru Roads",
  description:
    "Map the bad road stretches in Bengaluru so the relaying work reaches the roads that need it most.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
