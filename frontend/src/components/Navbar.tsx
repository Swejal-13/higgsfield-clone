import { useState, useRef, useEffect } from "react";
import { Link, NavLink as RouterNavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search, Menu, X, LogOut, Settings, LayoutDashboard, FolderKanban, History as HistoryIcon, Image as ImageIcon } from "lucide-react";
import { PRIMARY_NAV, SECONDARY_NAV, IMAGE_DROPDOWN_FEATURES, VIDEO_DROPDOWN_FEATURES } from "@/config/nav.config";
import { NavMegaDropdown } from "./NavMegaDropdown";
import { CreditBadge } from "./CreditBadge";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { Badge } from "./Badge";
import { useAuth } from "@/contexts/AuthContext";

const LOGO = (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#DFFF00" />
    <path d="M9 22V10h3.2v4.8h7.6V10H23v12h-3.2v-4.8h-7.6V22H9z" fill="#090A0B" />
  </svg>
);

export function Navbar() {
  const [openDropdown, setOpenDropdown] = useState<"image" | "video" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function openMenu(key: "image" | "video") {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenDropdown(key);
  }
  function scheduleClose() {
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 150);
  }

  return (
    <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur-md border-b border-border">
      <div className="w-full mx-auto px-1 lg:px-1">
        <div className="flex items-center h-16 gap-0.5">
          <Link to="/" className="flex items-center gap-2 shrink-0 mr-2" aria-label="Higgsfield home">
            {LOGO}
            <span className="font-extrabold text-[17px] tracking-tight hidden sm:inline">Higgsfield</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5" onMouseLeave={scheduleClose}>
            {PRIMARY_NAV.map((item) =>
              item.dropdown ? (
                <div key={item.label} className="relative" onMouseEnter={() => openMenu(item.dropdown!)}>
                  <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-ink-muted hover:text-ink hover:bg-panel-secondary transition-colors">
                    {item.label}
                    <ChevronDown size={13} className={`transition-transform ${openDropdown === item.dropdown ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {openDropdown === item.dropdown && (
                      <NavMegaDropdown
                        features={item.dropdown === "image" ? IMAGE_DROPDOWN_FEATURES : VIDEO_DROPDOWN_FEATURES}
                        modelType={item.dropdown}
                        onNavigate={() => setOpenDropdown(null)}
                      />
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <RouterNavLink
                  key={item.label}
                  to={item.href!}
                  className={({ isActive }) =>
                    `flex items-center gap-0.5 px-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? "text-ink bg-panel-secondary" : "text-ink-muted hover:text-ink hover:bg-panel-secondary"
                    }`
                  }
                >
                  {item.label}
                  {item.badge && <Badge type={item.badge} />}
                </RouterNavLink>
              )
            )}
            <span className="w-px h-5 bg-border mx-1" />
            {SECONDARY_NAV.map((item) => (
              <RouterNavLink
                key={item.label}
                to={item.href!}
                className={({ isActive }) =>
                  `hidden xl:flex items-center gap-0.5 px-1 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive ? "text-ink bg-panel-secondary" : "text-ink-muted hover:text-ink hover:bg-panel-secondary"
                  }`
                }
              >
                {item.label}
                {item.badge && <Badge type={item.badge} />}
              </RouterNavLink>
            ))}
          </nav>

          <div className="flex-1" />

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
              className="flex items-center gap-2 text-ink-muted hover:text-ink px-3 py-1.5 rounded-full border border-border hover:border-accent/30 transition-colors text-sm"
            >
              <Search size={14} />
              <span className="text-xs">⌘K</span>
            </button>
            <RouterNavLink to="/pricing" className="text-sm font-medium text-ink-muted hover:text-ink px-2 py-1.5">
              Pricing
            </RouterNavLink>
            {user && (
              <RouterNavLink to="/assets" className="text-sm font-medium text-ink-muted hover:text-ink px-2 py-1.5">
                Assets
              </RouterNavLink>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <CreditBadge credits={user.credits} />
              <NotificationsDropdown />
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  className="w-9 h-9 rounded-full bg-accent text-black font-bold text-sm flex items-center justify-center"
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-panel border border-border rounded-2xl shadow-2xl overflow-hidden py-1.5"
                    >
                      <div className="px-4 py-2 border-b border-border mb-1">
                        <p className="text-sm font-semibold truncate">{user.name}</p>
                        <p className="text-xs text-ink-muted truncate">{user.email}</p>
                      </div>
                      <ProfileLink icon={<LayoutDashboard size={15} />} label="Dashboard" to="/app" onClick={() => setProfileOpen(false)} />
                      <ProfileLink icon={<ImageIcon size={15} />} label="Assets" to="/assets" onClick={() => setProfileOpen(false)} />
                      <ProfileLink icon={<HistoryIcon size={15} />} label="History" to="/history" onClick={() => setProfileOpen(false)} />
                      <ProfileLink icon={<FolderKanban size={15} />} label="Projects" to="/projects" onClick={() => setProfileOpen(false)} />
                      <ProfileLink icon={<Settings size={15} />} label="Settings" to="/settings" onClick={() => setProfileOpen(false)} />
                      <button
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                          navigate("/");
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-panel-secondary transition-colors"
                      >
                        <LogOut size={15} /> Log out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link to="/login" className="btn-secondary !py-2 !px-4 text-sm">Log in</Link>
              <Link to="/signup" className="btn-primary !py-2 !px-4 text-sm">Sign up</Link>
            </div>
          )}

          <button className="lg:hidden ml-2 p-2 text-ink-muted" onClick={() => setMobileOpen((o) => !o)} aria-label="Menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden border-t border-border overflow-hidden"
          >
            <div className="px-4 py-3 flex flex-col gap-1 max-h-[70vh] overflow-y-auto">
              {[...PRIMARY_NAV, ...SECONDARY_NAV].map((item) => (
                <Link
                  key={item.label}
                  to={item.href || (item.dropdown === "image" ? "/image" : "/video")}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-ink hover:bg-panel-secondary"
                >
                  {item.label}
                  {item.badge && <Badge type={item.badge} />}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function ProfileLink({ icon, label, to, onClick }: { icon: React.ReactNode; label: string; to: string; onClick: () => void }) {
  return (
    <Link to={to} onClick={onClick} className="flex items-center gap-2 px-4 py-2 text-sm text-ink hover:bg-panel-secondary transition-colors">
      {icon} {label}
    </Link>
  );
}
