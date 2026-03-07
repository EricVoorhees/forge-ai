import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Open Frame - FORGE AI Coding API",
  description: "FORGE-671B: GPT-4 class AI coding API at a fraction of the cost. Built by Open Frame.",
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
