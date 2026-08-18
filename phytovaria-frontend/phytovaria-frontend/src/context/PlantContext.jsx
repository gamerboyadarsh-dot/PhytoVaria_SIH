import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useApi } from "../api/useApi.js";

const PlantContext = createContext(null);

/**
 * Tracks which registered plant is "active" for the Genomic Upload,
 * Analysis, Disease Risk, Environmental Monitoring, Explainability and
 * Report screens, so a plant picked in the Topbar or Dashboard carries
 * across the rest of the workflow without re-selecting it each time.
 */
export function PlantProvider({ children }) {
  const api = useApi();
  const [plants, setPlants] = useState([]);
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshPlants = async () => {
    setLoading(true);
    try {
      const data = await api.listPlants();
      setPlants(data);
      setSelectedPlantId((current) => current ?? data[0]?.id ?? null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshPlants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedPlant = plants.find((p) => p.id === selectedPlantId) || null;

  const value = useMemo(
    () => ({ plants, selectedPlantId, setSelectedPlantId, selectedPlant, loading, refreshPlants }),
    [plants, selectedPlantId, selectedPlant, loading]
  );

  return <PlantContext.Provider value={value}>{children}</PlantContext.Provider>;
}

export function usePlantContext() {
  const ctx = useContext(PlantContext);
  if (!ctx) throw new Error("usePlantContext must be used within PlantProvider");
  return ctx;
}
