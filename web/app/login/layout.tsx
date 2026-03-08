import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Open Frame",
  description: "Sign in to your Open Frame account to access the Open Frame API, manage API keys, view usage, and build with the 671B parameter AI model.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://openframe.co/login",
    siteName: "Open Frame",
    title: "Sign In to Open Frame",
    description: "Access your Open Frame API dashboard, manage API keys, and build with AI.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sign In to Open Frame",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In | Open Frame",
    description: "Access your Open Frame API dashboard.",
    images: ["/og-image.png"],
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
