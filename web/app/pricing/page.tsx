"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    description: "For individuals and small projects",
    price: 19,
    priceYearly: 190,
    inputRate: 1.05,
    outputRate: 2.10,
    rateNote: "Bundled credits",
    features: [
      "$19 in credits/month",
      "$1.05/1M input tokens",
      "$2.10/1M output tokens",
      "60 requests/minute",
      "Chat + API access",
      "Email support",
    ],
    highlight: false,
    cta: "Get Started",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For professionals and growing teams",
    price: 79,
    priceYearly: 790,
    inputRate: 1.02,
    outputRate: 2.05,
    rateNote: "Near API rates",
    features: [
      "$79 in credits/month",
      "$1.02/1M input tokens",
      "$2.05/1M output tokens",
      "120 requests/minute",
      "Chat + API access",
      "Priority support",
      "Usage analytics",
    ],
    highlight: true,
    badge: "Most Popular",
    cta: "Get Started",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large teams and organizations",
    price: 299,
    priceYearly: 2990,
    inputRate: 1.00,
    outputRate: 1.95,
    rateNote: "Best rates",
    features: [
      "$299 in credits/month",
      "$1.00/1M input tokens",
      "$1.95/1M output tokens",
      "500 requests/minute",
      "Chat + API access",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
    ],
    highlight: false,
    cta: "Contact Sales",
  },
];

const API_PRICING = {
  input: 1.00,
  output: 2.00,
  description: "Pay-as-you-go with no commitment. Best for variable usage.",
};

