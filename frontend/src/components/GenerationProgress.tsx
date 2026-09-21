import { motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { Generation } from "@/types";

export function GenerationProgress({ generation, onCancel }: { generation: Generation; onCancel?: () => void }) {
  const failed = generation.status === "FAILED";
  const cancelled = generation.status === "CANCELLED";

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center text-center py-10 px-4">
      {!failed && !cancelled ? (
        <Loader2 size={32} className="text-accent animate-spin mb-4" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <X size={18} className="text-red-400" />
        </div>
      )}
      <p className="text-sm font-medium text-ink">
        {failed ? "Generation failed" : cancelled ? "Generation cancelled" : generation.statusMessage}
      </p>
      {failed && generation.error && <p className="text-xs text-red-400 mt-1 max-w-xs">{generation.error}</p>}

      {!failed && !cancelled && (
        <div className="w-full h-1.5 bg-panel-secondary rounded-full mt-5 overflow-hidden">
          <motion.div
            className="h-full bg-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${generation.progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      )}

      {!failed && !cancelled && (
        <p className="text-xs text-ink-muted mt-2">{generation.progress}%</p>
      )}

      {onCancel && !failed && !cancelled && generation.status !== "COMPLETED" && (
        <button onClick={onCancel} className="btn-secondary mt-6 text-xs !py-1.5 !px-4">
          Cancel
        </button>
      )}
    </div>
  );
}
