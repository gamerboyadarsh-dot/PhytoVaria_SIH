import { useEffect, useState } from "react";
import { ShieldAlert, RefreshCcw } from "lucide-react";
import AppShell from "../components/layout/AppShell.jsx";
import Card, { CardHeader } from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import RiskBadge from "../components/ui/RiskBadge.jsx";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/States.jsx";
import { usePlantContext } from "../context/PlantContext.jsx";
import { useApi } from "../api/useApi.js";

export default function DiseaseRisk() {
  return (
    <AppShell title="Disease Risk">
      <RiskBody />
    </AppShell>
  );
}

function RiskBody() {
  const { selectedPlant, selectedPlantId } = usePlantContext();
  const api = useApi();
  const [risk, setRisk] = useState(null);
  const [error, setError] = useState(null);
  const [running, setRunning] = useState(false);

  const load = () => {
    if (!selectedPlantId) return;
    setError(null);
    api.getRiskAssessment(selectedPlantId).then(setRisk).catch((e) => setError(e.message));
  };

  useEffect(load, [selectedPlantId]); // eslint-disable-line react-hooks/exhaustive-deps

  const rerun = async () => {
    setRunning(true);
    try {
      const res = await api.runRiskAnalysis(selectedPlantId);
      setRisk(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  };

  if (!selectedPlantId) {
    return <EmptyState icon={ShieldAlert} title="No plant selected" description="Choose a plant from the top bar." />;
  }
  if (error) return <ErrorState description={error} onRetry={load} />;
  if (!risk) return <LoadingState label="Loading risk assessment" />;

  return (
    <div className="space-y-6">
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-ink-muted">{selectedPlant?.name} — overall susceptibility</p>
          <div className="mt-2 flex items-center gap-3">
            <RiskBadge label={risk.overallLabel} />
            <span className="text-sm text-ink-muted">
              Score {risk.overallScore.toFixed(2)} · Confidence: {risk.confidence}
            </span>
          </div>
        </div>
        <Button variant="secondary" icon={RefreshCcw} loading={running} onClick={rerun}>
          Re-run analysis
        </Button>
      </Card>

      <Card padded={false}>
        <div className="p-6 pb-0">
          <CardHeader title="Per-trait susceptibility" subtitle="Rule-based / evidence-weighted scoring — not a diagnosis" />
        </div>
        <div className="divide-y divide-border">
          {risk.traitScores.map((t) => (
            <div key={t.trait} className="flex items-center justify-between gap-4 px-6 py-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">{t.trait}</p>
                <div className="h-1.5 w-48 max-w-full bg-surface-alt rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.round(t.score * 100)}%` }}
                  />
                </div>
              </div>
              <div className="text-right shrink-0">
                <RiskBadge label={t.label} size="sm" showIcon={false} />
                <p className="text-xs text-ink-muted mt-1">Confidence: {t.confidence}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <p className="text-xs text-ink-muted">
        Method: {risk.method === "ml_demo" ? "Demonstration ML pipeline (synthetic/rule-derived training data)" : "Rule-based evidence scoring"}.
        Scores reflect susceptibility signal strength, not a guaranteed disease probability.
      </p>
    </div>
  );
}
