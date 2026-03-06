"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";
import { getSubscription, createCheckout, createPortal } from "@/lib/api";

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
  const { accessToken } = useAuthStore();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    if (accessToken) {
      getSubscription(accessToken)
        .then(setSubscription)
        .finally(() => setLoading(false));
    }
  }, [accessToken]);

  const handleUpgrade = async (plan: string) => {
    if (!accessToken) return;
    setUpgrading(plan);
    try {
      const { checkout_url } = await createCheckout(
        accessToken,
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
    if (!accessToken) return;
    try {
      const { portal_url } = await createPortal(
        accessToken,
        `${window.location.origin}/dashboard/billing`
      );
      window.location.href = portal_url;
    } catch (error) {
      console.error("Portal error:", error);
    }
  };

  if (loading) {
    return <div className="text-gray-400">Loading...</div>;
  }

  const currentPlan = subscription?.plan || "free";

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Billing</h1>

      {/* Current Plan */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-gray-400 text-sm">Current Plan</div>
            <div className="text-2xl font-bold text-white mt-1 capitalize">
              {currentPlan}
            </div>
            {subscription?.current_period_end && (
              <div className="text-gray-400 text-sm mt-1">
                Renews on{" "}
                {new Date(subscription.current_period_end).toLocaleDateString()}
              </div>
            )}
          </div>
          {currentPlan !== "free" && (
            <button
              onClick={handleManage}
              className="px-4 py-2 border border-gray-600 rounded text-white hover:bg-gray-700"
            >
              Manage Subscription
            </button>
          )}
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-gray-800 rounded-lg p-6 ${
              currentPlan === plan.id ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <div className="text-lg font-semibold text-white">{plan.name}</div>
            <div className="text-3xl font-bold text-white mt-2">
              {plan.price}
              <span className="text-sm text-gray-400 font-normal">/month</span>
            </div>
            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center text-gray-300">
                  <svg
                    className="w-5 h-5 text-green-400 mr-2"
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
                  className="w-full py-2 bg-gray-700 text-gray-400 rounded cursor-not-allowed"
                >
                  Current Plan
                </button>
              ) : plan.id === "free" ? (
                <button
                  disabled
                  className="w-full py-2 bg-gray-700 text-gray-400 rounded cursor-not-allowed"
                >
                  Free Tier
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={upgrading === plan.id}
                  className="w-full py-2 bg-white text-black rounded font-semibold hover:bg-gray-200 disabled:opacity-50"
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
