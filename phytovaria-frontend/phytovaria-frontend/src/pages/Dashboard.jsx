import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sprout, Dna, ShieldAlert, Thermometer, ArrowRight, Plus } from "lucide-react";
import AppShell from "../components/layout/AppShell.jsx";
import Card, { CardHeader } from "../components/ui/Card.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import Button from "../components/ui/Button.jsx";
import RiskBadge from "../components/ui/RiskBadge.jsx";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/States.jsx";
import { usePlantContext } from "../context/PlantContext.jsx";
import { useApi } from "../api/useApi.js";

const statusLabel = {
  registered: "Registered",
  vcf_uploaded: "VCF Uploaded",
  analyzed: "Analyzed",
};

export default function Dashboard() {
  return (
    <AppShell title="Dashboard">
      <DashboardBody />
    </AppShell>
  );
}

function DashboardBody() {
  const { plants, loading, refreshPlants } = usePlantContext();
  const api = useApi();
  const [risk, setRisk] = useState(null);
  const [riskError, setRiskError] = useState(null);

  const analyzedPlant = plants.find((p) => p.status === "analyzed");

  useEffect(() => {
    if (!analyzedPlant) return;
    setRiskError(null);
    api
      .getRiskAssessment(analyzedPlant.id)
      .then(setRisk)
      .catch((e) => setRiskError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyzedPlant?.id]);

  if (loading) return <LoadingState label="Loading your plants" />;

  if (!plants.length) {
    return (
      <EmptyState
        icon={Sprout}
        title="No plants registered yet"
        description="Register your first tomato plant to start the genomic assessment workflow."
        action={
          <Button as={Link} to="/plants/register" icon={Plus}>
            Register a plant
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Registered plants" value={plants.length} icon={Sprout} />
        <StatCard
          label="Genomes analyzed"
          value={plants.filter((p) => p.status === "analyzed").length}
          icon={Dna}
          tone="accent"
        />
        <StatCard
          label="Current risk level"
          value={risk?.overallLabel ?? "—"}
          icon={ShieldAlert}
        />
        <StatCard label="Sensor source" value="Demo" icon={Thermometer} tone="accent" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" padded={false}>
          <div className="p-6 pb-0">
            <CardHeader
              title="Registered plants"
              subtitle="Tap a plant to continue its genomic workflow"
              action={
                <Button as={Link} to="/plants/register" size="sm" variant="secondary" icon={Plus}>
                  Register
                </Button>
              }
            />
          </div>
          <div className="divide-y divide-border">
            {plants.map((plant) => (
              <Link
                key={plant.id}
                to={`/plants/${plant.id}/profile`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-surface-alt/60 transition-colors"
              >
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: plant.thumbnailColor }}
                >
                  <Sprout size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink truncate">{plant.name}</p>
                  <p className="text-xs text-ink-muted">
                    {plant.species} · {plant.location}
                  </p>
                </div>
                <span className="text-xs font-medium text-ink-muted bg-surface-alt rounded-full px-2.5 py-1">
                  {statusLabel[plant.status]}
                </span>
                <ArrowRight size={16} className="text-ink-muted shrink-0" />
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Latest susceptibility snapshot" subtitle={analyzedPlant?.name} />
          {!analyzedPlant && (
            <p className="text-sm text-ink-muted">
              No plant has completed genomic analysis yet — upload a VCF file to generate one.
            </p>
          )}
          {analyzedPlant && riskError && <ErrorState description={riskError} />}
          {analyzedPlant && !risk && !riskError && <LoadingState label="Loading risk assessment" />}
          {risk && (
            <div className="space-y-4">
              <RiskBadge label={risk.overallLabel} />
              <div className="space-y-2.5">
                {risk.traitScores.map((t) => (
                  <div key={t.trait} className="flex items-center justify-between text-sm">
                    <span className="text-ink-muted truncate pr-3">{t.trait}</span>
                    <RiskBadge label={t.label} size="sm" showIcon={false} />
                  </div>
                ))}
              </div>
              <Button as={Link} to="/plants/risk" size="sm" variant="secondary" className="w-full">
                View full risk breakdown
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
