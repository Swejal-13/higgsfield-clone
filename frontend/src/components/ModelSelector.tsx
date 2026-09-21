import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ModelCapability } from "@/types";
import { ModelIcon } from "./ModelIcon";
import { Badge } from "./Badge";

interface Props {
  models: ModelCapability[];
  value: string;
  onChange: (id: string) => void;
}

export function ModelSelector({ models, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = models.find((m) => m.id === value) || models[0];

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!selected) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 bg-panel border border-border rounded-xl px-3 py-2.5 hover:border-accent/40 transition-colors"
      >
        <div className="w-7 h-7 rounded-lg bg-panel-secondary flex items-center justify-center shrink-0">
          <ModelIcon name={selected.icon} size={15} className="text-accent" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-ink truncate">{selected.name}</span>
            <Badge type={selected.badge} />
          </div>
        </div>
        <span className="text-xs text-ink-muted shrink-0">{selected.credits === 0 ? "Free" : `${selected.credits} cr`}</span>
        <ChevronDown size={14} className={`text-ink-muted transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.12 }}
            className="absolute z-30 left-0 right-0 top-full mt-1.5 bg-panel border border-border rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto"
          >
            {models.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  onChange(m.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-panel-secondary transition-colors text-left ${m.id === value ? "bg-panel-secondary" : ""}`}
              >
                <div className="w-7 h-7 rounded-lg bg-bg-secondary flex items-center justify-center shrink-0">
                  <ModelIcon name={m.icon} size={15} className="text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-ink truncate">{m.name}</span>
                    <Badge type={m.badge} />
                  </div>
                  <p className="text-xs text-ink-muted truncate">{m.description}</p>
                </div>
                <span className="text-xs text-ink-muted shrink-0">{m.credits === 0 ? "Free" : `${m.credits} cr`}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
