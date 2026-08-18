import clsx from "clsx";

export default function Card({ className, padded = true, hover = false, children, ...props }) {
  return (
    <div
      className={clsx(
        "bg-surface border border-border rounded-card shadow-card animate-fade-in-up",
        hover && "transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 hover:border-primary/20",
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
