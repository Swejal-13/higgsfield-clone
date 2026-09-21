import { Coins } from "lucide-react";
import { Link } from "react-router-dom";

export function CreditBadge({ credits }: { credits: number }) {
  return (
    <Link
      to="/pricing"
      className="hidden sm:flex items-center gap-1.5 bg-panel border border-border rounded-full px-3 py-1.5 text-xs font-semibold text-ink hover:border-accent/40 transition-colors"
      title="Buy more credits"
    >
      <Coins size={14} className="text-accent" />
      {credits.toLocaleString()}
    </Link>
  );
}
