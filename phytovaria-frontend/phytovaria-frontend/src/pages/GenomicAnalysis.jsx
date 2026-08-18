import { useEffect, useState } from "react";
import { Dna } from "lucide-react";
import AppShell from "../components/layout/AppShell.jsx";
import Card, { CardHeader } from "../components/ui/Card.jsx";
import DataTable from "../components/ui/DataTable.jsx";
import GenomicTrack from "../components/ui/GenomicTrack.jsx";
import RiskBadge from "../components/ui/RiskBadge.jsx";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/States.jsx";
import { usePlantContext } from "../context/PlantContext.jsx";
import { useApi } from "../api/useApi.js";

const evidenceTone = { curated: "Low", limited: "Medium", unknown: "Unknown" };

export default function GenomicAnalysis() {
  return (
    <AppShell title="Genomic Analysis">
      <AnalysisBody />
    </AppShell>
  );
}

function AnalysisBody() {
  const { selectedPlant, selectedPlantId } = usePlantContext();
  const api = useApi();
  const [variants, setVariants] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedPlantId) return;
    setVariants(null);
    setError(null);
    api
      .listVariants(selectedPlantId)
      .then(setVariants)
      .catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlantId]);

  if (!selectedPlantId) {
    return <EmptyState icon={Dna} title="No plant selected" description="Choose a plant from the top bar." />;
  }
  if (error) return <ErrorState description={error} />;
  if (!variants) return <LoadingState label="Parsing variant calls" />;
  if (!variants.length) {
    return (
      <EmptyState
        icon={Dna}
        title="No variants found"
        description={`${selectedPlant?.name ?? "This plant"} doesn't have genomic data uploaded yet.`}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Variant track"
          subtitle={`${variants.length} variant call(s) — ${selectedPlant?.name}`}
        />
        <GenomicTrack variants={variants} />
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-ink-muted">
          <LegendDot color="var(--color-base-a)" label="A" />
          <LegendDot color="var(--color-base-t)" label="T" />
          <LegendDot color="var(--color-base-c)" label="C" />
          <LegendDot color="var(--color-base-g)" label="G" />
          <span className="ml-auto">Faded / dashed ticks = limited or unknown evidence</span>
        </div>
      </Card>

      <Card padded={false}>
        <div className="p-6 pb-0">
          <CardHeader title="Variant calls" subtitle="Matched against the curated genomic knowledge base" />
        </div>
        <DataTable
          columns={[
            { key: "position", header: "Position", mono: true, render: (r) => `${r.chromosome}:${r.position.toLocaleString()}` },
            { key: "change", header: "Change", mono: true, render: (r) => `${r.ref} → ${r.alt}` },
            { key: "gene", header: "Gene", mono: true },
            { key: "consequence", header: "Consequence" },
            {
              key: "evidenceLevel",
              header: "Evidence",
              render: (r) => <RiskBadge label={evidenceTone[r.evidenceLevel]} size="sm" showIcon={false} />,
            },
          ]}
          rows={variants}
        />
      </Card>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
