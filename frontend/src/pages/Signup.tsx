import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { apiErrorMessage } from "@/api/client";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      toast("Account created — 150 free credits added!", "success");
      navigate("/app", { replace: true });
    } catch (err) {
      toast(apiErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm bg-panel border border-border rounded-card p-8 shadow-subtle">
        <div className="text-center mb-8">
          <div className="inline-flex w-11 h-11 rounded-lg bg-accent items-center justify-center mb-4">
            <svg width="22" height="22" viewBox="0 0 32 32"><path d="M9 8H23V11.2H12.2V14.4H19V17.6H12.2V24H9V8Z" fill="#FFFFFF" /></svg>
          </div>
          <h1 className="text-xl font-semibold">Create your account</h1>
          <p className="text-sm text-ink-muted mt-1">Start with 150 free credits.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-ink-muted mb-1 block">Name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Jordan Creator" />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-muted mb-1 block">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-muted mb-1 block">Password</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="At least 6 characters" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="text-sm text-ink-muted text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-accent font-medium hover:underline">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}
