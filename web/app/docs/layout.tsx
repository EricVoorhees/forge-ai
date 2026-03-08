import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: {
    default: "Open Frame API Documentation",
    template: "%s | Open Frame Docs",
  },
  description: "Complete Open Frame API documentation. Access our state-of-the-art FORGE model (671B parameters) for code generation, reasoning, and analysis. Guides, API reference, SDKs, and examples for Python, Node.js, and REST.",
  keywords: [
    "Open Frame API",
    "Open Frame documentation",
    "AI API docs",
    "LLM API",
    "code generation API",
    "FORGE model",
    "Python SDK",
    "Node.js SDK",
    "REST API",
    "chat completions",
    "streaming API",
    "OpenAI compatible API",
    "671B model",
    "AI coding assistant API"
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://openframe.co/docs",
    siteName: "Open Frame",
    title: "Open Frame API Documentation",
    description: "Complete Open Frame API documentation. Access our state-of-the-art FORGE model for code generation, reasoning, and analysis at $1.00/1M tokens.",
    images: [
      {
        url: "https://openframe.co/og-image.png",
        width: 1280,
        height: 720,
        alt: "Open Frame API Documentation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Open Frame API Documentation",
    description: "Build powerful AI applications with Open Frame. Access our state-of-the-art FORGE model via API.",
    images: ["https://openframe.co/og-image.png"],
    creator: "@openframe",
  },
  alternates: {
    canonical: "https://openframe.co/docs",
  },
};

const sidebarNav = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Quickstart", href: "/docs/quickstart" },
      { title: "Authentication", href: "/docs/authentication" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { title: "Chat Completions", href: "/docs/api/chat" },
      { title: "Models", href: "/docs/api/models" },
      { title: "Streaming", href: "/docs/api/streaming" },
      { title: "Error Handling", href: "/docs/api/errors" },
    ],
  },
  {
    title: "Guides",
    items: [
      { title: "Best Practices", href: "/docs/guides/best-practices" },
      { title: "Prompt Engineering", href: "/docs/guides/prompts" },
      { title: "Rate Limits", href: "/docs/guides/rate-limits" },
    ],
  },
  {
    title: "SDKs",
    items: [
      { title: "Python", href: "/docs/sdks/python" },
      { title: "Node.js", href: "/docs/sdks/node" },
      { title: "REST API", href: "/docs/sdks/rest" },
    ],
  },
  ];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-[1400px] mx-auto flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 border-r border-white/[0.06] min-h-screen sticky top-0">
          {/* Logo */}
          <div className="p-6 border-b border-white/[0.06]">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/openframe-logo.png" alt="Open Frame" width={24} height={24} />
              <span className="text-lg font-semibold text-white tracking-tight">Open Frame</span>
            </Link>
          </div>
          
          <div className="p-6">
            <div className="text-[#52525b] text-xs font-medium uppercase tracking-wider mb-6">
              Documentation
            </div>
            <nav className="space-y-8">
              {sidebarNav.map((section) => (
                <div key={section.title}>
                  <div className="text-white/80 text-sm font-medium mb-3">
                    {section.title}
                  </div>
                  <ul className="space-y-1">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <a
                          href={item.href}
                          className="block text-[#71717a] text-sm py-1.5 px-3 -ml-3 rounded-lg hover:text-white hover:bg-white/[0.04] transition-colors"
                        >
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
