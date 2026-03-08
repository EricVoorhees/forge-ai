import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: {
    default: "FORGE API Documentation | Open Frame",
    template: "%s | FORGE Docs | Open Frame",
  },
  description: "Complete FORGE API documentation by Open Frame. Access the 671B parameter FORGE 1 model for code generation, reasoning, and analysis. Guides, API reference, SDKs, and examples for Python, Node.js, and REST.",
  keywords: [
    "FORGE API",
    "Open Frame documentation",
    "AI API docs",
    "LLM API",
    "code generation API",
    "FORGE 1 model",
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
    title: "FORGE API Documentation - Build with AI",
    description: "Complete documentation for the FORGE API. Access the 671B parameter model for code generation, reasoning, and analysis at $1.00/1M tokens.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FORGE API Documentation by Open Frame",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FORGE API Documentation | Open Frame",
    description: "Build powerful AI applications with the FORGE API. Complete guides, reference, and SDKs.",
    images: ["/og-image.png"],
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
              <Image src="/forge-logo.png" alt="Open Frame" width={24} height={24} />
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
