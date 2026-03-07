"use client";

import Link from "next/link";
import Image from "next/image";

export default function AuditQuickstartPage() {
  return (
    <div className="pt-8 pb-16 px-8 lg:px-16">
      <div className="max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link href="/docs" className="text-[#71717a] hover:text-white transition-colors">Docs</Link>
          <span className="text-[#52525b]">/</span>
          <Link href="/audit-docs" className="text-[#71717a] hover:text-white transition-colors">Forge Audit</Link>
          <span className="text-[#52525b]">/</span>
          <span className="text-white">Quickstart</span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">Quickstart</h1>
        <p className="text-[#a1a1aa] text-lg mb-8 leading-relaxed">
          Get started with Forge Audit in under 5 minutes. This guide covers the fastest way to run your first security scan.
        </p>

        {/* Step 1 */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
              <span className="text-orange-400 text-sm font-bold">1</span>
            </div>
            <h2 className="text-xl font-semibold text-white">Navigate to Forge Audit</h2>
          </div>
          <p className="text-[#a1a1aa] mb-4 ml-11">
            Go to <Link href="/audit" className="text-orange-400 hover:underline">openframe.ai/audit</Link> or click "Forge Audit" in the Product dropdown menu.
          </p>
        </div>

        {/* Step 2 */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
              <span className="text-orange-400 text-sm font-bold">2</span>
            </div>
            <h2 className="text-xl font-semibold text-white">Choose an Input Method</h2>
          </div>
          <p className="text-[#a1a1aa] mb-4 ml-11">
            Select how you want to submit your code for analysis:
          </p>
          <div className="ml-11 space-y-3">
            {[
              { method: "Paste Code", desc: "Copy and paste code directly into the editor" },
              { method: "Upload Files", desc: "Drag and drop or select files from your computer" },
              { method: "GitHub", desc: "Connect a repository by URL" },
              { method: "CI/CD", desc: "Get integration snippets for your pipeline" },
            ].map((item) => (
              <div key={item.method} className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                <div className="w-2 h-2 rounded-full bg-orange-400 mt-2" />
                <div>
                  <span className="text-white font-medium">{item.method}</span>
                  <span className="text-[#71717a]"> — {item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3 */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
              <span className="text-orange-400 text-sm font-bold">3</span>
            </div>
            <h2 className="text-xl font-semibold text-white">Submit Your Code</h2>
          </div>
          <p className="text-[#a1a1aa] mb-4 ml-11">
            For the quickest start, paste some code into the editor. Here's an example with a vulnerability:
          </p>
          <div className="ml-11 bg-[#0f0f11] border border-[#27272a] rounded-xl overflow-hidden mb-4">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#27272a] bg-[#18181b]/50">
              <span className="text-[#52525b] text-xs font-mono">example.js</span>
              <button className="text-[#71717a] text-xs hover:text-white transition-colors">Copy</button>
            </div>
            <pre className="p-4 text-sm font-mono text-[#a1a1aa] overflow-x-auto">
{`// Example with SQL injection vulnerability
app.get('/user', (req, res) => {
  const userId = req.query.id;
  const query = "SELECT * FROM users WHERE id = " + userId;
  db.query(query, (err, result) => {
    res.json(result);
  });
});`}
            </pre>
          </div>
        </div>

        {/* Step 4 */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
              <span className="text-orange-400 text-sm font-bold">4</span>
            </div>
            <h2 className="text-xl font-semibold text-white">Run the Audit</h2>
          </div>
          <p className="text-[#a1a1aa] mb-4 ml-11">
            Click the <span className="text-white font-medium">"Run Security Audit"</span> button. The analysis typically completes in under 30 seconds.
          </p>
        </div>

        {/* Step 5 */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
              <span className="text-orange-400 text-sm font-bold">5</span>
            </div>
            <h2 className="text-xl font-semibold text-white">Review Results</h2>
          </div>
          <p className="text-[#a1a1aa] mb-4 ml-11">
            You'll see a list of findings organized by severity:
          </p>
          <div className="ml-11 flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm">Critical</span>
            <span className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg text-sm">High</span>
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-sm">Medium</span>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm">Low</span>
          </div>
          <p className="text-[#a1a1aa] ml-11">
            Each finding includes the vulnerability type, affected file and line, a description, and a suggested fix.
          </p>
        </div>

        {/* Next Steps */}
        <h2 className="text-2xl font-semibold text-white mb-4">Next Steps</h2>
        <div className="space-y-3 mb-8">
          <Link href="/audit-docs/methods" className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-orange-500/30 transition-colors group">
            <svg className="w-5 h-5 text-[#71717a] group-hover:text-orange-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white">Learn about all input methods</span>
          </Link>
          <Link href="/audit-docs/cicd" className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-orange-500/30 transition-colors group">
            <svg className="w-5 h-5 text-[#71717a] group-hover:text-orange-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white">Set up CI/CD integration</span>
          </Link>
          <Link href="/audit-docs/vulnerabilities" className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-orange-500/30 transition-colors group">
            <svg className="w-5 h-5 text-[#71717a] group-hover:text-orange-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white">Explore vulnerability types we detect</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

