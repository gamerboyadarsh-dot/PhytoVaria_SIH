import clsx from "clsx";

const variants = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  secondary: "bg-surface text-ink border border-border hover:bg-surface-alt",
  ghost: "bg-transparent text-ink-muted hover:bg-surface-alt hover:text-ink",
  danger: "bg-risk-high text-white hover:opacity-90",
};

const sizes = {
  sm: "text-sm px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
  lg: "text-base px-5 py-3 gap-2",
};

export default function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  icon: Icon,
  loading = false,
  className,
  children,
  disabled,
  ...props
}) {
  return (
    <Component
      className={clsx(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        Icon && <Icon size={16} strokeWidth={2} />
      )}
      {children}
    </Component>
  );
}
