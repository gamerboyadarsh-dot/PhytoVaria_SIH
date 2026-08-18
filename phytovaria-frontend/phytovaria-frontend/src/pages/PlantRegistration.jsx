import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Sprout } from "lucide-react";
import AppShell from "../components/layout/AppShell.jsx";
import Card, { CardHeader } from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import { useApi } from "../api/useApi.js";
import { usePlantContext } from "../context/PlantContext.jsx";

const initialForm = {
  name: "",
  species: "Solanum lycopersicum",
  variety: "",
  location: "",
  notes: "",
};

export default function PlantRegistration() {
  return (
    <AppShell title="Register Plant">
      <RegistrationBody />
    </AppShell>
  );
}

function RegistrationBody() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const api = useApi();
  const { refreshPlants, setSelectedPlantId } = usePlantContext();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const plant = await api.registerPlant(form);
      await refreshPlants();
      setSelectedPlantId(plant.id);
      setSuccess(plant);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto">
        <Card className="text-center py-10">
          <div className="h-12 w-12 rounded-full bg-risk-low-bg text-risk-low flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={24} />
          </div>
          <h2 className="font-display text-xl font-semibold text-ink">{form.name} registered</h2>
          <p className="text-sm text-ink-muted mt-2">
            Next, upload its genomic data (VCF) to begin variant analysis.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Button variant="secondary" onClick={() => { setForm(initialForm); setSuccess(null); }}>
              Register another
            </Button>
            <Button onClick={() => navigate("/plants/upload")}>Upload genomic data</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader
          title="Plant details"
          subtitle="Register a new plant to begin its genomic assessment workflow"
        />
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Plant / row identifier" required>
              <input
                required
                value={form.name}
                onChange={update("name")}
                placeholder="e.g. Tomato Row A-3"
                className="input"
              />
            </Field>
            <Field label="Species">
              <input value={form.species} onChange={update("species")} className="input" disabled />
            </Field>
            <Field label="Variety">
              <input
                value={form.variety}
                onChange={update("variety")}
                placeholder="e.g. Pusa Ruby"
                className="input"
              />
            </Field>
            <Field label="Location / plot">
              <input
                value={form.location}
                onChange={update("location")}
                placeholder="e.g. Greenhouse 1"
                className="input"
              />
            </Field>
          </div>
          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={update("notes")}
              rows={3}
              placeholder="Optional field notes"
              className="input resize-none"
            />
          </Field>

          {error && <p className="text-sm text-risk-high">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="submit" icon={Sprout} loading={submitting} disabled={!form.name}>
              Register plant
            </Button>
          </div>
        </form>
      </Card>

      <style>{`
        .input {
          margin-top: 0;
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: var(--color-ink);
        }
        .input:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
        .input:disabled { color: var(--color-ink-muted); background: var(--color-surface-alt); }
      `}</style>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">
        {label} {required && <span className="text-risk-high">*</span>}
      </span>
      {children}
    </label>
  );
}
