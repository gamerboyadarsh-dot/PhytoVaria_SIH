import { FlaskConical, ChevronDown, LogOut, Sun, Moon } from "lucide-react";
import { useDemoMode } from "../../context/DemoModeContext.jsx";
import { usePlantContext } from "../../context/PlantContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

export default function Topbar({ title }) {
  const { demoMode, toggleDemoMode } = useDemoMode();
  const { plants, selectedPlantId, setSelectedPlantId } = usePlantContext();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-4 md:px-8 gap-4 shadow-[0_1px_3px_rgba(20,33,27,0.03)]">
      <div className="min-w-0">
        <h1 className="font-display font-semibold text-ink text-lg truncate animate-fade-in-up">{title}</h1>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {plants.length > 0 && (
          <div className="relative hidden sm:block">
            <select
              value={selectedPlantId || ""}
              onChange={(e) => setSelectedPlantId(e.target.value)}
              className="appearance-none text-sm bg-surface-alt hover:bg-surface border border-border hover:border-accent/40 transition-colors rounded-lg pl-3 pr-8 py-2 text-ink font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-sm cursor-pointer"
            >
              {plants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          </div>
        )}

        <button
          onClick={toggleDemoMode}
          title="Toggle Demo Mode (uses mock data + simulated sensor readings)"
          className={`flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 border transition-colors ${
            demoMode
              ? "bg-accent-light text-accent border-accent/20"
              : "bg-surface text-ink-muted border-border"
          }`}
        >
          <FlaskConical size={13} />
          {demoMode ? "Demo Mode" : "Live"}
        </button>

        <button
          onClick={toggleTheme}
          title="Toggle light/dark theme"
          className="p-1.5 rounded-full text-ink-muted hover:bg-surface-alt transition-colors"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user && (
          <button
            onClick={logout}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-surface-alt transition-colors"
            title="Sign out"
          >
            <span className="h-8 w-8 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center">
              {user.name?.[0]?.toUpperCase() || "U"}
            </span>
            <LogOut size={14} className="text-ink-muted" />
          </button>
        )}
      </div>
    </header>
  );
}
