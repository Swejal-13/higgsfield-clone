import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "hf_promo_dismissed_v1";
const END_TIME = Date.now() + 1000 * 60 * 60 * 26; // ~26h countdown for demo purposes

function getTimeLeft() {
  const diff = Math.max(0, END_TIME - Date.now());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s };
}

export function PromoBanner() {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(STORAGE_KEY) === "true");
  const [time, setTime] = useState(getTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (dismissed) return null;

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="bg-gradient-to-r from-[#151719] via-[#1b1e15] to-[#151719] border-b border-border">
      <div className="max-w-[1440px] mx-auto px-4 py-2.5 flex items-center justify-center gap-3 text-sm relative">
        <span className="text-ink">
          Get <span className="text-accent font-bold">54% OFF</span> Forge Pro — offer expires in{" "}
          <span className="font-mono text-accent">{pad(time.h)}:{pad(time.m)}:{pad(time.s)}</span>
        </span>
        <Link to="/pricing" className="text-accent font-semibold underline underline-offset-2 hover:no-underline">
          Claim offer
        </Link>
        <button onClick={dismiss} className="absolute right-4 text-ink-muted hover:text-ink">
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
