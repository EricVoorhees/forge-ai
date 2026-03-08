"use client";

import { useEffect, useState } from "react";
import { useForgeAuth } from "@/lib/use-forge-auth";
import { getSubscription, createCheckout, createPortal } from "@/lib/forge-api";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "$19",
    rateNote: "Bundled credits",
    features: ["$19 in credits/month", "$1.05/1M input", "$2.10/1M output", "60 req/min"],
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$79",
    rateNote: "Near API rates",
    features: ["$79 in credits/month", "$1.02/1M input", "$2.05/1M output", "120 req/min"],
    highlight: true,
    badge: "Most Popular",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$299",
    rateNote: "Best rates",
    features: ["$299 in credits/month", "$1.00/1M input", "$1.95/1M output", "500 req/min"],
    highlight: false,
  },
];

export default function BillingPage() {
  const { forgeToken, isLoading: authLoading } = useForgeAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    if (forgeToken) {
      getSubscription(forgeToken)
        .then(setSubscription)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [forgeToken, authLoading]);

  const handleUpgrade = async (plan: string) => {
    if (!forgeToken) return;
    setUpgrading(plan);
    try {
      const { checkout_url } = await createCheckout(
        forgeToken,
        plan,
        `${window.location.origin}/dashboard/billing?success=true`,
        `${window.location.origin}/dashboard/billing?canceled=true`
      );
      window.location.href = checkout_url;
    } catch (error) {
      console.error("Checkout error:", error);
      setUpgrading(null);
    }
  };

  const handleManage = async () => {
    if (!forgeToken) return;
    try {
      const { portal_url } = await createPortal(
        forgeToken,
        `${window.location.origin}/dashboard/billing`
      );
      window.location.href = portal_url;
    } catch (error) {
      console.error("Portal error:", error);
    }
  };

  if (authLoading || loading) {
    return <div className="text-zinc-400">Loading...</div>;
  }

  const currentPlan = subscription?.plan || "free";

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white tracking-tight">Billing</h1>

      {/* Current Plan */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[#71717a] text-sm">Current Plan</div>
            <div className="text-2xl font-semibold text-white mt-1 capitalize">
              {currentPlan}
            </div>
            {subscription?.current_period_end && (
              <div className="text-[#71717a] text-sm mt-1">
                Renews on{" "}
                {new Date(subscription.current_period_end).toLocaleDateString()}
              </div>
            )}
          </div>
          {currentPlan !== "free" && (
            <button
              onClick={handleManage}
              className="px-4 py-2 border border-[#27272a] rounded-lg text-white hover:bg-[#18181b] transition-colors"
            >
              Manage Subscription
            </button>
          )}
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-[#0a0a0a] border rounded-xl p-6 ${
              currentPlan === plan.id 
                ? "border-orange-500" 
                : plan.highlight 
                  ? "border-orange-500/40" 
                  : "border-[#1a1a1a]"
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                  {plan.badge}
                </span>
              </div>
            )}
            <div className="text-lg font-semibold text-white">{plan.name}</div>
            <div className="text-3xl font-semibold text-white mt-2">
              {plan.price}
              <span className="text-sm text-[#71717a] font-normal">/month</span>
            </div>
            <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
              <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-white text-sm font-medium">{plan.rateNote}</span>
            </div>
            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center text-[#a1a1aa] text-sm">
                  <svg
                    className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              {currentPlan === plan.id ? (
                <button
                  disabled
                  className="w-full py-2.5 bg-orange-500/20 text-orange-400 rounded-lg cursor-not-allowed text-sm font-medium border border-orange-500/30"
                >
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={upgrading === plan.id}
                  className={`w-full py-2.5 rounded-lg font-medium disabled:opacity-50 transition-colors text-sm ${
                    plan.highlight
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "bg-white text-black hover:bg-zinc-200"
                  }`}
                >
                  {upgrading === plan.id ? "Redirecting..." : currentPlan === "free" ? "Subscribe" : "Switch Plan"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* API Pricing Note */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold">Need more tokens?</h3>
            <p className="text-[#71717a] text-sm mt-1">
              For high-volume usage, contact us about our metered API plan with pay-as-you-go pricing 
              at $1.00/1M input tokens and $2.00/1M output tokens.
            </p>
            <a href="mailto:support@openframe.co" className="text-orange-400 text-sm mt-2 inline-block hover:underline">
              Contact Sales →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
