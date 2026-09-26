// Feature-enumeration nav config (mega-dropdown arrays, secondary nav) was
// removed along with the mega-dropdown nav itself — see Navbar.tsx and
// layouts/Workspace.tsx. Only footer links remain here.
// NavFeature is kept only so the now-unused NavMegaDropdown.tsx (left on
// disk, no longer routed to) still type-checks as part of the project.
export interface NavFeature {
  label: string;
  description: string;
  href: string;
  badge?: "TOP" | "NEW" | "FREE";
}
export const FOOTER_LINKS = {
  Product: [
    { label: "Create", href: "/create" },
    { label: "Pricing", href: "/pricing" },
  ],
  Company: [
    { label: "Log in", href: "/login" },
    { label: "Sign up", href: "/signup" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};
