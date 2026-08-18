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
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-border bg-surface h-screen sticky top-0">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border">
        <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
          <Dna size={17} className="text-white" strokeWidth={2.25} />
        </div>
        <span className="font-display font-semibold text-ink tracking-tight">PhytoVaria</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-light text-primary-dark"
                  : "text-ink-muted hover:bg-surface-alt hover:text-ink"
              )
            }
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-border">
        <p className="text-[11px] leading-relaxed text-ink-muted">
          Genomic Intelligence for Healthier Crops. Prototype build — Product Preview.
        </p>
      </div>
    </aside>
  );
}
