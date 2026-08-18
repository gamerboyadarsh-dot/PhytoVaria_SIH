const baseColor = {
  A: "var(--color-base-a)",
  T: "var(--color-base-t)",
  C: "var(--color-base-c)",
  G: "var(--color-base-g)",
};

/**
 * Signature component: a horizontal chromosome track with tick marks for
 * each variant, styled after genome-browser tracks (e.g. IGV). Ticks are
 * colored by the alt allele base and dashed/faded for variants with no
 * curated evidence, so the visual itself communicates evidence strength
 * without needing a legend.
 *
 * variants: [{ id, position, alt, evidenceLevel }]
 */
export default function GenomicTrack({ variants = [], height = 64 }) {
  if (variants.length === 0) {
    return (
      <div
        className="w-full rounded-lg bg-surface-alt flex items-center justify-center text-xs text-ink-muted"
        style={{ height }}
      >
        No variants to display
      </div>
    );
  }

  const positions = variants.map((v) => v.position);
  const min = Math.min(...positions);
  const max = Math.max(...positions);
  const span = Math.max(max - min, 1);
  const width = 1000;
  const midY = height / 2;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }} role="img" aria-label="Genomic variant track">
      <line x1={0} y1={midY} x2={width} y2={midY} stroke="var(--color-border)" strokeWidth={2} />
      {variants.map((v) => {
        const x = ((v.position - min) / span) * (width - 40) + 20;
        const color = baseColor[v.alt] || "var(--color-risk-unknown)";
        const isUnknown = v.evidenceLevel === "unknown";
        return (
          <g key={v.id}>
            <line
              x1={x}
              y1={midY - (isUnknown ? 10 : 18)}
              x2={x}
              y2={midY + (isUnknown ? 10 : 18)}
              stroke={color}
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray={isUnknown ? "2 3" : undefined}
              opacity={v.evidenceLevel === "curated" ? 1 : v.evidenceLevel === "limited" ? 0.7 : 0.45}
            />
            <circle cx={x} cy={midY - (isUnknown ? 14 : 22)} r={3} fill={color} opacity={isUnknown ? 0.5 : 1} />
          </g>
        );
      })}
    </svg>
  );
}
