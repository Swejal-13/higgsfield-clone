import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

export default function ServerError() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <AlertTriangle size={40} className="text-red-400 mb-4" />
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-sm text-ink-muted mt-1">An unexpected error occurred. Please try again.</p>
      <Link to="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  );
}
