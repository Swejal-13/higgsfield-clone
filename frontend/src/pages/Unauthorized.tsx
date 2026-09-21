import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function Unauthorized() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <ShieldAlert size={40} className="text-red-400 mb-4" />
      <h1 className="text-2xl font-bold">Unauthorized</h1>
      <p className="text-sm text-ink-muted mt-1">You don't have permission to view this page.</p>
      <Link to="/app" className="btn-primary mt-6">Back to dashboard</Link>
    </div>
  );
}
