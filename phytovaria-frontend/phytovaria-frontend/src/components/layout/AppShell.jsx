import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

// Note: PlantProvider lives in App.jsx, above the router — not here.
// If it lived inside AppShell, navigating between pages would remount it
// and silently reset which plant is selected.
export default function AppShell({ title, children }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar title={title} />
        <main className="px-4 md:px-8 py-6 md:py-8 max-w-[1400px] mx-auto">{children}</main>
      </div>
    </div>
  );
}
