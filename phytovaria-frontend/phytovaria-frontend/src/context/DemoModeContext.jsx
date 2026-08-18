import { createContext, useContext, useMemo, useState } from "react";

const DemoModeContext = createContext(null);

/**
 * Demo Mode drives two things at once:
 *  1. Whether the API client (src/api/client.js) reads from mockData.js
 *     instead of calling the FastAPI backend.
 *  2. Whether the Environmental Monitoring screen shows simulated
 *     ESP32 sensor readings instead of live ones — this is the
 *     "Demo Sensor Mode" required so the project still works on stage
 *     if the ESP32 is disconnected.
 *
 * Default comes from VITE_DEMO_MODE so the team can flip one env var
 * for the final demo once the real backend/hardware are wired up.
 */
export function DemoModeProvider({ children }) {
  const [demoMode, setDemoMode] = useState(
    import.meta.env.VITE_DEMO_MODE === "true"
  );

  const value = useMemo(
    () => ({ demoMode, setDemoMode, toggleDemoMode: () => setDemoMode((d) => !d) }),
    [demoMode]
  );

  return <DemoModeContext.Provider value={value}>{children}</DemoModeContext.Provider>;
}

export function useDemoMode() {
  const ctx = useContext(DemoModeContext);
  if (!ctx) throw new Error("useDemoMode must be used within DemoModeProvider");
  return ctx;
}
