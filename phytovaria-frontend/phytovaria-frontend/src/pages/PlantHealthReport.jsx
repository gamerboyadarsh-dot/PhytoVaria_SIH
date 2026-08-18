import { useEffect, useState } from "react";
import { FileText, Printer } from "lucide-react";
import AppShell from "../components/layout/AppShell.jsx";
import Card, { CardHeader } from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import RiskBadge from "../components/ui/RiskBadge.jsx";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/States.jsx";
import { usePlantContext } from "../context/PlantContext.jsx";
import { useApi } from "../api/useApi.js";

export default function PlantHealthReport() {
  return (
    <AppShell title="Plant Health Report">
      <ReportBody />
    </AppShell>
  );
}

function ReportBody() {
  const { selectedPlant, selectedPlantId } = usePlantContext();
  const api = useApi();
  const [report, setReport] = useState(null);
  const [risk, setRisk] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedPlantId) return;
    setError(null);
    Promise.all([api.getReport(selectedPlantId), api.getRiskAssessment(selectedPlantId)])
      .then(([r, k]) => { setReport(r); setRisk(k); })
      .catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlantId]);

  if (!selectedPlantId) {
    return <EmptyState icon={FileText} title="No plant selected" description="Choose a plant from the top bar." />;
  }
  if (error) return <ErrorState description={error} />;
  if (!report || !risk) return <LoadingState label="Compiling report" />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">{selectedPlant?.name}</h2>
          <p className="text-sm text-ink-muted">Generated {new Date(report.generatedAt).toLocaleString()}</p>
        </div>
        <Button variant="secondary" icon={Printer} onClick={() => window.print()}>
          Print / Save PDF
        </Button>
      </div>

      <Card>
        <CardHeader title="Summary" />
        <p className="text-sm text-ink-muted leading-relaxed">{report.summary}</p>
      </Card>

      <Card className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-ink-muted">Overall susceptibility</p>
          <div className="mt-2"><RiskBadge label={risk.overallLabel} /></div>
        </div>
        <p className="text-xs text-ink-muted">Confidence: {risk.confidence} · Method: {risk.method === "ml_demo" ? "Demo ML pipeline" : "Rule-based"}</p>
      </Card>

      <Card padded={false}>
        <div className="p-6 pb-0">
          <CardHeader title="Trait-level scores" />
        </div>
        <div className="divide-y divide-border">
          {risk.traitScores.map((t) => (
            <div key={t.trait} className="flex items-center justify-between px-6 py-3.5 text-sm">
              <span className="text-ink">{t.trait}</span>
              <RiskBadge label={t.label} size="sm" showIcon={false} />
            </div>
          ))}
        </div>
      </Card>

      <p className="text-xs text-ink-muted text-center">
        This report is a hackathon prototype output. It is not a validated agronomic or diagnostic recommendation.
      </p>
    </div>
  );
}
