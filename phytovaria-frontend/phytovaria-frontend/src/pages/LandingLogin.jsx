import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dna, Leaf, ShieldCheck, Cpu } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import GenomicTrack from "../components/ui/GenomicTrack.jsx";

const heroVariants = [
  { id: "h1", position: 100, alt: "A", evidenceLevel: "curated" },
  { id: "h2", position: 340, alt: "T", evidenceLevel: "curated" },
  { id: "h3", position: 520, alt: "C", evidenceLevel: "limited" },
  { id: "h4", position: 610, alt: "G", evidenceLevel: "unknown" },
  { id: "h5", position: 780, alt: "A", evidenceLevel: "limited" },
  { id: "h6", position: 900, alt: "T", evidenceLevel: "curated" },
];

export default function LandingLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    setSubmitting(true);
    await login(username, password);
    setSubmitting(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-bg">
      {/* Left: brand / thesis panel */}
      <div className="hidden lg:flex flex-col justify-between bg-primary text-white p-12 relative overflow-hidden">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-md bg-white/15 flex items-center justify-center">
            <Dna size={18} strokeWidth={2.25} />
          </div>
          <span className="font-display font-semibold tracking-tight text-lg">PhytoVaria</span>
        </div>

        <div className="max-w-md">
          <p className="text-sm uppercase tracking-widest text-white/60 mb-4">Genomic Intelligence for Healthier Crops</p>
          <h1 className="font-display text-4xl font-semibold leading-tight">
            Read the genome. Understand the risk. Protect the harvest.
          </h1>
          <p className="text-white/70 mt-4 text-sm leading-relaxed">
            PhytoVaria turns raw plant genomic data into an explainable susceptibility
            assessment — cross-referenced against a curated knowledge base and live
            field conditions, not guesswork.
          </p>

          <div className="mt-8 bg-white/10 rounded-card p-4">
            <GenomicTrack variants={heroVariants} height={56} />
            <p className="text-[11px] text-white/50 mt-2">Sample variant track — chr06, Tomato Row A-3</p>
          </div>

          <ul className="mt-8 space-y-3 text-sm text-white/80">
            <li className="flex items-center gap-2"><Leaf size={15} /> Solanum lycopersicum, first crop supported</li>
            <li className="flex items-center gap-2"><ShieldCheck size={15} /> Evidence-graded, never guessed</li>
            <li className="flex items-center gap-2"><Cpu size={15} /> ESP32 environmental context, live or simulated</li>
          </ul>
        </div>

        <p className="text-xs text-white/40">Smart India Hackathon prototype — not a diagnostic product.</p>
      </div>

      {/* Right: auth form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <Dna size={16} className="text-white" />
            </div>
            <span className="font-display font-semibold text-ink">PhytoVaria</span>
          </div>

          <h2 className="font-display text-2xl font-semibold text-ink">Sign in</h2>
          <p className="text-sm text-ink-muted mt-1.5">
            Access your field's genomic and environmental dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium text-ink" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. field.researcher"
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full" loading={submitting} disabled={!username || !password}>
              Sign in
            </Button>

            <p className="text-xs text-ink-muted text-center pt-2">
              Prototype build — any credentials work until Member 2's auth endpoint is connected.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
