import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Coins, X } from "lucide-react";

export function InsufficientCreditsModal({ open, onClose, needed, have }: { open: boolean; onClose: () => void; needed: number; have: number }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-panel border border-border rounded-2xl p-6 max-w-sm w-full text-center relative"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-ink-muted hover:text-ink">
              <X size={16} />
            </button>
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Coins size={22} className="text-accent" />
            </div>
            <h3 className="text-base font-semibold text-ink">Not enough credits</h3>
            <p className="text-sm text-ink-muted mt-2">
              This generation costs {needed} credits, but you only have {have}. Upgrade your plan to keep creating.
            </p>
            <Link to="/pricing" className="btn-primary w-full mt-5 inline-block text-sm">
              Upgrade plan
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
