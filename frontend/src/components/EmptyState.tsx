import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4">
      <div className="w-14 h-14 rounded-2xl bg-panel border border-border flex items-center justify-center mb-4">
        <Icon size={24} className="text-ink-muted" />
      </div>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="text-sm text-ink-muted mt-1 max-w-sm">{description}</p>
      {actionLabel && actionHref && (
        <Link to={actionHref} className="btn-primary mt-5 text-sm">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
