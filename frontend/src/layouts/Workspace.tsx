import { useState, useRef, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation, NavLink as RouterNavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Wand2, FolderKanban, Library as LibraryIcon, Settings as SettingsIcon, Search, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { CreditBadge } from "@/components/CreditBadge";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { SearchModal } from "@/components/SearchModal";

const RAIL_ITEMS = [
  { to: "/create", label: "Create", icon: Wand2 },
  { to: "/library", label: "Library", icon: LibraryIcon },
  { to: "/projects", label: "Projects", icon: FolderKanban },
];

const PAGE_TITLES: Record<string, string> = {
  "/app": "Workspace",
  "/create": "Create",
  "/library": "Library",
  "/projects": "Projects",
  "/settings": "Settings",
};

function currentTitle(pathname: string) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/projects/")) return "Project";
  return "Forge";
}

// Authenticated workspace shell: a slim left icon rail carries the primary
// intent-based navigation (Create / Library / Projects), while a thin top
// bar carries page context, search and account actions. This intentionally
// replaces a single crowded top nav with a structure that scales better as
// the number of tools/models grows, without exposing every feature at once.
export function Workspace() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="min-h-screen flex bg-bg">
      <aside className="w-[76px] shrink-0 border-r border-border bg-panel flex flex-col items-center py-4 gap-1">
        <Link to="/app" className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4" aria-label="Forge home">
          <svg width="18" height="18" viewBox="0 0 32 32"><path d="M9 8H23V11.2H12.2V14.4H19V17.6H12.2V24H9V8Z" fill="#FFFFFF" /></svg>
        </Link>

        {RAIL_ITEMS.map((item) => (
          <RouterNavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive ? "bg-accent/10 text-accent" : "text-ink-muted hover:text-ink hover:bg-panel-secondary"
              }`
            }
          >
            <item.icon size={18} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </RouterNavLink>
        ))}

        <div className="flex-1" />

        <RouterNavLink
          to="/settings"
          className={({ isActive }) =>
            `w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-colors mb-2 ${
              isActive ? "bg-accent/10 text-accent" : "text-ink-muted hover:text-ink hover:bg-panel-secondary"
            }`
          }
        >
          <SettingsIcon size={18} />
          <span className="text-[10px] font-medium">Settings</span>
        </RouterNavLink>

        {user && (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((o) => !o)}
              className="w-10 h-10 rounded-lg bg-panel-secondary border border-border text-ink font-semibold text-sm flex items-center justify-center"
            >
              {user.name.charAt(0).toUpperCase()}
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-full bottom-0 ml-2 w-56 bg-panel border border-border rounded-lg shadow-lifted overflow-hidden py-1.5 z-50"
                >
                  <div className="px-4 py-2 border-b border-border mb-1">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-xs text-ink-muted truncate">{user.email}</p>
                  </div>
                  {user.role === "admin" && (
                    <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-ink hover:bg-panel-secondary transition-colors">
                      <ShieldCheck size={15} /> Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setProfileOpen(false);
                      navigate("/");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-accent hover:bg-panel-secondary transition-colors"
                  >
                    <LogOut size={15} /> Log out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 shrink-0 border-b border-border bg-panel flex items-center px-5 gap-3">
          <h1 className="font-display text-base font-semibold truncate">{currentTitle(location.pathname)}</h1>
          <div className="flex-1" />
          <button
            onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
            className="hidden sm:flex items-center gap-2 text-ink-muted hover:text-ink px-3 py-1.5 rounded-lg border border-border hover:border-accent/40 transition-colors text-sm"
          >
            <Search size={14} />
            <span className="text-xs">⌘K</span>
          </button>
          {user && <CreditBadge credits={user.credits} />}
          <NotificationsDropdown />
        </header>

        <main className="flex-1 flex flex-col overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <SearchModal />
    </div>
  );
}
