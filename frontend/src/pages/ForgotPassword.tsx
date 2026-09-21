import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MailCheck } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center">
        {sent ? (
          <>
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <MailCheck size={22} className="text-accent" />
            </div>
            <h1 className="text-lg font-bold">Check your email</h1>
            <p className="text-sm text-ink-muted mt-2">If an account exists for {email}, a reset link is on its way (demo — no email is actually sent).</p>
          </>
        ) : (
          <>
            <h1 className="text-lg font-bold mb-1">Reset your password</h1>
            <p className="text-sm text-ink-muted mb-6">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-3 text-left">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" />
              <button type="submit" className="btn-primary w-full">Send reset link</button>
            </form>
          </>
        )}
        <Link to="/login" className="text-sm text-accent hover:underline mt-6 inline-block">Back to log in</Link>
      </motion.div>
    </div>
  );
}
