import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { QueryProvider } from "../components/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s - ASO Flow",
    default: "ASO Flow",
  },
  description: "Sistema de Gestão de Saúde Ocupacional",
};

// layout.tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-[#E0E2E2]`}
      >
        {/* O main com flex-1 empurra o footer para o fim da tela */}
        <main className="flex-1 flex flex-col">
        <QueryProvider>
          {children}
          </QueryProvider>
          <Footer />
        </main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
