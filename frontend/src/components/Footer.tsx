import { Link } from "react-router-dom";
import { FOOTER_LINKS } from "@/config/nav.config";

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-secondary mt-24">
      <div className="max-w-[1440px] mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#B03A2E" />
              <path d="M9 8H23V11.2H12.2V14.4H19V17.6H12.2V24H9V8Z" fill="#FFFFFF" />
            </svg>
            <span className="font-extrabold text-lg">Forge</span>
          </div>
          <p className="text-sm text-ink-muted">Create without limits. AI image and video creation platform.</p>
        </div>
        {Object.entries(FOOTER_LINKS).map(([col, links]) => (
          <div key={col}>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-3">{col}</p>
            <ul className="space-y-2">
              {links.map((l) => (
                <li key={l.label}>
                  <Link to={l.href} className="text-sm text-ink-muted hover:text-ink transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-[1440px] mx-auto px-6 py-6 border-t border-border text-xs text-ink-muted flex flex-col sm:flex-row justify-between gap-2">
        <span>© {new Date().getFullYear()} Forge. Built as a college assignment — an independent AI creative platform.</span>
        <span>Built as a college project.</span>
      </div>
    </footer>
  );
}
