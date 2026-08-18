import clsx from "clsx";

export default function Card({ className, padded = true, hover = false, children, ...props }) {
  return (
    <div
      className={clsx(
        "bg-surface border border-border rounded-card shadow-card",
        hover && "transition-shadow duration-200 hover:shadow-card-hover",
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
