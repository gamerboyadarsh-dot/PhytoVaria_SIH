import { Dna, Inbox, AlertOctagon } from "lucide-react";
import Button from "./Button.jsx";

export function LoadingState({ label = "Loading" }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-ink-muted">
      <Dna size={28} className="animate-spin mb-3" style={{ animationDuration: "1.4s" }} />
      <p className="text-sm">{label}…</p>
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="h-12 w-12 rounded-full bg-surface-alt flex items-center justify-center text-ink-muted mb-4">
        <Icon size={22} strokeWidth={1.75} />
      </div>
      <p className="font-display font-semibold text-ink">{title}</p>
      {description && <p className="text-sm text-ink-muted mt-1.5 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", description, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="h-12 w-12 rounded-full bg-risk-high-bg flex items-center justify-center text-risk-high mb-4">
        <AlertOctagon size={22} strokeWidth={1.75} />
      </div>
      <p className="font-display font-semibold text-ink">{title}</p>
      {description && <p className="text-sm text-ink-muted mt-1.5 max-w-sm">{description}</p>}
      {onRetry && (
        <div className="mt-5">
          <Button size="sm" variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
