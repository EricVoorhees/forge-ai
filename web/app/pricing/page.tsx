"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";

// Plan icons
const PlanIcons = {
  starter: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  pro: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  enterprise: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
};

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For individuals",
    price: 19,
    priceYearly: 190,
    usage: "~13M tokens/mo",
    usageDetail: "with Forge Coder",
    icon: PlanIcons.starter,
    color: "blue",
    features: [
      { text: "All models included", icon: "check" },
      { text: "60 req/min", icon: "check" },
      { text: "Chat + API", icon: "check" },
      { text: "Email support", icon: "check" },
    ],
    highlight: false,
    cta: "Get Started",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For teams",
    price: 79,
    priceYearly: 790,
    usage: "~55M tokens/mo",
    usageDetail: "with Forge Coder",
    icon: PlanIcons.pro,
    color: "orange",
    features: [
      { text: "All models included", icon: "check" },
      { text: "120 req/min", icon: "check" },
      { text: "Chat + API", icon: "check" },
      { text: "Priority support", icon: "check" },
      { text: "Usage analytics", icon: "check" },
    ],
    highlight: true,
    badge: "Popular",
    cta: "Get Started",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For organizations",
    price: 299,
    priceYearly: 2990,
    usage: "~210M tokens/mo",
    usageDetail: "with Forge Coder",
    icon: PlanIcons.enterprise,
    color: "purple",
    features: [
      { text: "All models included", icon: "check" },
      { text: "500 req/min", icon: "check" },
      { text: "Chat + API", icon: "check" },
      { text: "Dedicated support", icon: "check" },
      { text: "Custom integrations", icon: "check" },
      { text: "SLA guarantee", icon: "check" },
    ],
    highlight: false,
    cta: "Contact Sales",
  },
];

// Competitor pricing for comparison
const COMPETITORS = {
  "gpt-4o": { name: "GPT-4o", input: 2.50, output: 10.00, provider: "OpenAI" },
  "gpt-4o-mini": { name: "GPT-4o Mini", input: 0.15, output: 0.60, provider: "OpenAI" },
  "claude-sonnet": { name: "Claude 3.5 Sonnet", input: 3.00, output: 15.00, provider: "Anthropic" },
  "claude-haiku": { name: "Claude 3.5 Haiku", input: 0.25, output: 1.25, provider: "Anthropic" },
};

const FORGE_MODELS = {
  "forge-coder": { name: "Forge Coder", input: 0.98, output: 1.87, desc: "671B MoE" },
  "forge-mini": { name: "Forge Mini", input: 0.079, output: 0.37, desc: "120B" },
};

