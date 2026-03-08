"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/playground", label: "Playground" },
  { href: "/dashboard/audit", label: "F Audit", hasLogo: true },
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
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#1a1a1a] min-h-screen bg-[#0a0a0a] flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[#1a1a1a]">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/openframe-logo.png" alt="Open Frame" width={24} height={24} />
            <span className="text-lg font-semibold text-white tracking-tight">Open Frame</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                pathname === item.href
                  ? "bg-[#18181b] text-white font-medium"
                  : "text-[#71717a] hover:text-white hover:bg-[#18181b]/50"
              }`}
            >
              {item.hasLogo && <Image src="/forge-logo.png" alt="F" width={16} height={16} className="rounded" />}
              {item.hasLogo ? "Audit" : item.label}
            </Link>
          ))}
        </nav>

        {/* User Button at bottom */}
        <div className="p-4 border-t border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9",
                },
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">Account</div>
              <Link href="/docs" className="text-[#71717a] text-xs hover:text-white transition-colors">
                View Docs →
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar with F Chat button */}
        <div className="h-14 border-b border-[#1a1a1a] bg-[#0a0a0a] flex items-center justify-between px-8">
          <div className="text-white/50 text-sm">Development Dashboard</div>
          <Link
            href="/chat"
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#252525] border border-white/10 rounded-full text-white text-sm font-medium transition-all group"
          >
            <span className="text-white/50">Go to</span>
            <Image src="/forge-logo.png" alt="F" width={16} height={16} className="rounded" />
            <span className="font-medium">Chat</span>
            <svg className="w-3.5 h-3.5 text-white/50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </Link>
        </div>
        <main className="flex-1 p-8 bg-[#0a0a0a]">{children}</main>
      </div>
    </div>
  );
}