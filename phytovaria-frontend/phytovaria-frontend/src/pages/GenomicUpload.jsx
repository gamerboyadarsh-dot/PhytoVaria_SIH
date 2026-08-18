import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, FileCode2, CheckCircle2, Sprout } from "lucide-react";
import AppShell from "../components/layout/AppShell.jsx";
import Card, { CardHeader } from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import { EmptyState } from "../components/ui/States.jsx";
import { usePlantContext } from "../context/PlantContext.jsx";
import { useApi } from "../api/useApi.js";

export default function GenomicUpload() {
  return (
    <AppShell title="Genomic Data Upload">
      <UploadBody />
    </AppShell>
  );
}

function UploadBody() {
  const { plants, selectedPlant, selectedPlantId, refreshPlants } = usePlantContext();
  const api = useApi();
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | uploading | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  if (!plants.length) {
    return (
      <EmptyState
        icon={Sprout}
        title="Register a plant first"
        description="Genomic data uploads are tied to a specific registered plant."
        action={<Button onClick={() => navigate("/plants/register")}>Register a plant</Button>}
      />
    );
  }

  const onFile = (f) => {
    if (!f) return;
    if (!/\.vcf(\.gz)?$/i.test(f.name)) {
      setError("Please choose a .vcf or .vcf.gz file.");
      return;
    }
    setError(null);
    setFile(f);
    setStatus("idle");
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file || !selectedPlantId) return;
    setStatus("uploading");
    setError(null);
    try {
      const res = await api.uploadVcf(selectedPlantId, file);
      setResult(res);
      setStatus("done");
      await refreshPlants();
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader
          title="Upload genomic data"
          subtitle={selectedPlant ? `For ${selectedPlant.name}` : "Select a plant from the top bar"}
        />

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); onFile(e.dataTransfer.files?.[0]); }}
          onClick={() => inputRef.current?.click()}
          className={`rounded-lg border-2 border-dashed px-6 py-10 text-center cursor-pointer transition-colors ${
            dragging ? "border-accent bg-accent-light" : "border-border hover:bg-surface-alt"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".vcf,.vcf.gz"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          {!file ? (
            <>
              <UploadCloud size={26} className="mx-auto text-ink-muted mb-3" strokeWidth={1.75} />
              <p className="text-sm font-medium text-ink">Drop a VCF file here, or click to browse</p>
              <p className="text-xs text-ink-muted mt-1">Accepts .vcf or .vcf.gz</p>
            </>
          ) : (
            <>
              <FileCode2 size={26} className="mx-auto text-primary mb-3" strokeWidth={1.75} />
              <p className="text-sm font-medium text-ink">{file.name}</p>
              <p className="text-xs text-ink-muted mt-1">{(file.size / 1024).toFixed(1)} KB — click to replace</p>
            </>
          )}
        </div>

        {error && <p className="text-sm text-risk-high mt-3">{error}</p>}

        <div className="flex items-center justify-end gap-3 mt-5">
          <Button
            onClick={handleUpload}
            disabled={!file || !selectedPlantId}
            loading={status === "uploading"}
          >
            Upload &amp; parse variants
          </Button>
        </div>
      </Card>

      {status === "done" && result && (
        <Card className="border-risk-low/30">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="text-risk-low shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-ink">Upload complete</p>
              <p className="text-sm text-ink-muted mt-1">
                Parsed <strong>{result.variantCount}</strong> variant record(s) from{" "}
                <span className="font-mono text-xs">{result.filename}</span>.
              </p>
              <Button size="sm" className="mt-4" onClick={() => navigate("/plants/analysis")}>
                View genomic analysis
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
