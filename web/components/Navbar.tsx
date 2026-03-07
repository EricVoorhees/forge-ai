"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

// Navigation Dropdown Component
function NavDropdown({ label, items }: { label: string; items: { title: string; href: string; desc?: string }[] }) {
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
        <div className="absolute top-full left-0 pt-2 z-50">
          <div className="bg-[#18181b] border border-white/10 rounded-xl p-2 min-w-[200px] shadow-xl">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="text-white text-sm font-medium">{item.title}</div>
                {item.desc && <div className="text-[#71717a] text-xs mt-0.5">{item.desc}</div>}
              </Link>
            ))}
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
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-[280px] bg-[#0a0a0a] border-l border-white/10 p-6">
        <div className="flex justify-end mb-8">
          <button onClick={onClose} className="text-[#a1a1aa] hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav className="space-y-6">
          <div>
            <div className="text-[#525252] text-xs uppercase tracking-wider mb-3">Product</div>
            <div className="space-y-2">
              <Link href="/dashboard" className="block text-[#a1a1aa] text-sm hover:text-white" onClick={onClose}>API Platform</Link>
              <Link href="/dashboard/playground" className="block text-[#a1a1aa] text-sm hover:text-white" onClick={onClose}>Playground</Link>
              <Link href="/pricing" className="block text-[#a1a1aa] text-sm hover:text-white" onClick={onClose}>Pricing</Link>
            </div>
          </div>
          
          <div>
            <div className="text-[#525252] text-xs uppercase tracking-wider mb-3">FORGE 1</div>
            <div className="space-y-2">
              <Link href="/research/model" className="block text-[#a1a1aa] text-sm hover:text-white" onClick={onClose}>Architecture</Link>
              <Link href="/research/benchmarks" className="block text-[#a1a1aa] text-sm hover:text-white" onClick={onClose}>Benchmarks</Link>
            </div>
          </div>
          
          <div>
            <div className="text-[#525252] text-xs uppercase tracking-wider mb-3">Company</div>
            <div className="space-y-2">
              <Link href="/about" className="block text-[#a1a1aa] text-sm hover:text-white" onClick={onClose}>About</Link>
              <Link href="/blog" className="block text-[#a1a1aa] text-sm hover:text-white" onClick={onClose}>Blog</Link>
              <Link href="/careers" className="block text-[#a1a1aa] text-sm hover:text-white" onClick={onClose}>Careers</Link>
            </div>
          </div>
          
          <div>
            <Link href="/docs" className="block text-[#a1a1aa] text-sm hover:text-white" onClick={onClose}>Documentation</Link>
          </div>
          
          <div className="pt-6 border-t border-white/10">
            <SignedOut>
              <div className="space-y-3">
                <Link href="/sign-in" className="block text-[#a1a1aa] text-sm hover:text-white" onClick={onClose}>Sign In</Link>
                <Link href="/sign-up" className="block bg-white text-black text-sm font-medium px-4 py-2 rounded-full text-center" onClick={onClose}>Get Started</Link>
              </div>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-3">
                <UserButton afterSignOutUrl="/" />
                <span className="text-[#a1a1aa] text-sm">Account</span>
              </div>
            </SignedIn>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <>
      <header className="bg-[#0a0a0a]/80 backdrop-blur-xl w-full fixed top-0 z-50 border-b border-white/5">
        <div className="h-14 flex justify-between items-center px-6 md:px-12 max-w-[1400px] mx-auto">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 mr-10">
              <Image src="/forge-logo.png" alt="Open Frame" width={28} height={28} />
              <span className="text-lg font-semibold text-white tracking-tight">Open Frame</span>
            </Link>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <NavDropdown 
                label="Product" 
                items={[
                  { title: "API Platform", href: "/dashboard", desc: "Build with FORGE" },
                  { title: "Playground", href: "/dashboard/playground", desc: "Test the model" },
                  { title: "Pricing", href: "/pricing", desc: "Plans & usage" },
                ]} 
              />
              <NavDropdown 
                label="FORGE 1" 
                items={[
                  { title: "Architecture", href: "/research/model", desc: "Model specifications" },
                  { title: "Benchmarks", href: "/research/benchmarks", desc: "Performance data" },
                ]} 
              />
              <NavDropdown 
                label="Company" 
                items={[
                  { title: "About", href: "/about", desc: "Our mission" },
                  { title: "Blog", href: "/blog", desc: "News & updates" },
                  { title: "Careers", href: "/careers", desc: "Join the team" },
                ]} 
              />
              <Link href="/docs" className="text-[#a1a1aa] text-sm hover:text-white transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Docs
              </Link>
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
