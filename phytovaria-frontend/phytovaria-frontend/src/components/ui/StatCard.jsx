import Card from "./Card.jsx";
import clsx from "clsx";

export default function StatCard({ label, value, unit, icon: Icon, trend, tone = "primary" }) {
  return (
    <Card className="flex items-start justify-between">
      <div>
        <p className="text-sm text-ink-muted">{label}</p>
        <p className="font-display text-3xl font-semibold text-ink mt-2">
          {value}
          {unit && <span className="text-lg text-ink-muted ml-1">{unit}</span>}
        </p>
        {trend && (
          <p
            className={clsx(
              "text-xs mt-2 font-medium",
              trend.direction === "up" ? "text-risk-low" : "text-ink-muted"
            )}
          >
            {trend.label}
          </p>
        )}
      </div>
      {Icon && (
        <div
          className={clsx(
            "shrink-0 h-10 w-10 rounded-lg flex items-center justify-center",
            tone === "primary" ? "bg-primary-light text-primary-dark" : "bg-accent-light text-accent"
          )}
        >
          <Icon size={20} strokeWidth={2} />
        </div>
      )}
    </Card>
  );
}
