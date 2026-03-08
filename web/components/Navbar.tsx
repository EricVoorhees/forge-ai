"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

// Navigation Dropdown Component
interface NavItem {
  title: string;
  href: string;
  desc: string;
  icon: React.ReactNode;
}

function NavDropdown({ label, items }: { label: string; items: NavItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center gap-1 text-[#a1a1aa] text-sm hover:text-white transition-colors py-2">
        {label}
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 pt-3 z-50">
          <div className="bg-[#141416] border border-white/10 rounded-2xl p-3 min-w-[320px] shadow-2xl">
            <div className="space-y-1">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-start gap-4 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 group-hover:text-white group-hover:bg-white/10 group-hover:border-white/20 transition-all flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium mb-0.5">{item.title}</div>
                    <div className="text-white/50 text-xs leading-relaxed">{item.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Models Dropdown - Professional design with F logo
function ModelsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center gap-1 text-[#a1a1aa] text-sm hover:text-white transition-colors py-2">
        Models
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50">
          <div className="bg-[#0c0c0e] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <span className="text-white/50 text-xs font-medium uppercase tracking-wider">Our Models</span>
            </div>
            
            <div className="p-2">
              {/* Forge Coder */}
              <div className="mb-1">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/20 flex items-center justify-center">
                    <Image src="/forge-logo.png" alt="F" width={16} height={16} />
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">Coder</div>
                    <div className="text-white/40 text-[11px]">671B MoE · Premium</div>
                  </div>
                </div>
                <div className="flex gap-1 pl-11">
                  <Link href="/research/model" className="px-3 py-1.5 text-white/60 text-xs hover:text-white hover:bg-white/[0.04] rounded-md transition-colors">
                    Architecture
                  </Link>
                  <Link href="/research/benchmarks" className="px-3 py-1.5 text-white/60 text-xs hover:text-white hover:bg-white/[0.04] rounded-md transition-colors">
                    Benchmarks
                  </Link>
                </div>
              </div>
              
              {/* Divider */}
              <div className="h-px bg-white/[0.06] mx-3 my-2" />
              
              {/* Forge Mini */}
              <div>
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 flex items-center justify-center">
                    <Image src="/forge-logo.png" alt="F" width={16} height={16} />
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">Mini</div>
                    <div className="text-white/40 text-[11px]">120B · Fast & Affordable</div>
                  </div>
                </div>
                <div className="flex gap-1 pl-11">
                  <Link href="/research/mini" className="px-3 py-1.5 text-white/60 text-xs hover:text-white hover:bg-white/[0.04] rounded-md transition-colors">
                    Architecture
                  </Link>
                  <Link href="/research/mini/benchmarks" className="px-3 py-1.5 text-white/60 text-xs hover:text-white hover:bg-white/[0.04] rounded-md transition-colors">
                    Benchmarks
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-white/[0.06] bg-white/[0.02]">
              <Link href="/pricing" className="text-white/50 text-xs hover:text-white transition-colors flex items-center gap-1">
                Compare pricing
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Mobile Menu Component
function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 bg-[#0a0a0a] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Image src="/openframe-logo.png" alt="Open Frame" width={28} height={28} />
            <span className="text-lg font-semibold text-white tracking-tight">Open Frame</span>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav className="px-6 py-8">
          {/* Product Section */}
          <div className="mb-8">
            <div className="text-white/40 text-xs uppercase tracking-wider mb-4 font-medium">Product</div>
            <div className="space-y-1">
              <Link href="/dashboard" className="flex items-center gap-4 px-4 py-4 rounded-xl bg-white/[0.02] hover:bg-white/5 transition-colors" onClick={onClose}>
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <div className="text-white text-base font-medium">API Platform</div>
                  <div className="text-white/50 text-sm">Access the FORGE API</div>
                </div>
              </Link>
              <Link href="/dashboard/playground" className="flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-white/5 transition-colors" onClick={onClose}>
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <div className="text-white text-base font-medium">Playground</div>
                  <div className="text-white/50 text-sm">Test the model</div>
                </div>
              </Link>
              <Link href="/audit" className="flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-white/5 transition-colors" onClick={onClose}>
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div>
                  <div className="text-white text-base font-medium">Forge Audit</div>
                  <div className="text-white/50 text-sm">Code security analysis</div>
                </div>
              </Link>
              <Link href="/pricing" className="flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-white/5 transition-colors" onClick={onClose}>
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <div className="text-white text-base font-medium">Pricing</div>
                  <div className="text-white/50 text-sm">Plans & usage</div>
                </div>
              </Link>
            </div>
          </div>
          
          {/* Models Section */}
          <div className="mb-8">
            <div className="text-white/40 text-xs uppercase tracking-wider mb-4 font-medium">Models</div>
            
            {/* Forge Coder */}
            <div className="mb-4">
              <div className="flex items-center gap-2 px-4 py-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-white text-sm font-medium">Forge Coder</span>
                <span className="text-white/40 text-xs">671B</span>
              </div>
              <div className="space-y-1 pl-4">
                <Link href="/research/model" className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors" onClick={onClose}>
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">Architecture</div>
                    <div className="text-white/50 text-xs">Model specifications</div>
                  </div>
                </Link>
                <Link href="/research/benchmarks" className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors" onClick={onClose}>
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">Benchmarks</div>
                    <div className="text-white/50 text-xs">Performance data</div>
                  </div>
                </Link>
              </div>
            </div>
            
            {/* Forge Mini */}
            <div>
              <div className="flex items-center gap-2 px-4 py-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-white text-sm font-medium">Forge Mini</span>
                <span className="text-white/40 text-xs">120B</span>
              </div>
              <div className="space-y-1 pl-4">
                <Link href="/research/mini" className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors" onClick={onClose}>
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">Architecture</div>
                    <div className="text-white/50 text-xs">Model specifications</div>
                  </div>
                </Link>
                <Link href="/research/mini/benchmarks" className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors" onClick={onClose}>
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">Benchmarks</div>
                    <div className="text-white/50 text-xs">Performance data</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Resources Section */}
          <div className="mb-8">
            <div className="text-white/40 text-xs uppercase tracking-wider mb-4 font-medium">Resources</div>
            <div className="space-y-1">
              <Link href="/docs" className="flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-white/5 transition-colors" onClick={onClose}>
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <div>
                  <div className="text-white text-base font-medium">Documentation</div>
                  <div className="text-white/50 text-sm">Guides & API reference</div>
                </div>
              </Link>
              <Link href="/blog" className="flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-white/5 transition-colors" onClick={onClose}>
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                </div>
                <div>
                  <div className="text-white text-base font-medium">Blog</div>
                  <div className="text-white/50 text-sm">News & updates</div>
                </div>
              </Link>
            </div>
          </div>
          
          {/* Auth Section */}
          <div className="pt-6 border-t border-white/10">
            <SignedOut>
              <div className="space-y-3">
                <Link href="/sign-in" className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl border border-white/20 text-white text-base font-medium hover:bg-white/5 transition-colors" onClick={onClose}>
                  Sign In
                </Link>
                <Link href="/sign-up" className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl bg-white text-black text-base font-medium hover:bg-white/90 transition-colors" onClick={onClose}>
                  Get Started
                </Link>
              </div>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-4 px-4 py-4">
                <UserButton afterSignOutUrl="/" />
                <span className="text-white text-base font-medium">My Account</span>
              </div>
            </SignedIn>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default function Navbar({ hideDocs = false }: { hideDocs?: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <>
      <header className="bg-[#0a0a0a]/80 backdrop-blur-xl w-full fixed top-0 z-50 border-b border-white/5">
        <div className="h-14 flex justify-between items-center px-6 md:px-12 max-w-[1400px] mx-auto">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 mr-10">
              <Image src="/openframe-logo.png" alt="Open Frame" width={28} height={28} />
              <span className="text-lg font-semibold text-white tracking-tight">Open Frame</span>
            </Link>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <NavDropdown 
                label="Product" 
                items={[
                  { 
                    title: "API Platform", 
                    href: "/dashboard", 
                    desc: "Access the FORGE API, manage keys, and monitor usage",
                    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  },
                  { 
                    title: "Playground", 
                    href: "/dashboard/playground", 
                    desc: "Test prompts and explore model capabilities interactively",
                    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  },
                  { 
                    title: "Forge Audit", 
                    href: "/audit", 
                    desc: "AI-powered code security analysis and vulnerability detection",
                    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  },
                  { 
                    title: "Pricing", 
                    href: "/pricing", 
                    desc: "Flexible plans for teams of all sizes with transparent pricing",
                    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  },
                ]} 
              />
              <ModelsDropdown />
              <NavDropdown 
                label="Company" 
                items={[
                  { 
                    title: "About", 
                    href: "/about", 
                    desc: "Learn about our mission to democratize AI development",
                    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  },
                  { 
                    title: "Blog", 
                    href: "/blog", 
                    desc: "Latest news, research updates, and engineering insights",
                    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                  },
                  { 
                    title: "Careers", 
                    href: "/careers", 
                    desc: "Join our team and help shape the future of AI",
                    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  },
                ]} 
              />
              {!hideDocs && (
                <Link href="/docs" className="text-[#a1a1aa] text-sm hover:text-white transition-colors flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Docs
                </Link>
              )}
            </nav>
          </div>
          
          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-3">
              <SignedOut>
                <Link href="/sign-in" className="text-[#a1a1aa] text-sm hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link href="/sign-up" className="bg-white text-black text-sm font-medium px-4 py-2 rounded-full hover:bg-white/90 transition-colors">
                  Get Started
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="text-[#a1a1aa] text-sm hover:text-white transition-colors mr-2">
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-[#a1a1aa] hover:text-white"
              onClick={() => setMobileMenuOpen(true)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
