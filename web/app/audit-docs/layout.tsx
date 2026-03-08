import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: {
    default: "Open Frame Audit Documentation",
    template: "%s | Open Frame Audit Docs",
  },
  description: "Complete documentation for Open Frame Audit - AI-powered code security analysis. Learn how to integrate security scanning into your CI/CD pipeline, detect 50+ vulnerability types, and secure your codebase with our state-of-the-art FORGE model.",
  keywords: [
    "Open Frame Audit documentation",
    "code security docs",
    "vulnerability detection guide",
    "CI/CD security integration",
    "GitHub Actions security",
    "GitLab CI security",
    "Open Frame docs",
    "SAST documentation",
    "security scanning tutorial",
    "API security guide"
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://openframe.co/audit-docs",
    siteName: "Open Frame",
    title: "Open Frame Audit Documentation",
    description: "Complete documentation for Open Frame Audit. Learn to detect vulnerabilities, integrate with CI/CD, and secure your code with AI-powered analysis.",
    images: [
      {
        url: "https://openframe.co/og-image.png",
        width: 1280,
        height: 720,
        alt: "Open Frame Audit Documentation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Open Frame Audit Documentation",
    description: "Complete guide to AI-powered code security analysis with Open Frame Audit.",
    images: ["https://openframe.co/og-image.png"],
    creator: "@openframe",
  },
  alternates: {
    canonical: "https://openframe.co/audit-docs",
  },
};

const auditNav = [
  { title: "Overview", href: "/audit-docs" },
  { title: "Quickstart", href: "/audit-docs/quickstart" },
  { title: "Input Methods", href: "/audit-docs/methods" },
  { title: "CI/CD Integration", href: "/audit-docs/cicd" },
  { title: "Vulnerability Types", href: "/audit-docs/vulnerabilities" },
];

export default function AuditDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-[1400px] mx-auto flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 border-r border-white/[0.06] min-h-screen sticky top-0">
          {/* Logo + Brand */}
          <div className="p-6 border-b border-white/[0.06]">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/forge-logo.png" alt="Open Frame" width={24} height={24} />
              <span className="text-lg font-semibold text-white tracking-tight">Audit</span>
            </Link>
          </div>
          
          <div className="p-6">
            {/* Back to main docs */}
            <Link 
              href="/docs" 
              className="flex items-center gap-2 text-[#71717a] text-sm mb-6 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Docs
            </Link>

            <div className="text-[#52525b] text-xs font-medium uppercase tracking-wider mb-6">
              Open Frame Audit
            </div>
            <nav>
              <ul className="space-y-1">
                {auditNav.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="block text-[#71717a] text-sm py-2 px-3 -ml-3 rounded-lg hover:text-white hover:bg-orange-500/10 transition-colors"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Try Audit CTA */}
            <div className="mt-8 p-4 bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20 rounded-xl">
              <p className="text-white text-sm font-medium mb-2">Ready to try it?</p>
              <Link
                href="/audit"
                className="flex items-center gap-2 text-orange-400 text-sm hover:text-orange-300 transition-colors"
              >
                Open Open Frame Audit
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
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

