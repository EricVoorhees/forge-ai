"use client";

import { useEffect, useState } from "react";
import { useForgeAuth } from "@/lib/use-forge-auth";
import { getSubscription, createCheckout, createPortal } from "@/lib/forge-api";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    features: ["20 requests/min", "100K tokens/day", "Community support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$99",
    features: ["120 requests/min", "2M tokens/day", "Priority support", "API analytics"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$299",
    features: ["500 requests/min", "10M tokens/day", "Dedicated support", "Custom limits"],
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
            className={`bg-[#0a0a0a] border rounded-xl p-6 ${
              currentPlan === plan.id ? "border-white" : "border-[#1a1a1a]"
            }`}
          >
            <div className="text-lg font-semibold text-white">{plan.name}</div>
            <div className="text-3xl font-semibold text-white mt-2">
              {plan.price}
              <span className="text-sm text-[#71717a] font-normal">/month</span>
            </div>
            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center text-[#a1a1aa] text-sm">
                  <svg
                    className="w-4 h-4 text-white mr-2 flex-shrink-0"
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
                  className="w-full py-2.5 bg-[#18181b] text-[#71717a] rounded-lg cursor-not-allowed text-sm font-medium"
                >
                  Current Plan
                </button>
              ) : plan.id === "free" ? (
                <button
                  disabled
                  className="w-full py-2.5 bg-[#18181b] text-[#71717a] rounded-lg cursor-not-allowed text-sm font-medium"
                >
                  Free Tier
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={upgrading === plan.id}
                  className="w-full py-2.5 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 disabled:opacity-50 transition-colors text-sm"
                >
                  {upgrading === plan.id ? "Redirecting..." : "Upgrade"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
