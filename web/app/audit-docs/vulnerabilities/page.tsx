"use client";

import Link from "next/link";

export default function AuditVulnerabilitiesPage() {
  const vulnerabilities = [
    {
      category: "Injection Attacks",
      items: [
        { name: "SQL Injection", desc: "Unsanitized input in database queries" },
        { name: "NoSQL Injection", desc: "Injection in MongoDB, Redis, etc." },
        { name: "Command Injection", desc: "Shell command execution with user input" },
        { name: "LDAP Injection", desc: "Malicious LDAP queries" },
        { name: "XPath Injection", desc: "XML query manipulation" },
      ]
    },
    {
      category: "Cross-Site Scripting (XSS)",
      items: [
        { name: "Reflected XSS", desc: "User input reflected in response" },
        { name: "Stored XSS", desc: "Malicious scripts stored in database" },
        { name: "DOM-based XSS", desc: "Client-side script manipulation" },
      ]
    },
    {
      category: "Authentication & Authorization",
      items: [
        { name: "Broken Authentication", desc: "Weak session management" },
        { name: "Missing Authorization", desc: "Endpoints without access control" },
        { name: "Privilege Escalation", desc: "Unauthorized access to higher privileges" },
        { name: "Insecure Password Storage", desc: "Weak hashing or plaintext passwords" },
      ]
    },
    {
      category: "Secrets & Credentials",
      items: [
        { name: "Hardcoded API Keys", desc: "API keys in source code" },
        { name: "Exposed Tokens", desc: "JWT, OAuth tokens in code" },
        { name: "Database Credentials", desc: "Connection strings with passwords" },
        { name: "Private Keys", desc: "SSH, SSL keys in repositories" },
      ]
    },
    {
      category: "Data Exposure",
      items: [
        { name: "Sensitive Data Logging", desc: "PII or secrets in logs" },
        { name: "Information Disclosure", desc: "Error messages revealing internals" },
        { name: "Insecure Data Storage", desc: "Unencrypted sensitive data" },
      ]
    },
    {
      category: "Security Misconfiguration",
      items: [
        { name: "CORS Misconfiguration", desc: "Overly permissive cross-origin policies" },
        { name: "Missing Security Headers", desc: "CSP, HSTS, X-Frame-Options" },
        { name: "Debug Mode Enabled", desc: "Production debug settings" },
        { name: "Default Credentials", desc: "Unchanged default passwords" },
      ]
    },
  ];

  return (
    <div className="pt-8 pb-16 px-8 lg:px-16">
      <div className="max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link href="/docs" className="text-[#71717a] hover:text-white transition-colors">Docs</Link>
          <span className="text-[#52525b]">/</span>
          <Link href="/audit-docs" className="text-[#71717a] hover:text-white transition-colors">Forge Audit</Link>
          <span className="text-[#52525b]">/</span>
          <span className="text-white">Vulnerability Types</span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">Vulnerability Types</h1>
        <p className="text-[#a1a1aa] text-lg mb-8 leading-relaxed">
          Forge Audit detects 50+ vulnerability patterns across multiple categories. Here's a comprehensive list of what we scan for.
        </p>

        {/* Severity Legend */}
        <div className="flex items-center gap-4 mb-8 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
          <span className="text-[#71717a] text-sm">Severity levels:</span>
          <span className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs">Critical</span>
          <span className="px-2 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded text-xs">High</span>
          <span className="px-2 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-xs">Medium</span>
          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs">Low</span>
        </div>

        {/* Vulnerability Categories */}
        <div className="space-y-8">
          {vulnerabilities.map((category) => (
            <section key={category.category}>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-400" />
                {category.category}
              </h2>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {category.items.map((item, index) => (
                      <tr key={item.name} className={index !== category.items.length - 1 ? "border-b border-white/[0.06]" : ""}>
                        <td className="p-4 text-white font-medium w-1/3">{item.name}</td>
                        <td className="p-4 text-[#71717a]">{item.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 p-6 bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20 rounded-xl">
          <h3 className="text-white font-semibold mb-2">Custom Rules</h3>
          <p className="text-[#a1a1aa] text-sm mb-4">
            Need to detect custom vulnerability patterns specific to your codebase? Contact us about enterprise plans with custom rule support.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors text-sm"
          >
            View pricing
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-white/[0.06]">
          <Link href="/audit-docs/cicd" className="flex items-center gap-2 text-[#71717a] hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            CI/CD Integration
          </Link>
          <Link href="/audit-docs" className="flex items-center gap-2 text-[#71717a] hover:text-white transition-colors">
            Back to Forge Audit
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

