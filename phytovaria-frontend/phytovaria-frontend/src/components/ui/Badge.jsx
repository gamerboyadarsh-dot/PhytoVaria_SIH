import clsx from "clsx";

const tones = {
  neutral: "bg-surface-alt text-ink-muted",
  primary: "bg-primary-light text-primary-dark",
  accent: "bg-accent-light text-accent",
};

export default function Badge({ tone = "neutral", children, className }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
