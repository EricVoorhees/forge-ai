"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/playground", label: "Playground" },
  { href: "/dashboard/api-keys", label: "API Keys" },
  { href: "/dashboard/usage", label: "Usage" },
  { href: "/dashboard/billing", label: "Billing" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/forge-logo.png" alt="Open Frame" width={24} height={24} />
              <span className="text-xl font-bold text-white tracking-tight">Open Frame</span>
            </Link>
            <span className="text-[#3f3f46] text-sm">Dashboard</span>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            {/* Create API Key Button */}
            <Link
              href="/dashboard/api-keys"
              className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded-full hover:bg-zinc-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Key
            </Link>
            
            {/* Playground Button */}
            <Link
              href="/dashboard/playground"
              className="flex items-center gap-2 px-4 py-2 border border-[#27272a] text-white text-sm font-medium rounded-full hover:bg-[#18181b] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Playground
            </Link>
            
            {/* Docs Button (Round) */}
            <Link
              href="/docs"
              className="flex items-center justify-center w-10 h-10 border border-[#27272a] text-zinc-400 rounded-full hover:bg-[#18181b] hover:text-white transition-colors"
              title="Documentation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </Link>
            
            {/* User Button */}
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10 border border-[#27272a]",
                },
              }}
            />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-[#1a1a1a] min-h-[calc(100vh-65px)] bg-[#0a0a0a]">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  pathname === item.href
                    ? "bg-[#18181b] text-white font-medium"
                    : "text-[#71717a] hover:text-white hover:bg-[#18181b]/50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-[#0a0a0a]">{children}</main>
      </div>
    </div>
  );
}
