import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dna, Leaf, ShieldCheck, Cpu, ArrowRight } from "lucide-react";
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
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDemoAccess = async (route) => {
    setSubmitting(true);
    await login("DemoUser", "demo");
    setSubmitting(false);
    navigate(route);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface">
      {/* Left: brand / thesis panel */}
      <div className="flex flex-col justify-between bg-primary text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-16 lg:mb-0">
          <div className="h-9 w-9 rounded-md bg-white/15 flex items-center justify-center">
            <Dna size={18} strokeWidth={2.25} />
          </div>
          <span className="font-display font-semibold tracking-tight text-xl">PhytoVaria</span>
        </div>

        <div className="max-w-xl mx-auto lg:mx-0 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 mb-8">
            <Leaf size={14} className="text-accent" />
            <span className="text-xs font-semibold uppercase tracking-widest text-white/90">
              Plant Genomics • Variant Intelligence
            </span>
          </div>
          
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.1] mb-6">
            Genomic intelligence for healthier crops
          </h1>
          
          <p className="text-white/80 text-lg leading-relaxed mb-10 max-w-lg">
            PhytoVaria analyzes plant genomic variation, interprets relevant variants, 
            combines genomic and environmental evidence, and produces explainable 
            disease-susceptibility assessments.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
            <Button 
              className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 text-base px-8 py-3 h-auto shadow-lg shadow-black/10" 
              onClick={() => handleDemoAccess("/dashboard")}
              disabled={submitting}
            >
              Explore Demo <ArrowRight size={18} className="ml-2" />
            </Button>
            <Button 
              variant="secondary"
              className="w-full sm:w-auto bg-primary-dark hover:bg-primary-dark/80 text-white border border-white/20 text-base px-8 py-3 h-auto"
              onClick={() => handleDemoAccess("/plants/register")}
              disabled={submitting}
            >
              Register Plant
            </Button>
          </div>
        </div>

        <div className="mt-8 lg:mt-0 text-white/50 text-sm">
          <p>Genomics platform for research and assessment. Not a clinical diagnostic tool.</p>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[500px] h-[500px] bg-primary-dark rounded-full blur-[100px] opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[80px] pointer-events-none"></div>
      </div>

      {/* Right: visual showcase */}
      <div className="hidden lg:flex flex-col justify-center p-12 relative bg-bg overflow-hidden border-l border-border">
        <div className="w-full max-w-lg mx-auto relative z-10 space-y-6">
          
          {/* Feature Card 1 */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary-light flex items-center justify-center text-primary-dark">
                  <Dna size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-ink">Genomic Profiling</h3>
                  <p className="text-xs text-ink-muted">Chr06 variation track</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-surface-alt border border-border text-xs font-medium text-ink-muted">
                Analyzed
              </span>
            </div>
            <div className="bg-surface-alt rounded-xl p-4 border border-border">
              <GenomicTrack variants={heroVariants} height={48} />
            </div>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm transform translate-x-8 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                  <Cpu size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-ink">Environmental Context</h3>
                  <p className="text-xs text-ink-muted">Live sensor integration</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-alt rounded-lg p-3 border border-border">
                <p className="text-[10px] uppercase tracking-wider text-ink-muted mb-1">Temperature</p>
                <p className="font-semibold text-ink">24.5°C</p>
              </div>
              <div className="bg-surface-alt rounded-lg p-3 border border-border">
                <p className="text-[10px] uppercase tracking-wider text-ink-muted mb-1">Humidity</p>
                <p className="font-semibold text-ink">68%</p>
              </div>
            </div>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-ink mb-1">Explainable Risk</h3>
                <p className="text-sm text-ink-muted leading-snug">
                  Late Blight susceptibility: <strong>High</strong> (Variant H4 identified in high-humidity condition)
                </p>
              </div>
            </div>
          </div>

        </div>
        
        {/* Background decorative elements for right side */}
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-primary-light/30 rounded-full blur-[120px] pointer-events-none -mr-48"></div>
      </div>
    </div>
  );
}
