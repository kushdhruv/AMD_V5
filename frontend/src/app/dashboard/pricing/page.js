
"use client";

import { useState } from "react";
import { Check, Zap, Crown, Shield, Rocket } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const PLANS = [
  {
    id: "free",
    name: "Free Tier",
    price: { usd: "$0", inr: "₹0" },
    period: "/mo",
    credits: 100,
    features: ["100 Monthly Credits", "Basic Templates", "Community Support", "Standard Generation Speed"],
    icon: Shield,
    color: "bg-neutral-800",
    btnColor: "bg-neutral-700 hover:bg-neutral-600",
    popular: false,
  },
  {
    id: "creator",
    name: "Creator",
    price: { usd: "$15", inr: "₹499" },
    period: "/mo",
    credits: 1000,
    features: ["1,000 Monthly Credits", "Premium Templates", "No Watermarks", "Faster Generation", "Priority Support"],
    icon: Rocket,
    color: "bg-blue-900/20 border-blue-500/50",
    btnColor: "bg-blue-600 hover:bg-blue-500",
    popular: true,
  },
  {
    id: "pro",
    name: "Pro Agency",
    price: { usd: "$40", inr: "₹1,299" },
    period: "/mo",
    credits: 5000,
    features: ["5,000 Monthly Credits", "All Templates & Assets", "Custom Domains", "API Access", "private GitHub Repos"],
    icon: Crown,
    color: "bg-amber-900/20 border-amber-500/50",
    btnColor: "bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90",
    popular: false,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(null);
  const [currency, setCurrency] = useState("usd");

  const handleSubscribe = async (planId) => {
    if (planId === "free") return;
    setLoading(planId);

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push("/login?redirect=/dashboard/pricing");
            return;
        }

        const response = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                planId,
                userId: user.id,
                email: user.email,
                currency, // Pass selected currency
            }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Checkout failed");

        // Redirect to Stripe
        window.location.href = data.url;
    } catch (err) {
        alert("Error: " + err.message);
    } finally {
        setLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 md:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-white mb-4">
          Supercharge Your Creativity
        </h1>
        <p className="text-neutral-400 max-w-2xl mx-auto">
          Choose a plan that fits your needs. Upgrade anytime to get more credits and unlock premium features.
        </p>
        <p className="text-neutral-500 max-w-2xl mx-auto mt-4 text-sm flex items-center justify-center gap-4">
          <span className="flex items-center gap-1.5"><Shield size={16} className="text-green-500"/> Secure Checkout</span>
          <span className="flex items-center gap-1.5"><Zap size={16} className="text-primary"/> Supports GPay, Apple Pay & QR Codes</span>
        </p>
      </div>

      {/* Currency Toggle */}
      <div className="flex justify-center mb-10">
        <div className="bg-neutral-800/80 p-1.5 rounded-full flex items-center border border-white/10 shadow-lg">
          <button 
            onClick={() => setCurrency('usd')}
            className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${currency === 'usd' ? 'bg-primary text-white shadow-[0_0_15px_rgba(255,106,0,0.5)]' : 'text-neutral-400 hover:text-white'}`}
          >
            USD ($)
          </button>
          <button 
            onClick={() => setCurrency('inr')}
            className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${currency === 'inr' ? 'bg-primary text-white shadow-[0_0_15px_rgba(255,106,0,0.5)]' : 'text-neutral-400 hover:text-white'}`}
          >
            INR (₹)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative p-8 rounded-2xl border transition-all duration-500 hover:scale-105 group ${
              plan.popular 
                ? "border-primary/50 shadow-2xl shadow-primary/10 hover:shadow-[0_0_60px_rgba(255,106,0,0.4)] hover:border-primary z-10" 
                : "border-neutral-800 bg-neutral-900/50 hover:border-white/20 hover:shadow-[0_0_40px_rgba(255,255,255,0.05)]"
            } ${plan.color} flex flex-col`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-500">
                <plan.icon size={24} className={plan.popular ? "text-white" : "text-neutral-400 group-hover:text-white"} />
              </div>
              <h3 className={`text-xl font-bold mb-2 transition-colors ${plan.popular ? "text-primary group-hover:text-white" : "text-white"}`}>{plan.name}</h3>
              <div className="flex items-baseline gap-1 relative overflow-hidden h-12">
                <span className={`text-4xl font-bold text-white transition-transform duration-500 ${currency === 'usd' ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 absolute'}`}>{plan.price.usd}</span>
                <span className={`text-4xl font-bold text-white transition-transform duration-500 ${currency === 'inr' ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 absolute'}`}>{plan.price.inr}</span>
                <span className="text-neutral-500 ml-1">{plan.period}</span>
              </div>
              <p className="text-sm text-neutral-400 mt-2 font-mono">
                {plan.credits.toLocaleString()} credits / month
              </p>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-neutral-300">
                  <Check size={16} className={`mt-0.5 shrink-0 ${plan.popular ? "text-primary" : "text-green-500"}`} />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading === plan.id || plan.id === "free"}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                  plan.popular 
                    ? "bg-primary hover:bg-orange-500 hover:shadow-[0_0_20px_rgba(255,106,0,0.4)] hover:scale-105" 
                    : "bg-white/10 hover:bg-white/20"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading === plan.id ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : plan.id === "free" ? (
                "Current Plan"
              ) : (
                <>
                  Subscribe Now <Zap size={16} />
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
