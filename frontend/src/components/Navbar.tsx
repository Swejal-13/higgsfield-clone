import { Link, NavLink as RouterNavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const LOGO = (
  <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#B03A2E" />
    <path d="M9 8H23V11.2H12.2V14.4H19V17.6H12.2V24H9V8Z" fill="#FFFFFF" />
  </svg>
);

// Public marketing nav: kept intentionally minimal. There is no mega-menu
// enumerating every model or mode here — that clutter lives, if anywhere,
// inside the authenticated workspace where it's contextual. A first-time
// visitor only needs three decisions: see examples, see pricing, sign in.
export function Navbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur-md border-b border-border">
      <div className="max-w-[1200px] mx-auto px-4 lg:px-6">
        <div className="flex items-center h-16 gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="Forge home">
            {LOGO}
            <span className="font-display font-semibold text-lg tracking-tight">Forge</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1 ml-2">
            <RouterNavLink
              to="/pricing"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "text-ink bg-panel-secondary" : "text-ink-muted hover:text-ink hover:bg-panel-secondary"
                }`
              }
            >
              Pricing
            </RouterNavLink>
          </nav>

          <div className="flex-1" />

          {user ? (
            <Link to="/app" className="btn-primary !py-2 !px-4 text-sm">
              Go to workspace
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm font-medium text-ink-muted hover:text-ink px-3 py-1.5">
                Log in
              </Link>
              <Link to="/signup" className="btn-primary !py-2 !px-4 text-sm">
                Sign up free
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
