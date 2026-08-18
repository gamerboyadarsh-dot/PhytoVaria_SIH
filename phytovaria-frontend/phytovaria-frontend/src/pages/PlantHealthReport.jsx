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

function normalizeRisk(risk) {
  if (!risk) return null;
  const overallLabel =
    risk.overallLabel ||
    (risk.risk_level === "high" ? "High" : risk.risk_level === "moderate" ? "Medium" : "Low");
  const traitScores =
    risk.traitScores ||
    (risk.disease_scores || []).map((ds) => ({
      trait: ds.disease,
      score: ds.risk_score / 100,
      label: ds.risk_level === "high" ? "High" : ds.risk_level === "moderate" ? "Medium" : "Low",
      confidence: ds.confidence || "Low",
    }));

  return {
    ...risk,
    overallLabel,
    traitScores,
    confidence: risk.confidence || "Moderate",
    method: risk.method || "rule_based",
  };
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
      .then(([r, k]) => { setReport(r); setRisk(normalizeRisk(k)); })
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
          <p className="text-sm text-ink-muted">Generated {new Date(report.generated_at || report.generatedAt).toLocaleString()}</p>
        </div>
        <Button variant="secondary" icon={Printer} onClick={() => window.print()}>
          Print / Save PDF
        </Button>
      </div>

      <Card glass={false}>
        <CardHeader title="Methodology & Summary" />
        <p className="text-sm text-ink-muted leading-relaxed mb-4">{report.methodology || report.summary || "End-to-end genomic and environmental assessment."}</p>
        
        {report.variant_summary && (
          <div className="bg-surface-alt rounded-lg p-4 grid grid-cols-3 gap-4 text-center mt-2">
            <div>
               <p className="text-xl font-bold text-ink">{report.variant_summary.total}</p>
               <p className="text-xs text-ink-muted">Total variants</p>
            </div>
            <div>
               <p className="text-xl font-bold text-ink">{report.variant_summary.exact_matches}</p>
               <p className="text-xs text-ink-muted">KB matches</p>
            </div>
            <div>
               <p className="text-xl font-bold text-ink">{report.variant_summary.unknown}</p>
               <p className="text-xs text-ink-muted">Insufficient evidence</p>
            </div>
          </div>
        )}
      </Card>

      <Card glass={false} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-ink-muted">Overall susceptibility</p>
          <div className="mt-2"><RiskBadge label={risk.overallLabel} /></div>
        </div>
        <p className="text-xs text-ink-muted text-right">Confidence: {risk.confidence} <br/> Method: {risk.method === "ml_demo" ? "Demo ML pipeline" : risk.method?.includes("ml") ? "Rule-based + ML" : "Rule-based"}</p>
      </Card>

      <Card padded={false} glass={false}>
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
        This report is generated for research purposes. It is not a validated agronomic or diagnostic recommendation.
      </p>
    </div>
  );
}
