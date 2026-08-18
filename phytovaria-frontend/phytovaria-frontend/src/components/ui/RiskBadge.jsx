import clsx from "clsx";
import { HelpCircle, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * Renders a susceptibility/risk label. "Unknown" is deliberately styled as
 * neutral gray with a dashed ring rather than any shade that reads as a
 * warning — per the project rule that variants without curated evidence
 * must never be presented as harmful.
 */
const config = {
  Low: { bg: "bg-risk-low-bg", fg: "text-risk-low", ring: "ring-risk-low/20", Icon: CheckCircle2 },
  Medium: { bg: "bg-risk-medium-bg", fg: "text-risk-medium", ring: "ring-risk-medium/20", Icon: AlertCircle },
  High: { bg: "bg-risk-high-bg", fg: "text-risk-high", ring: "ring-risk-high/20 animate-pulse-slow", Icon: AlertTriangle },
  Unknown: {
    bg: "bg-risk-unknown-bg",
    fg: "text-risk-unknown",
    ring: "ring-risk-unknown/30",
    Icon: HelpCircle,
    dashed: true,
  },
};

export default function RiskBadge({ label = "Unknown", size = "md", showIcon = true }) {
  const cfg = config[label] || config.Unknown;
  const { Icon } = cfg;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full font-medium ring-1",
        cfg.bg,
        cfg.fg,
        cfg.ring,
        cfg.dashed && "border border-dashed border-current/40",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
    >
      {showIcon && <Icon size={size === "sm" ? 12 : 14} strokeWidth={2.25} />}
      {label === "Unknown" ? "Unknown / Insufficient Evidence" : label}
    </span>
  );
}
