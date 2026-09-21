import { useNavigate } from "react-router-dom";
import { ModelCapability } from "@/types";
import { ModelIcon } from "./ModelIcon";
import { Badge } from "./Badge";

export function ModelCard({ model }: { model: ModelCapability }) {
  const navigate = useNavigate();
  return (
    <div className="rounded-2xl border border-border bg-panel p-5 flex flex-col hover:border-accent/30 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-panel-secondary flex items-center justify-center">
          <ModelIcon name={model.icon} size={20} className="text-accent" />
        </div>
        <Badge type={model.badge} />
      </div>
      <p className="text-sm font-semibold text-ink">{model.name}</p>
      <p className="text-xs text-ink-muted mt-1 flex-1">{model.description}</p>
      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-ink-muted uppercase tracking-wide">{model.type}</span>
        <button
          onClick={() => navigate(`/${model.type}?model=${model.id}`)}
          className="text-xs font-semibold bg-panel-secondary hover:bg-accent hover:text-black px-3 py-1.5 rounded-full transition-colors"
        >
          Generate
        </button>
      </div>
    </div>
  );
}
