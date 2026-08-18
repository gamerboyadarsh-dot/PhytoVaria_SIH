import { NavLink } from "react-router-dom";
import clsx from "clsx";
import {
  LayoutDashboard,
  Sprout,
  UploadCloud,
  Dna,
  ShieldAlert,
  Thermometer,
  Lightbulb,
  FileText,
} from "lucide-react";
import PhytovariaLogo from "../ui/PhytovariaLogo.jsx";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/plants/register", label: "Register Plant", icon: Sprout },
  { to: "/plants/upload", label: "Genomic Upload", icon: UploadCloud },
  { to: "/plants/analysis", label: "Genomic Analysis", icon: Dna },
  { to: "/plants/risk", label: "Disease Risk", icon: ShieldAlert },
  { to: "/plants/environment", label: "Environmental Monitoring", icon: Thermometer },
  { to: "/plants/explainability", label: "Explainability", icon: Lightbulb },
  { to: "/plants/report", label: "Health Report", icon: FileText },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 glass-panel h-[calc(100vh-2rem)] sticky top-4 ml-4 z-20">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border/40">
        <PhytovariaLogo variant="full" iconClassName="text-primary text-xl" />
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-primary-light to-transparent text-primary-dark shadow-nav-active font-semibold"
                  : "text-ink-muted hover:bg-surface-alt hover:text-ink hover:translate-x-1"
              )
            }
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-border/40">
        <div className="text-[11px] leading-relaxed text-ink-muted selection:bg-accent-light">
          <p className="font-medium text-ink/70">Genomic Intelligence for Healthier Crops.</p>
          <p className="opacity-70 mt-0.5">v1.0.0 Production Build</p>
        </div>
      </div>
    </aside>
  );
}
