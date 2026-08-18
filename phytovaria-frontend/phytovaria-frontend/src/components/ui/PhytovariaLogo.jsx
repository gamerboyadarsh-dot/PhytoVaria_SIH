import clsx from "clsx";

/**
 * PhytoVaria custom SVG Logo.
 * Concept: A minimal abstract leaf constructed with a DNA double-helix motif.
 * Uses `currentColor` to dynamically adapt to light/dark theme backgrounds.
 * 
 * @param {string} variant - "full" (mark + wordmark) or "icon" (mark only)
 */
export default function PhytovariaLogo({ variant = "full", className, iconClassName, textClassName }) {
  return (
    <div className={clsx("flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={clsx("shrink-0", iconClassName)}
        style={{ width: "1em", height: "1em" }}
      >
        {/* Leaf outline bounding box */}
        <path
          d="M12 2C8 2 4 6 4 12C4 18 10 22 12 22C14 22 20 18 20 12C20 6 16 2 12 2Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-90"
        />
        {/* Internal DNA Helix rungs morphing into leaf veins */}
        <path
          d="M8 8C9.5 9 14.5 9 16 8M7 12C9.5 13 14.5 13 17 12M8 16C9.5 17 14.5 17 16 16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Helix backbone connecting the rungs */}
        <path
          d="M8 8C10 10 10 14 8 16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="opacity-60"
        />
        <path
          d="M16 8C14 10 14 14 16 16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="opacity-60"
        />
      </svg>
      {variant === "full" && (
        <span className={clsx("font-display font-semibold tracking-tight text-ink dark:text-white", textClassName)}>
          PhytoVaria
        </span>
      )}
    </div>
  );
}
