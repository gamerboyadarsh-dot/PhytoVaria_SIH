import clsx from "clsx";

export default function Card({ className, padded = true, hover = false, glass = true, children, ...props }) {
  return (
    <div
      className={clsx(
        "animate-fade-in-up",
        glass ? "glass-panel" : "bg-surface border border-border rounded-card shadow-card",
        hover && "transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover active:scale-[0.99]",
        padded && "p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className }) {
  return (
    <div className={clsx("flex items-start justify-between gap-4 mb-5", className)}>
      <div>
        <h3 className="font-display font-semibold text-ink text-base">{title}</h3>
        {subtitle && <p className="text-sm text-ink-muted mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
