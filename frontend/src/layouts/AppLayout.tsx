import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { SearchModal } from "@/components/SearchModal";

// Layout for the authenticated workspace: same navbar, no marketing footer, full-height canvas.
export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <SearchModal />
    </div>
  );
}
