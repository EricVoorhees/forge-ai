"use client";

import Link from "next/link";
import Image from "next/image";

export default function AuditDocsPage() {
  return (
    <div className="pt-8 pb-16 px-8 lg:px-16">
      <div className="max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link href="/docs" className="text-[#71717a] hover:text-white transition-colors">Docs</Link>
          <span className="text-[#52525b]">/</span>
          <span className="text-white">Forge Audit</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Image src="/forge-logo.png" alt="F" width={32} height={32} />
          <h1 className="text-3xl font-bold text-white">Forge Audit</h1>
        </div>
        
        <p className="text-[#a1a1aa] text-lg mb-8 leading-relaxed">
          AI-powered code security analysis that detects vulnerabilities, secrets, and code quality issues before they reach production.
        </p>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {[
            { title: "Quickstart", href: "/audit-docs/quickstart", desc: "Get started in 5 minutes", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
            { title: "Input Methods", href: "/audit-docs/methods", desc: "Paste, upload, GitHub, CI/CD", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" },
            { title: "CI/CD Integration", href: "/audit-docs/cicd", desc: "Automate security checks", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
            { title: "Vulnerability Types", href: "/audit-docs/vulnerabilities", desc: "What we detect", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
          ].map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="group p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-orange-500/30 hover:bg-orange-500/5 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1 group-hover:text-orange-400 transition-colors">{link.title}</h3>
                  <p className="text-[#71717a] text-sm">{link.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Overview */}
        <h2 className="text-2xl font-semibold text-white mb-4">Overview</h2>
        <p className="text-[#a1a1aa] mb-6 leading-relaxed">
          Forge Audit uses the FORGE 1 model to perform deep semantic analysis of your code, identifying security vulnerabilities that traditional static analysis tools miss. It understands context, data flow, and business logic to provide accurate, actionable results.
        </p>

        <h3 className="text-xl font-semibold text-white mb-3">Key Features</h3>
        <ul className="space-y-3 mb-8">
          {[
            "50+ vulnerability patterns including SQL injection, XSS, CSRF, and authentication flaws",
            "Secret detection for API keys, tokens, passwords, and credentials",
            "Code quality analysis for anti-patterns and maintainability issues",
            "Support for 10+ programming languages",
            "CI/CD integration with GitHub Actions, GitLab CI, Jenkins, and CircleCI",
            "Detailed remediation suggestions with code examples",
          ].map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-[#a1a1aa]">
              <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>

        {/* How It Works */}
        <h2 className="text-2xl font-semibold text-white mb-4">How It Works</h2>
        <div className="space-y-6 mb-8">
          {[
            { step: "1", title: "Submit Code", desc: "Paste code, upload files, connect a GitHub repo, or integrate with your CI/CD pipeline." },
            { step: "2", title: "AI Analysis", desc: "FORGE 1 parses your code, builds an AST, and performs semantic analysis to understand context and data flow." },
            { step: "3", title: "Pattern Matching", desc: "The model checks against 50+ vulnerability patterns, secret formats, and code quality rules." },
            { step: "4", title: "Results & Remediation", desc: "Get detailed findings with severity levels, affected files/lines, and actionable fix suggestions." },
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
                <span className="text-orange-400 text-sm font-bold">{item.step}</span>
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">{item.title}</h4>
                <p className="text-[#71717a] text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Supported Languages */}
        <h2 className="text-2xl font-semibold text-white mb-4">Supported Languages</h2>
        <div className="flex flex-wrap gap-2 mb-8">
          {["JavaScript", "TypeScript", "Python", "Go", "Rust", "Solidity", "Java", "C++", "C", "Ruby", "PHP", "Swift", "Kotlin"].map((lang) => (
            <span key={lang} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-[#a1a1aa]">
              {lang}
            </span>
          ))}
        </div>

        {/* Next Steps */}
        <div className="p-6 bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20 rounded-xl">
          <h3 className="text-white font-semibold mb-2">Ready to get started?</h3>
          <p className="text-[#a1a1aa] text-sm mb-4">Follow our quickstart guide to run your first audit in under 5 minutes.</p>
          <Link
            href="/audit-docs/quickstart"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
          >
            Get Started
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

