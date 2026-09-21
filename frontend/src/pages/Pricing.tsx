import { useState } from "react";
import { Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

const PLANS = [
  {
    id: "free", name: "Free", monthly: 0, yearly: 0, credits: "150 one-time",
    features: ["150 starter credits", "Standard resolution (1K)", "Access to free models", "Community support"],
  },
  {
    id: "basic", name: "Basic", monthly: 12, yearly: 9, credits: "500 / month",
    features: ["500 credits / month", "Up to 2K resolution", "All image models", "Priority queue"],
  },
  {
    id: "pro", name: "Pro", monthly: 32, yearly: 25, credits: "2,000 / month", popular: true,
    features: ["2,000 credits / month", "Up to 4K resolution", "All image + video models", "Cinema Studio access", "Priority support"],
  },
  {
    id: "enterprise", name: "Enterprise", monthly: null, yearly: null, credits: "Custom",
    features: ["Unlimited seats", "Dedicated infrastructure", "Custom model fine-tuning", "SLA & dedicated support"],
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const { user, setUser } = useAuth();
  const { toast } = useToast();

  function handleUpgrade(planId: string) {
    if (!user) {
      toast("Log in to upgrade your plan", "info");
      return;
    }
    if (planId === "enterprise") {
      toast("Our team will reach out to set up your Enterprise plan (demo).", "info");
      return;
    }
    // Simulated upgrade for the assignment — no real payment.
    setUser({ ...user, plan: planId as any });
    toast(`Upgraded to ${planId[0].toUpperCase() + planId.slice(1)} (simulated)`, "success");
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 lg:px-6 py-14">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold">Simple, scalable pricing</h1>
        <p className="text-sm text-ink-muted mt-2">Start free. Upgrade anytime as your creative output grows.</p>

        <div className="inline-flex items-center bg-panel border border-border rounded-full p-1 mt-6">
          <button onClick={() => setYearly(false)} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${!yearly ? "bg-accent text-black" : "text-ink-muted"}`}>Monthly</button>
          <button onClick={() => setYearly(true)} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${yearly ? "bg-accent text-black" : "text-ink-muted"}`}>Yearly <span className="text-[10px] opacity-70">(save 22%)</span></button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {PLANS.map((p) => {
          const price = yearly ? p.yearly : p.monthly;
          const isCurrent = user?.plan === p.id;
          return (
            <div
              key={p.id}
              className={`rounded-2xl border bg-panel p-6 flex flex-col relative ${p.popular ? "border-accent shadow-glow" : "border-border"}`}
            >
              {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge badge-top">Most popular</span>}
              <p className="text-sm font-semibold text-ink-muted uppercase tracking-wide">{p.name}</p>
              <p className="text-3xl font-extrabold mt-2">
                {price === null ? "Custom" : `$${price}`}
                {price !== null && <span className="text-sm font-normal text-ink-muted">/mo</span>}
              </p>
              <p className="text-xs text-ink-muted mt-1">{p.credits} credits</p>
              <ul className="space-y-2 mt-5 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-ink-muted">
                    <Check size={13} className="text-accent shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade(p.id)}
                disabled={isCurrent}
                className={`w-full mt-6 text-sm ${p.popular ? "btn-primary" : "btn-secondary"}`}
              >
                {isCurrent ? "Current plan" : p.id === "enterprise" ? "Contact sales" : "Upgrade"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="max-w-2xl mx-auto mt-16 text-center">
        <h2 className="text-lg font-bold">FAQ</h2>
        <div className="text-left mt-6 space-y-4">
          <FaqItem q="Do unused credits roll over?" a="Basic and Pro credits refresh monthly and do not roll over. Enterprise plans can be customized." />
          <FaqItem q="Can I switch plans anytime?" a="Yes, upgrades and downgrades apply immediately in this demo environment." />
          <FaqItem q="Is payment required for this demo?" a="No — this is a college assignment. Upgrades here are simulated and no real payment is processed." />
        </div>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="border-b border-border pb-4">
      <p className="text-sm font-medium">{q}</p>
      <p className="text-xs text-ink-muted mt-1.5">{a}</p>
    </div>
  );
}
