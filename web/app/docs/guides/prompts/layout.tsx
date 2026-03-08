import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prompt Engineering",
  description: "Master prompt engineering for the FORGE API. Learn techniques for code generation, reasoning tasks, and getting the best results from the 671B parameter model.",
  keywords: ["prompt engineering", "AI prompts", "code generation prompts", "LLM prompting", "few-shot learning", "chain of thought"],
  openGraph: {
    title: "FORGE Prompt Engineering Guide",
    description: "Master prompt engineering for code generation and reasoning with the FORGE 1 model.",
    url: "https://openframe.co/docs/guides/prompts",
    images: [{ url: "/og-image.png", width: 1280, height: 720, alt: "FORGE Prompt Engineering" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FORGE Prompt Engineering | Open Frame",
    description: "Learn effective prompting techniques for code generation and reasoning.",
    images: ["/og-image.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
