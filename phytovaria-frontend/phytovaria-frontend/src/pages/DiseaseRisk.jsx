import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, RefreshCcw, ChevronRight, Info } from "lucide-react";
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

/** Normalize API response (handles both old mock shape and new real API shape) */
function normalizeRisk(risk) {
  if (!risk) return null;

  // Support new API shape (real backend)
  const overallLabel =
    risk.overallLabel ||
    (risk.risk_level === "high"
      ? "High"
      : risk.risk_level === "moderate"
      ? "Medium"
      : risk.risk_level === "low"
      ? "Low"
      : "Unknown");

  const overallScore =
    risk.overallScore ?? (risk.risk_score != null ? risk.risk_score / 100 : null);

  const traitScores =
    risk.traitScores ||
    (risk.disease_scores || []).map((ds) => ({
      trait: ds.disease,
      score: ds.risk_score / 100,
      label:
        ds.risk_level === "high" ? "High" : ds.risk_level === "moderate" ? "Medium" : "Low",
      confidence: ds.confidence || "Low",
      mlPredicted: ds.ml_predicted_level,
      mlReasoning: ds.ml_reasoning,
      evidenceLevel: ds.evidence_level,
    }));

  return {
    overallLabel,
    overallScore,
    confidence: risk.confidence || "Moderate",
    method: risk.method || "rule_based",
    traitScores,
    contributing_factors: risk.contributing_factors || risk.contributingFactors || [],
  };
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
    api
      .getRiskAssessment(selectedPlantId)
      .then((r) => setRisk(normalizeRisk(r)))
      .catch((e) => setError(e.message));
  };

  useEffect(load, [selectedPlantId]); // eslint-disable-line react-hooks/exhaustive-deps

  const rerun = async () => {
    setRunning(true);
    try {
      const res = await api.runRiskAnalysis(selectedPlantId);
      // runRiskAnalysis returns the full analyze response — extract risk portion
      const riskPart = res?.risk || res;
      setRisk(normalizeRisk(riskPart));
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  };

  if (!selectedPlantId) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="No plant selected"
        description="Choose a plant from the top bar to view its disease risk assessment."
      />
    );
  }
  if (error) return <ErrorState description={error} onRetry={load} />;
  if (!risk) return <LoadingState label="Loading risk assessment" />;

  const isMLMethod = risk.method?.includes("ml");

  return (
    <div className="space-y-6">
      {/* Overall score banner */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-ink-muted">{selectedPlant?.name} — overall susceptibility score</p>
          <div className="mt-2 flex items-center gap-3">
            <RiskBadge label={risk.overallLabel} />
            <span className="text-sm text-ink-muted">
              Score {risk.overallScore != null ? `${(risk.overallScore * 100).toFixed(0)}/100` : "—"} · Confidence:{" "}
              {risk.confidence}
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Method:{" "}
            {isMLMethod
              ? "Rule-based + ML demonstration pipeline"
              : "Rule-based evidence scoring"}
          </p>
        </div>
        <Button variant="secondary" icon={RefreshCcw} loading={running} onClick={rerun}>
          Re-run analysis
        </Button>
      </Card>

      {/* Per-disease scores */}
      <Card padded={false}>
        <div className="p-6 pb-0">
          <CardHeader
            title="Per-disease susceptibility scores"
            subtitle="Evidence-weighted scoring — susceptibility indicators, not guaranteed disease probabilities"
          />
        </div>
        <div className="divide-y divide-border">
          {risk.traitScores.map((t) => (
            <div key={t.trait} className="px-6 py-4 space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate">{t.trait}</p>
                  <div className="h-1.5 w-full max-w-xs bg-surface-alt rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.round(t.score * 100)}%`,
                        backgroundColor:
                          t.label === "High"
                            ? "var(--color-danger, #dc2626)"
                            : t.label === "Medium"
                            ? "var(--color-warning, #d97706)"
                            : "var(--color-success, #16a34a)",
                      }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <RiskBadge label={t.label} size="sm" showIcon={false} />
                  <p className="text-xs text-ink-muted mt-1">Confidence: {t.confidence}</p>
                </div>
              </div>
              {/* ML signal */}
              {t.mlPredicted && (
                <p className="text-xs text-ink-muted pl-0.5">
                  ML signal:{" "}
                  <span className="font-medium">{t.mlPredicted}</span>
                  {t.mlReasoning && ` — ${t.mlReasoning}`}
                </p>
              )}
              {t.evidenceLevel && t.evidenceLevel !== "NO_EVIDENCE" && (
                <p className="text-xs text-ink-muted">Evidence: {t.evidenceLevel.replace(/_/g, " ")}</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* View Explainability CTA */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Info size={18} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-ink">Why these scores?</p>
              <p className="text-xs text-ink-muted mt-0.5">
                View the genomic evidence, environmental context, and ML reasoning behind each score.
              </p>
            </div>
          </div>
          <Button as={Link} to="/plants/explainability" variant="secondary" icon={ChevronRight} size="sm">
            Explain
          </Button>
        </div>
      </Card>

      <p className="text-xs text-ink-muted">
        Scores reflect susceptibility signal strength, not a guaranteed disease probability. Unknown variants are
        classified as Insufficient Evidence. ML models were trained on synthetic rule-derived labels — not
        independently field-validated.
      </p>
    </div>
  );
}