function TokenCalculator() {
  const [inputTokens, setInputTokens] = useState(1);
  const [outputTokens, setOutputTokens] = useState(1);

  const inputCost = inputTokens * API_PRICING.input;
  const outputCost = outputTokens * API_PRICING.output;
  const totalCost = inputCost + outputCost;

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6 md:p-8">
      <h3 className="text-white text-lg font-semibold mb-4">Cost Calculator</h3>
      <div className="space-y-4">
        <div>
          <label className="text-white/60 text-sm mb-2 block">Input Tokens (millions)</label>
          <input
            type="range"
            min="0.1"
            max="100"
            step="0.1"
            value={inputTokens}
            onChange={(e) => setInputTokens(parseFloat(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <div className="flex justify-between text-sm mt-1">
            <span className="text-white/50">{inputTokens.toFixed(1)}M tokens</span>
            <span className="text-white/70">${inputCost.toFixed(2)}</span>
          </div>
        </div>
        <div>
          <label className="text-white/60 text-sm mb-2 block">Output Tokens (millions)</label>
          <input
            type="range"
            min="0.1"
            max="100"
            step="0.1"
            value={outputTokens}
            onChange={(e) => setOutputTokens(parseFloat(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <div className="flex justify-between text-sm mt-1">
            <span className="text-white/50">{outputTokens.toFixed(1)}M tokens</span>
            <span className="text-white/70">${outputCost.toFixed(2)}</span>
          </div>
        </div>
        <div className="pt-4 border-t border-white/10">
          <div className="flex justify-between items-center">
            <span className="text-white/70">Estimated Monthly Cost</span>
            <span className="text-2xl font-semibold text-white">${totalCost.toFixed(2)}</span>
          </div>
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
    // Redirect to checkout or dashboard
    window.location.href = `/dashboard/billing?plan=${planId}`;
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full mb-6">
            <span className="text-orange-400 text-sm font-medium">Simple, transparent pricing</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Choose your plan
          </h1>
          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Start building with FORGE today. All plans include full API access, 
            chat interface, and our 671B parameter model.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 p-1 bg-white/5 border border-white/10 rounded-full">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                billingPeriod === "monthly"
                  ? "bg-white text-black"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                billingPeriod === "yearly"
                  ? "bg-white text-black"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Yearly
              <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded">
                Save 17%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 md:p-8 transition-all ${
                  plan.highlight
                    ? "bg-gradient-to-b from-orange-500/20 via-black to-black border-2 border-orange-500/40"
                    : "bg-black/40 border border-white/10 hover:border-white/20"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-1">{plan.name}</h3>
                  <p className="text-white/50 text-sm">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">
                      ${billingPeriod === "monthly" ? plan.price : Math.round(plan.priceYearly / 12)}
                    </span>
                    <span className="text-white/50">/month</span>
                  </div>
                  {billingPeriod === "yearly" && (
                    <p className="text-white/40 text-sm mt-1">
                      ${plan.priceYearly} billed annually
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-white font-medium">{plan.rateNote}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white/70 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  className={`w-full py-3 rounded-lg font-medium transition-all ${
                    plan.highlight
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Pricing Section */}
      <section className="py-20 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              API Pricing
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Need more flexibility? Use our pay-as-you-go API pricing for high-volume 
              applications or custom integrations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pricing Cards */}
            <div className="space-y-4">
              <div className="bg-black/40 border border-white/10 rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <h4 className="text-white font-semibold mb-1">Input Tokens</h4>
                  <p className="text-white/50 text-sm">Prompts and context you send</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white">${API_PRICING.input.toFixed(2)}</span>
                  <span className="text-white/50 text-sm block">per 1M tokens</span>
                </div>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <h4 className="text-white font-semibold mb-1">Output Tokens</h4>
                  <p className="text-white/50 text-sm">Generated responses</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white">${API_PRICING.output.toFixed(2)}</span>
                  <span className="text-white/50 text-sm block">per 1M tokens</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Volume Discounts</h4>
                    <p className="text-white/60 text-sm">
                      Using more than 100M tokens/month? Contact us for custom enterprise pricing 
                      with volume discounts up to 40% off.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculator */}
            <TokenCalculator />
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Compare Plans
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 text-white/50 font-medium">Feature</th>
                  <th className="text-center py-4 text-white font-medium">Starter</th>
                  <th className="text-center py-4 text-white font-medium">Pro</th>
                  <th className="text-center py-4 text-white font-medium">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-white/5">
                  <td className="py-4 text-white/70">Monthly Credits</td>
                  <td className="py-4 text-center text-white">$19</td>
                  <td className="py-4 text-center text-white">$79</td>
                  <td className="py-4 text-center text-white">$299</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 text-white/70">Input Token Rate</td>
                  <td className="py-4 text-center text-white">$1.05/1M</td>
                  <td className="py-4 text-center text-white">$1.02/1M</td>
                  <td className="py-4 text-center text-white">$1.00/1M</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 text-white/70">Output Token Rate</td>
                  <td className="py-4 text-center text-white">$2.10/1M</td>
                  <td className="py-4 text-center text-white">$2.05/1M</td>
                  <td className="py-4 text-center text-white">$1.95/1M</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 text-white/70">vs API Pricing</td>
                  <td className="py-4 text-center text-white/50">+5%</td>
                  <td className="py-4 text-center text-white/50">+2%</td>
                  <td className="py-4 text-center text-emerald-400">Best</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 text-white/70">Requests/Minute</td>
                  <td className="py-4 text-center text-white">60</td>
                  <td className="py-4 text-center text-white">120</td>
                  <td className="py-4 text-center text-white">500</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 text-white/70">API Access</td>
                  <td className="py-4 text-center"><CheckIcon /></td>
                  <td className="py-4 text-center"><CheckIcon /></td>
                  <td className="py-4 text-center"><CheckIcon /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 text-white/70">Chat Interface</td>
                  <td className="py-4 text-center"><CheckIcon /></td>
                  <td className="py-4 text-center"><CheckIcon /></td>
                  <td className="py-4 text-center"><CheckIcon /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 text-white/70">Usage Analytics</td>
                  <td className="py-4 text-center"><XIcon /></td>
                  <td className="py-4 text-center"><CheckIcon /></td>
                  <td className="py-4 text-center"><CheckIcon /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 text-white/70">Priority Support</td>
                  <td className="py-4 text-center"><XIcon /></td>
                  <td className="py-4 text-center"><CheckIcon /></td>
                  <td className="py-4 text-center"><CheckIcon /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 text-white/70">SLA Guarantee</td>
                  <td className="py-4 text-center"><XIcon /></td>
                  <td className="py-4 text-center"><XIcon /></td>
                  <td className="py-4 text-center"><CheckIcon /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 text-white/70">Custom Integrations</td>
                  <td className="py-4 text-center"><XIcon /></td>
                  <td className="py-4 text-center"><XIcon /></td>
                  <td className="py-4 text-center"><CheckIcon /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 border-t border-white/10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <FAQItem
              question="How does credit-based billing work?"
              answer="When you subscribe, you get your plan price as credits (e.g., $79 for Pro). Each API call deducts from your balance based on your plan's token rates. Higher plans get better rates, so your credits go further."
            />
            <FAQItem
              question="What happens when I run out of credits?"
              answer="When your credit balance reaches zero, API requests will return a 402 error. Your credits reset to your plan amount at the start of each billing cycle, or you can upgrade to a higher plan for more credits and better rates."
            />
            <FAQItem
              question="What's the difference between input and output tokens?"
              answer="Input tokens are the prompts, context, and messages you send to the API. Output tokens are the generated responses. Output tokens cost more because they require more compute. A typical conversation uses roughly 1:1 to 1:3 input to output ratio."
            />
            <FAQItem
              question="Do unused credits roll over?"
              answer="No, unused credits do not roll over to the next month. Each billing cycle resets your balance to your plan amount."
            />
            <FAQItem
              question="Why are plan rates better than API rates?"
              answer="Plans reward commitment with discounted token rates. The more you commit upfront, the better your per-token pricing. Enterprise gets 20% off compared to pay-as-you-go API rates."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to build with FORGE?
          </h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">
            Join thousands of developers using FORGE to build the next generation of AI-powered applications.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="px-8 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/research/model"
              className="px-8 py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors border border-white/10"
            >
              Learn About FORGE 1
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/openframe-logo.png" alt="Open Frame" width={24} height={24} />
            <span className="text-white/70 text-sm">© 2024 Open Frame. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-white/50 text-sm">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-emerald-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-5 h-5 text-white/20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
