import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchModels } from "@/api/models";
import { NavFeature } from "@/config/nav.config";
import { ModelIcon } from "./ModelIcon";
import { Badge } from "./Badge";
import { ModelType } from "@/types";

interface Props {
  features: NavFeature[];
  modelType: ModelType;
  onNavigate: () => void;
}

export function NavMegaDropdown({ features, modelType, onNavigate }: Props) {
  const { data: models = [] } = useQuery({
    queryKey: ["nav-models", modelType],
    queryFn: () => fetchModels(modelType),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.15 }}
      className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[720px] max-w-[92vw] bg-panel border border-border rounded-2xl shadow-2xl overflow-hidden grid grid-cols-2"
    >
      <div className="p-5 border-r border-border">
        <p className="text-[11px] font-bold tracking-wider text-ink-muted mb-3 uppercase">Features</p>
        <div className="space-y-0.5 max-h-[420px] overflow-y-auto pr-1">
          {features.map((f) => (
            <Link
              key={f.label}
              to={f.href}
              onClick={onNavigate}
              className="flex items-start justify-between gap-2 rounded-lg px-3 py-2.5 hover:bg-panel-secondary transition-colors group"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-ink group-hover:text-accent transition-colors">{f.label}</span>
                  <Badge type={f.badge} />
                </div>
                <p className="text-xs text-ink-muted mt-0.5">{f.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="p-5">
        <p className="text-[11px] font-bold tracking-wider text-ink-muted mb-3 uppercase">Models</p>
        <div className="space-y-0.5 max-h-[420px] overflow-y-auto pr-1">
          {models.map((m) => (
            <Link
              key={m.id}
              to={`/${modelType === "image" ? "image" : "video"}?model=${m.id}`}
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-panel-secondary transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-panel-secondary flex items-center justify-center shrink-0 group-hover:bg-accent/10">
                <ModelIcon name={m.icon} size={16} className="text-accent" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-ink truncate">{m.name}</span>
                  <Badge type={m.badge} />
                </div>
                <p className="text-xs text-ink-muted truncate">{m.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
