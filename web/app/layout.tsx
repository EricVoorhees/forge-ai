import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Open Frame - FORGE AI API",
    template: "%s | Open Frame",
  },
  description: "FORGE is a 671B parameter AI model built for code generation, reasoning, and analysis. Access via API at $1.00/1M input tokens.",
  keywords: ["AI API", "FORGE", "Open Frame", "code generation", "LLM", "AI coding", "machine learning API", "671B model"],
  authors: [{ name: "Open Frame" }],
  creator: "Open Frame",
  publisher: "Open Frame",
  metadataBase: new URL("https://openframe.co"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://openframe.co",
    siteName: "Open Frame",
    title: "Open Frame - FORGE AI API",
    description: "FORGE is a 671B parameter AI model built for code generation, reasoning, and analysis. Access via API at $1.00/1M input tokens.",
    images: [
      {
        url: "https://openframe.co/og-image.png",
        width: 1280,
        height: 720,
        alt: "Open Frame - FORGE AI API",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Open Frame - FORGE AI API",
    description: "FORGE is a 671B parameter AI model built for code generation, reasoning, and analysis.",
    images: ["https://openframe.co/og-image.png"],
    creator: "@openframe",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#ffffff",
          colorBackground: "#18181b",
          colorInputBackground: "#27272a",
          colorInputText: "#ffffff",
          colorText: "#ffffff",
          colorTextSecondary: "#a1a1aa",
          colorDanger: "#ef4444",
          borderRadius: "0.75rem",
        },
        elements: {
          formButtonPrimary: "bg-white text-black font-semibold hover:bg-zinc-200",
          card: "bg-zinc-900 border border-zinc-800",
          headerTitle: "text-white",
          headerSubtitle: "text-zinc-400",
          socialButtonsBlockButton: "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700",
          socialButtonsBlockButtonText: "text-white",
          formFieldLabel: "text-zinc-300",
          formFieldInput: "bg-zinc-800 border-zinc-700 text-white",
          footerActionLink: "text-white hover:text-zinc-300",
          footerActionText: "text-zinc-400",
          identityPreviewText: "text-white",
          identityPreviewEditButtonIcon: "text-zinc-400",
          userButtonPopoverCard: "bg-zinc-900 border border-zinc-800",
          userButtonPopoverActionButton: "text-zinc-300 hover:text-white hover:bg-zinc-800",
          userButtonPopoverActionButtonText: "text-zinc-300",
          userButtonPopoverFooter: "hidden",
        },
      }}
    >
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
