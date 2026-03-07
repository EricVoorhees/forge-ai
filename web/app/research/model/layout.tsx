import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FORGE 1 Architecture",
  description: "Technical specifications for FORGE 1 - a 671B parameter Mixture-of-Experts model with 128K context window, 37B active parameters, and state-of-the-art performance.",
  openGraph: {
    title: "FORGE 1 Architecture | Open Frame",
    description: "Technical specifications for FORGE 1 - a 671B parameter Mixture-of-Experts model.",
  },
};

export default function ModelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
