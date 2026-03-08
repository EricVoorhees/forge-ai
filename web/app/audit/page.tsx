"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";

type InputMethod = "paste" | "upload" | "github" | "cicd";

export default function AuditPage() {
  const [inputMethod, setInputMethod] = useState<InputMethod>("paste");
  const [code, setCode] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const scrollToTool = () => {
    document.getElementById("audit-tool")?.scrollIntoView({ behavior: "smooth" });
  };

  // Animated counter hook
  const useCounter = (end: number, duration: number = 2000, suffix: string = "", prefix: string = "") => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      let startTime: number;
      let animationFrame: number;
      
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        // Easing function for smooth deceleration
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(easeOut * end));
        
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };
      
      animationFrame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);
    
    return `${prefix}${count}${suffix}`;
  };

  const stat1 = useCounter(50, 2000, "+");
  const stat2 = useCounter(30, 1800, "s", "< ");
  const stat3 = useCounter(99, 2200, ".2%");

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] opacity-50" />
        
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            {/* Logo + Brand */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="relative">
                <Image src="/openframe-logo.png" alt="F" width={48} height={48} className="relative z-10" />
                <div className="absolute inset-0 bg-orange-500/30 blur-xl" />
              </div>
              <span className="text-3xl font-semibold tracking-tight">Audit</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl mx-auto leading-[1.1]">
              AI-Powered Code
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Security Analysis</span>
            </h1>
            
            <p className="text-[#a1a1aa] text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Detect vulnerabilities, security flaws, and code quality issues before they reach production. Powered by FORGE 1.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={scrollToTool}
                className="px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors"
              >
                Start Audit
              </button>
              <Link
                href="/audit-docs"
                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-colors"
              >
                View Documentation
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-12 md:gap-20">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1 tabular-nums">{stat1}</div>
              <div className="text-[#71717a] text-sm">Vulnerability Types</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1 tabular-nums">{stat2}</div>
              <div className="text-[#71717a] text-sm">Average Scan Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1 tabular-nums">{stat3}</div>
              <div className="text-[#71717a] text-sm">Detection Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Video/Image Showcase Section */}
      <section className="py-24 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">See It In Action</h2>
            <p className="text-[#71717a] text-lg max-w-xl mx-auto">Watch how Forge Audit identifies critical vulnerabilities in real-time</p>
          </div>
          
          {/* Video Placeholder */}
          <div className="relative aspect-video bg-gradient-to-br from-[#18181b] to-[#0f0f11] rounded-2xl border border-white/[0.06] overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
              <span className="text-[#71717a] text-sm">Product Demo • 2:34</span>
              <span className="text-[#71717a] text-sm">Click to play</span>
            </div>
            {/* Placeholder gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/80 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Comprehensive Security Coverage</h2>
            <p className="text-[#71717a] text-lg max-w-xl mx-auto">From injection attacks to misconfigurations, we catch it all</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                title: "Security Vulnerabilities",
                description: "SQL injection, XSS, CSRF, authentication flaws, and 40+ vulnerability patterns",
                color: "orange"
              },
              {
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                title: "Secret Detection",
                description: "API keys, tokens, passwords, and credentials exposed in your codebase",
                color: "emerald"
              },
              {
                icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
                title: "Code Quality",
                description: "Anti-patterns, complexity issues, and maintainability concerns",
                color: "amber"
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group p-8 bg-gradient-to-br from-[#18181b]/50 to-transparent border border-white/[0.06] rounded-2xl hover:border-white/[0.12] transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-${feature.color}-500/10 border border-${feature.color}-500/20 flex items-center justify-center mb-6`}>
                  <svg className={`w-6 h-6 text-${feature.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-[#71717a] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Showcase */}
      <section className="py-24 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left - Image placeholder */}
            <div className="relative aspect-square bg-gradient-to-br from-[#18181b] to-[#0f0f11] rounded-2xl border border-white/[0.06] overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-[#52525b] text-sm">CI/CD Integration Screenshot</p>
                  <p className="text-[#3f3f46] text-xs mt-1">800 × 800px recommended</p>
                </div>
              </div>
            </div>

            {/* Right - Content */}
            <div>
              <div className="text-orange-400 text-sm font-medium uppercase tracking-wider mb-4">Seamless Integration</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Built for Your Pipeline</h2>
              <p className="text-[#a1a1aa] text-lg mb-8 leading-relaxed">
                Integrate Forge Audit directly into your CI/CD workflow. Get automated security checks on every commit, pull request, and deployment.
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  "GitHub Actions, GitLab CI, Jenkins, CircleCI",
                  "Block merges on critical vulnerabilities",
                  "Detailed reports in PR comments",
                  "Slack and email notifications",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[#a1a1aa]">{item}</span>
                  </div>
                ))}
              </div>

              <Link href="/audit-docs/cicd" className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors">
                View integration guide
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Languages Section */}
      <section className="py-24 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left - Content */}
            <div>
              <div className="text-amber-400 text-sm font-medium uppercase tracking-wider mb-4">Language Support</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Your Stack, Covered</h2>
              <p className="text-[#a1a1aa] text-lg mb-8 leading-relaxed">
                From JavaScript to Rust, from Python to Solidity. Forge Audit understands your code regardless of the language or framework.
              </p>
              
              <div className="flex flex-wrap gap-3">
                {["JavaScript", "TypeScript", "Python", "Go", "Rust", "Solidity", "Java", "C++", "Ruby", "PHP"].map((lang) => (
                  <span key={lang} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-[#a1a1aa]">
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Right - Image placeholder */}
            <div className="relative aspect-square bg-gradient-to-br from-[#18181b] to-[#0f0f11] rounded-2xl border border-white/[0.06] overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <p className="text-[#52525b] text-sm">Multi-language Support Visual</p>
                  <p className="text-[#3f3f46] text-xs mt-1">800 × 800px recommended</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audit Tool Section */}
      <section id="audit-tool" className="py-24 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Image src="/openframe-logo.png" alt="F" width={32} height={32} />
              <span className="text-2xl font-semibold">Audit</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Try It Now</h2>
            <p className="text-[#71717a] text-lg">Paste code, upload files, or connect your repository</p>
          </div>

          {/* Input Method Tabs */}
          <div className="flex items-center justify-center gap-1 p-1 bg-[#18181b] rounded-xl mb-6 w-fit mx-auto">
            {[
              { id: "paste", label: "Paste Code", icon: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" },
              { id: "upload", label: "Upload Files", icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" },
              { id: "github", label: "GitHub", icon: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" },
              { id: "cicd", label: "CI/CD", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setInputMethod(method.id as InputMethod)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  inputMethod === method.id
                    ? "bg-white text-black"
                    : "text-[#71717a] hover:text-white"
                }`}
              >
                <svg className="w-4 h-4" fill={method.id === "github" ? "currentColor" : "none"} stroke={method.id === "github" ? "none" : "currentColor"} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={method.icon} />
                </svg>
                {method.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="bg-[#0f0f11] border border-[#27272a] rounded-2xl overflow-hidden mb-6">
            {inputMethod === "paste" && (
              <div className="relative">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272a] bg-[#18181b]/50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <span className="text-[#52525b] text-xs font-mono">code.ts</span>
                </div>
                <div className="flex">
                  <div className="py-4 px-3 text-right select-none border-r border-[#27272a] bg-[#0c0c0e]">
                    {Array.from({ length: Math.max(code.split("\n").length, 15) }, (_, i) => (
                      <div key={i} className="text-[#3f3f46] text-xs font-mono leading-6">{i + 1}</div>
                    ))}
                  </div>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="// Paste your code here for security analysis..."
                    className="flex-1 bg-transparent text-[#e4e4e7] font-mono text-sm p-4 resize-none focus:outline-none min-h-[360px] leading-6 placeholder:text-[#3f3f46]"
                    spellCheck={false}
                  />
                </div>
              </div>
            )}

            {inputMethod === "upload" && (
              <div
                onDrop={handleFileDrop}
                onDragOver={(e) => e.preventDefault()}
                className="p-8"
              >
                <div className="border-2 border-dashed border-[#27272a] rounded-xl p-12 text-center hover:border-[#3f3f46] transition-colors">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#18181b] flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#52525b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-white font-medium mb-1">Drop files here or click to upload</p>
                  <p className="text-[#71717a] text-sm mb-4">Supports .js, .ts, .py, .go, .rs, .sol and more</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".js,.jsx,.ts,.tsx,.py,.go,.rs,.sol,.java,.cpp,.c,.rb,.php"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Select Files
                  </button>
                </div>

                {files.length > 0 && (
                  <div className="mt-6 space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between px-4 py-3 bg-[#18181b] rounded-lg">
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-[#71717a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-white text-sm font-mono">{file.name}</span>
                          <span className="text-[#52525b] text-xs">{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <button onClick={() => removeFile(index)} className="text-[#71717a] hover:text-red-400 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {inputMethod === "github" && (
              <div className="p-8">
                <div className="max-w-xl mx-auto">
                  <div className="flex items-center gap-3 mb-6">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <div>
                      <h3 className="text-white font-medium">Connect Repository</h3>
                      <p className="text-[#71717a] text-sm">Analyze code directly from GitHub</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[#a1a1aa] text-sm mb-2 block">Repository URL</label>
                      <input
                        type="text"
                        placeholder="https://github.com/username/repository"
                        className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-4 py-3 text-white text-sm placeholder:text-[#52525b] focus:outline-none focus:border-[#3f3f46]"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="text-[#a1a1aa] text-sm mb-2 block">Branch</label>
                        <input
                          type="text"
                          placeholder="main"
                          className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-4 py-3 text-white text-sm placeholder:text-[#52525b] focus:outline-none focus:border-[#3f3f46]"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[#a1a1aa] text-sm mb-2 block">Path (optional)</label>
                        <input
                          type="text"
                          placeholder="/src"
                          className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-4 py-3 text-white text-sm placeholder:text-[#52525b] focus:outline-none focus:border-[#3f3f46]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {inputMethod === "cicd" && (
              <div className="p-8">
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">CI/CD Integration</h3>
                      <p className="text-[#71717a] text-sm">Add Forge Audit to your pipeline</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      { name: "GitHub Actions", initial: "G" },
                      { name: "GitLab CI", initial: "G" },
                      { name: "Jenkins", initial: "J" },
                      { name: "CircleCI", initial: "C" },
                    ].map((ci) => (
                      <button
                        key={ci.name}
                        className="flex items-center gap-3 p-4 bg-[#18181b] border border-[#27272a] rounded-xl hover:border-[#3f3f46] transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#27272a] flex items-center justify-center">
                          <span className="text-white text-lg font-bold">{ci.initial}</span>
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium">{ci.name}</div>
                          <div className="text-[#52525b] text-xs">Click to configure</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="bg-[#18181b] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[#71717a] text-xs font-mono">github-actions.yml</span>
                      <button className="text-[#71717a] text-xs hover:text-white transition-colors">Copy</button>
                    </div>
                    <pre className="text-sm font-mono text-[#a1a1aa] overflow-x-auto">
{`- name: Forge Audit
  uses: openframe/forge-audit@v1
  with:
    api-key: \${{ secrets.FORGE_API_KEY }}
    fail-on: critical,high`}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Run Audit Button */}
          <div className="flex items-center justify-center">
            <button
              disabled={inputMethod === "paste" && !code.trim()}
              className="flex items-center gap-3 px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Run Security Audit
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Image src="/openframe-logo.png" alt="F" width={40} height={40} />
            <span className="text-2xl font-semibold">Audit</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Secure Your Code?</h2>
          <p className="text-[#a1a1aa] text-lg mb-10 max-w-xl mx-auto">
            Join thousands of developers who trust Forge Audit to keep their applications secure.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer spacer */}
      <div className="h-16" />
    </div>
  );
}
