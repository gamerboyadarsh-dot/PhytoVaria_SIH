import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

// Note: PlantProvider lives in App.jsx, above the router — not here.
// If it lived inside AppShell, navigating between pages would remount it
// and silently reset which plant is selected.
export default function AppShell({ title, children }) {
  return (
    <div className="flex min-h-screen relative overflow-hidden bg-bg">
      {/* Ambient background layers for Liquid Glass refraction */}
      <div className="fixed inset-0 pointer-events-none -z-10 opacity-40 dark:opacity-20 will-change-transform">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/30 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-accent/20 blur-[140px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-risk-low/20 blur-[100px]" />
      </div>

      <Sidebar />
      <div className="flex-1 min-w-0 z-0">
        <Topbar title={title} />
        <main className="px-4 md:px-8 py-6 md:py-8 max-w-[1400px] mx-auto relative z-10">{children}</main>
      </div>
    </div>
  );
}
