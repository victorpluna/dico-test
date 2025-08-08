import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Web3Provider } from "@/components/providers/Web3Provider";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { Toaster } from "@/components/ui/Toast";
import { Header } from "@/components/layout/Header";
import { SSRWrapper } from "@/lib/store/ssr-wrapper";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dico Platform - Decentralized ICO Platform",
  description:
    "The trustworthy platform for decentralized Initial Coin Offerings with transparency, security, and community-driven governance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <StoreProvider>
          <Web3Provider>
            <SSRWrapper>
              <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
                <Header />
                <main>
                  {children}
                </main>
              </div>
              <Toaster />
            </SSRWrapper>
          </Web3Provider>
        </StoreProvider>
      </body>
    </html>
  );
}