function TokenCalculator() {
  const [tokens, setTokens] = useState(10);
  const [selectedModel, setSelectedModel] = useState<"forge-coder" | "forge-mini">("forge-coder");

  const model = FORGE_MODELS[selectedModel];
  // Assume 1:1.5 input:output ratio for simplicity
  const inputTokens = tokens * 0.4;
  const outputTokens = tokens * 0.6;
  const cost = (inputTokens * model.input) + (outputTokens * model.output);

  return (
    <div className="bg-[#0c0c0e] border border-white/[0.08] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-white font-semibold">Cost Calculator</h3>
          <p className="text-white/40 text-sm">Estimate your monthly spend</p>
        </div>
      </div>

      {/* Model Toggle */}
      <div className="flex gap-2 p-1 bg-white/[0.03] rounded-lg mb-6">
        <button
          onClick={() => setSelectedModel("forge-coder")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            selectedModel === "forge-coder"
              ? "bg-white/10 text-white"
              : "text-white/50 hover:text-white/70"
          }`}
        >
          Coder
        </button>
        <button
          onClick={() => setSelectedModel("forge-mini")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            selectedModel === "forge-mini"
              ? "bg-white/10 text-white"
              : "text-white/50 hover:text-white/70"
          }`}
        >
          Mini
        </button>
      </div>

      {/* Slider */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-white/50">Monthly tokens</span>
          <span className="text-white font-medium">{tokens}M</span>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={tokens}
          onChange={(e) => setTokens(parseInt(e.target.value))}
          className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-orange-500"
        />
        <div className="flex justify-between text-xs text-white/30 mt-1">
          <span>1M</span>
          <span>100M</span>
        </div>
      </div>

      {/* Result */}
      <div className="bg-white/[0.03] rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-sm">Estimated cost</span>
          <div className="text-right">
            <span className="text-2xl font-bold text-white">${cost.toFixed(2)}</span>
            <span className="text-white/40 text-sm">/mo</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompetitorComparison() {
  return (
    <div className="bg-[#0c0c0e] border border-white/[0.08] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.06] bg-white/[0.02]">
        <h3 className="text-white font-semibold">vs Competitors</h3>
        <p className="text-white/40 text-sm">Price per 1M tokens (blended avg)</p>
      </div>

      <div className="p-4 space-y-3">
        {/* Forge Models */}
        <div className="space-y-2">
          {Object.entries(FORGE_MODELS).map(([id, model]) => {
            const blended = ((model.input * 0.4) + (model.output * 0.6)).toFixed(2);
            return (
              <div key={id} className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-500/10 to-transparent rounded-lg border border-orange-500/20">
                <div className="flex items-center gap-3">
                  <Image src="/forge-logo.png" alt="F" width={20} height={20} />
                  <div>
                    <span className="text-white text-sm font-medium">{model.name}</span>
                    <span className="text-white/40 text-xs ml-2">{model.desc}</span>
                  </div>
                </div>
                <span className="text-orange-400 font-semibold">${blended}</span>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-px bg-white/[0.06]" />

        {/* Competitors */}
        <div className="space-y-2">
          {Object.entries(COMPETITORS).map(([id, model]) => {
            const blended = ((model.input * 0.4) + (model.output * 0.6)).toFixed(2);
            return (
              <div key={id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                <div>
                  <span className="text-white/70 text-sm">{model.name}</span>
                  <span className="text-white/30 text-xs ml-2">{model.provider}</span>
                </div>
                <span className="text-white/50 font-medium">${blended}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const { isSignedIn } = useUser();

  const handleSubscribe = (planId: string) => {
    if (!isSignedIn) {
      window.location.href = "/sign-up?redirect_url=/pricing";
      return;
    }
    window.location.href = `/dashboard/billing?plan=${planId}`;
  };

  const getColorClasses = (color: string, highlight: boolean) => {
    if (highlight) return "from-orange-500/20 border-orange-500/30";
    if (color === "blue") return "from-blue-500/10 border-white/[0.08]";
    if (color === "purple") return "from-purple-500/10 border-white/[0.08]";
    return "from-white/5 border-white/[0.08]";
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto mb-8">
            Start free, scale as you grow. All plans include both models.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center p-1 bg-white/[0.03] border border-white/[0.06] rounded-full">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                billingPeriod === "monthly" ? "bg-white text-black" : "text-white/50 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                billingPeriod === "yearly" ? "bg-white text-black" : "text-white/50 hover:text-white"
              }`}
            >
              Yearly
              <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold rounded">-17%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-gradient-to-b ${getColorClasses(plan.color, plan.highlight)} to-transparent rounded-2xl border p-6 transition-all hover:border-white/20`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Icon + Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan.highlight ? "bg-orange-500/20 text-orange-400" : "bg-white/[0.05] text-white/60"
                  }`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                    <p className="text-white/40 text-xs">{plan.tagline}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">
                      ${billingPeriod === "monthly" ? plan.price : Math.round(plan.priceYearly / 12)}
                    </span>
                    <span className="text-white/40 text-sm">/mo</span>
                  </div>
                </div>

                {/* Usage estimate */}
                <div className="mb-5 px-3 py-2.5 bg-white/[0.03] rounded-lg border border-white/[0.04]">
                  <div className="text-white font-medium text-sm">{plan.usage}</div>
                  <div className="text-white/40 text-xs">{plan.usageDetail}</div>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white/60 text-sm">{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
                    plan.highlight
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "bg-white/[0.05] text-white hover:bg-white/10 border border-white/[0.08]"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API + Calculator + Comparison - Side by Side */}
      <section className="py-16 px-4 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">API Pricing</h2>
            <p className="text-white/40">Pay-as-you-go with no commitments</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Our Models */}
            <div className="bg-[#0c0c0e] border border-white/[0.08] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Image src="/forge-logo.png" alt="F" width={20} height={20} />
                <span className="text-white font-semibold">FORGE Models</span>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-gradient-to-r from-orange-500/10 to-transparent rounded-lg border border-orange-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-medium">Coder</span>
                    <span className="text-white/40 text-xs">671B</span>
                  </div>
                  <div className="text-orange-400 text-lg font-bold">$1.51<span className="text-white/30 text-xs font-normal">/1M avg</span></div>
                </div>
                
                <div className="p-3 bg-gradient-to-r from-emerald-500/10 to-transparent rounded-lg border border-emerald-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-medium">Mini</span>
                    <span className="text-white/40 text-xs">120B</span>
                  </div>
                  <div className="text-emerald-400 text-lg font-bold">$0.25<span className="text-white/30 text-xs font-normal">/1M avg</span></div>
                </div>
              </div>
            </div>

            {/* Calculator */}
            <TokenCalculator />

            {/* Competitor Comparison */}
            <CompetitorComparison />
          </div>
        </div>
      </section>

      {/* Simple Feature Comparison */}
      <section className="py-16 px-4 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Plan Features</h2>

          <div className="grid grid-cols-4 gap-4 text-sm">
            {/* Header */}
            <div className="text-white/40 font-medium py-3"></div>
            <div className="text-center py-3">
              <div className="text-white font-medium">Starter</div>
              <div className="text-white/30 text-xs">$19/mo</div>
            </div>
            <div className="text-center py-3 bg-orange-500/10 rounded-t-lg border-t border-x border-orange-500/20">
              <div className="text-white font-medium">Pro</div>
              <div className="text-orange-400/70 text-xs">$79/mo</div>
            </div>
            <div className="text-center py-3">
              <div className="text-white font-medium">Enterprise</div>
              <div className="text-white/30 text-xs">$299/mo</div>
            </div>

            {/* Rows */}
            {[
              { feature: "Monthly usage", starter: "~13M", pro: "~55M", enterprise: "~210M" },
              { feature: "Rate limit", starter: "60/min", pro: "120/min", enterprise: "500/min" },
              { feature: "All models", starter: true, pro: true, enterprise: true },
              { feature: "API access", starter: true, pro: true, enterprise: true },
              { feature: "Chat interface", starter: true, pro: true, enterprise: true },
              { feature: "Analytics", starter: false, pro: true, enterprise: true },
              { feature: "Priority support", starter: false, pro: true, enterprise: true },
              { feature: "SLA guarantee", starter: false, pro: false, enterprise: true },
            ].map((row, i) => (
              <>
                <div key={`f-${i}`} className="text-white/50 py-3 border-t border-white/[0.04]">{row.feature}</div>
                <div key={`s-${i}`} className="text-center py-3 border-t border-white/[0.04]">
                  {typeof row.starter === "boolean" ? (
                    row.starter ? <CheckIcon /> : <XIcon />
                  ) : (
                    <span className="text-white">{row.starter}</span>
                  )}
                </div>
                <div key={`p-${i}`} className="text-center py-3 border-t border-orange-500/10 bg-orange-500/5">
                  {typeof row.pro === "boolean" ? (
                    row.pro ? <CheckIcon /> : <XIcon />
                  ) : (
                    <span className="text-white">{row.pro}</span>
                  )}
                </div>
                <div key={`e-${i}`} className="text-center py-3 border-t border-white/[0.04]">
                  {typeof row.enterprise === "boolean" ? (
                    row.enterprise ? <CheckIcon /> : <XIcon />
                  ) : (
                    <span className="text-white">{row.enterprise}</span>
                  )}
                </div>
              </>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Ready to build with FORGE?
          </h2>
          <p className="text-white/40 mb-6">
            Join thousands of developers building with our models.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="px-6 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/docs"
              className="px-6 py-2.5 bg-white/[0.05] text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-colors border border-white/[0.08]"
            >
              Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/openframe-logo.png" alt="Open Frame" width={20} height={20} />
            <span className="text-white/40 text-sm">© 2024 Open Frame</span>
          </div>
          <div className="flex items-center gap-4 text-white/40 text-sm">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-emerald-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-4 h-4 text-white/20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-white font-medium">{question}</span>
        <svg
          className={`w-5 h-5 text-white/50 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-white/60">{answer}</p>
        </div>
      )}
    </div>
  );
}
