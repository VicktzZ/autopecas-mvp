import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/context/store-context";
import { SidebarNav } from "@/components/sidebar-nav";
import { Toaster } from "@/components/ui/sonner";

const fontSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontHeading = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoPeças MVP",
  description: "Sistema de estoque e vendas de autopeças (dados mockados)",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fontSans.variable} ${fontHeading.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <div className="flex min-h-screen">
            <SidebarNav />
            <main className="flex-1 min-w-0 overflow-x-hidden p-6 md:p-8">
              {children}
            </main>
          </div>
          <Toaster />
        </StoreProvider>
      </body>
    </html>
  );
}
