import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Sprout, Dna, ShieldAlert, Thermometer, FileText } from "lucide-react";
import AppShell from "../components/layout/AppShell.jsx";
import Card, { CardHeader } from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import { LoadingState, ErrorState } from "../components/ui/States.jsx";
import { useApi } from "../api/useApi.js";

const statusLabel = { registered: "Registered", vcf_uploaded: "VCF Uploaded", analyzed: "Analyzed" };

const links = [
  { to: "/plants/upload", label: "Genomic Upload", icon: Sprout },
  { to: "/plants/analysis", label: "Genomic Analysis", icon: Dna },
  { to: "/plants/risk", label: "Disease Risk", icon: ShieldAlert },
  { to: "/plants/environment", label: "Environmental Monitoring", icon: Thermometer },
  { to: "/plants/report", label: "Health Report", icon: FileText },
];

export default function PlantProfile() {
  return (
    <AppShell title="Plant Profile">
      <ProfileBody />
    </AppShell>
  );
}

function ProfileBody() {
  const { plantId } = useParams();
  const api = useApi();
  const [plant, setPlant] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    api.getPlant(plantId).then(setPlant).catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantId]);

  if (error) return <ErrorState description={error} />;
  if (!plant) return <LoadingState label="Loading plant profile" />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="flex items-center gap-4">
        <div
          className="h-14 w-14 rounded-xl flex items-center justify-center text-white shrink-0"
          style={{ backgroundColor: plant.thumbnailColor }}
        >
          <Sprout size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl font-semibold text-ink truncate">{plant.name}</h2>
          <p className="text-sm text-ink-muted italic">{plant.species}</p>
        </div>
        <span className="text-xs font-medium text-ink-muted bg-surface-alt rounded-full px-3 py-1.5">
          {statusLabel[plant.status]}
        </span>
      </Card>

      <Card>
        <CardHeader title="Details" />
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <Detail label="Variety" value={plant.variety || "—"} />
          <Detail label="Location" value={plant.location || "—"} />
          <Detail label="Registered on" value={plant.registeredOn} />
          <Detail label="Plant ID" value={plant.id} mono />
        </dl>
      </Card>

      <Card>
        <CardHeader title="Continue workflow" />
        <div className="grid sm:grid-cols-2 gap-3">
          {links.map(({ to, label, icon: Icon }) => (
            <Button key={to} as={Link} to={to} variant="secondary" icon={Icon} className="justify-start">
              {label}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Detail({ label, value, mono }) {
  return (
    <div>
      <dt className="text-ink-muted text-xs uppercase tracking-wide">{label}</dt>
      <dd className={`text-ink mt-1 ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}
