import { Link, useLocation } from "react-router-dom";
import { CompassIcon } from "lucide-react";

export default function NotFound() {
  const location = useLocation();
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <CompassIcon size={40} className="text-ink-muted mb-4" />
      <h1 className="text-5xl font-extrabold text-accent">404</h1>
      <p className="text-lg font-semibold mt-2">Page not found</p>
      <p className="text-sm text-ink-muted mt-1">There's nothing at <code className="text-ink">{location.pathname}</code>.</p>
      <Link to="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  );
}
