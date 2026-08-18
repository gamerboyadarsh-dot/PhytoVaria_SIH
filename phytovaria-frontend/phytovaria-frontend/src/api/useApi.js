import { useMemo } from "react";
import { useDemoMode } from "../context/DemoModeContext.jsx";
import * as endpoints from "./endpoints.js";

/**
 * Returns the endpoint functions pre-bound to the current Demo Mode,
 * so components call e.g. `api.listPlants()` without threading the flag
 * through every call site.
 */
export function useApi() {
  const { demoMode } = useDemoMode();

  return useMemo(() => {
    const bound = {};
    for (const [name, fn] of Object.entries(endpoints)) {
      bound[name] = (...args) => fn(demoMode, ...args);
    }
    return bound;
  }, [demoMode]);
}
