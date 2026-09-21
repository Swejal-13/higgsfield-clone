import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { apiErrorMessage } from "@/api/client";

export default function Login() {
  const [email, setEmail] = useState("demo@higgsfield.demo");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast("Welcome back!", "success");
      const from = (location.state as any)?.from?.pathname || "/app";
      navigate(from, { replace: true });
    } catch (err) {
      toast(apiErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex w-11 h-11 rounded-xl bg-accent items-center justify-center mb-4">
            <svg width="22" height="22" viewBox="0 0 32 32"><path d="M9 22V10h3.2v4.8h7.6V10H23v12h-3.2v-4.8h-7.6V22H9z" fill="#090A0B" /></svg>
          </div>
          <h1 className="text-xl font-bold">Log in to Higgsfield</h1>
          <p className="text-sm text-ink-muted mt-1">Continue creating without limits.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-ink-muted mb-1 block">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-muted mb-1 block">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="••••••••" />
          </div>
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-ink-muted hover:text-accent">Forgot password?</Link>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        

        <p className="text-sm text-ink-muted text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-accent font-medium hover:underline">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
