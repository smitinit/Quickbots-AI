import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { Footer } from "@/components/footer";
import Navbar from "@/components/navbar";
import { SupabaseProvider } from "@/providers/SupabaseProvider";
import "./globals.css";

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
    default: "QuickBots · AI Chatbots",
    template: "%s · QuickBots",
  },
  description:
    "QuickBots is a personalized multi-tenant powerhouse for AI-driven chatbots.",
  icons: { icon: "/favicon.ico" },
  // themeColor: "#ffffff",
  // viewport: "width=device-width, initial-scale=1",
  openGraph: {
    title: "QuickBots · AI Chatbots",
    description:
      "Create, configure and manage AI-powered chatbots in one place.",
    // url: "https://quickbots.ai",
    siteName: "QuickBots",
    // images: [{ url: "/og.png", width: 1200, height: 630, alt: "QuickBots" }],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "QuickBots · AI Chatbots",
    description:
      "Create, configure and manage AI-powered chatbots in one place.",
    // images: ["/og.png"],
  },
  robots: { follow: true, index: true },
};

import { PreviewModalProvider } from "@/contexts/preview-modal-context";
import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link
          href="https://fonts.cdnfonts.com/css/getvoip-grotesque"
          rel="stylesheet"
        />
        <Script
          src="https://quickbot-ai.smit090305.workers.dev/v1/quickbot.iife.js"
          data-bot-id="fa876e10-77c6-47ae-a67c-1eeb59a2090f"
          defer
        ></Script>
      </head>
      <body className="antialiased">
        <ClerkProvider>
          <SupabaseProvider>
            <PreviewModalProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
              >
                <Navbar />

                {children}
                <Footer />
              </ThemeProvider>
            </PreviewModalProvider>
          </SupabaseProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
