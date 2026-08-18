import { useEffect, useState } from "react";
import { Lightbulb, Dna, Thermometer } from "lucide-react";
import AppShell from "../components/layout/AppShell.jsx";
import Card, { CardHeader } from "../components/ui/Card.jsx";
import RiskBadge from "../components/ui/RiskBadge.jsx";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/States.jsx";
import { usePlantContext } from "../context/PlantContext.jsx";
import { useApi } from "../api/useApi.js";

export default function Explainability() {
  return (
    <AppShell title="Explainability">
      <ExplainabilityBody />
    </AppShell>
  );
}

function ExplainabilityBody() {
  const { selectedPlant, selectedPlantId } = usePlantContext();
  const api = useApi();
  const [risk, setRisk] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedPlantId) return;
    setError(null);
    api.getRiskAssessment(selectedPlantId).then(setRisk).catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlantId]);

  if (!selectedPlantId) {
    return <EmptyState icon={Lightbulb} title="No plant selected" description="Choose a plant from the top bar." />;
  }
  if (error) return <ErrorState description={error} />;
  if (!risk) return <LoadingState label="Building explanation" />;

  const maxWeight = Math.max(...risk.contributingFactors.map((f) => f.weight));

  return (
    <div className="space-y-6">
      <Card className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-ink-muted">Why {selectedPlant?.name} scored</p>
          <div className="mt-2"><RiskBadge label={risk.overallLabel} /></div>
        </div>
        <p className="text-xs text-ink-muted max-w-sm text-right">
          Every contributing factor below is traceable to a genomic match or an environmental reading —
          nothing here is an unexplained model output.
        </p>
      </Card>

      <Card>
        <CardHeader title="Contributing factors" subtitle="Ranked by relative weight in the overall score" />
        <div className="space-y-4">
          {risk.contributingFactors.map((f) => (
            <div key={f.label} className="flex items-center gap-4">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                f.type === "genomic" ? "bg-accent-light text-accent" : "bg-primary-light text-primary-dark"
              }`}>
                {f.type === "genomic" ? <Dna size={16} /> : <Thermometer size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink truncate">{f.label}</p>
                <div className="h-1.5 bg-surface-alt rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={f.type === "genomic" ? "h-full bg-accent rounded-full" : "h-full bg-primary rounded-full"}
                    style={{ width: `${Math.round((f.weight / maxWeight) * 100)}%` }}
                  />
                </div>
              </div>
              <span className="text-xs font-mono text-ink-muted shrink-0">{(f.weight * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="How to read this" />
        <ul className="text-sm text-ink-muted space-y-2 list-disc pl-5">
          <li>Genomic factors come from variants matched against the curated knowledge base.</li>
          <li>Environmental factors come from live ESP32 readings or Demo Sensor Mode.</li>
          <li>
            Variants with no curated match are labeled <RiskBadge label="Unknown" size="sm" showIcon={false} /> and
            are never treated as harmful by default.
          </li>
        </ul>
      </Card>
    </div>
  );
}
