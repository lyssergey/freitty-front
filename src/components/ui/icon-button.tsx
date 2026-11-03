import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

export type IconButtonVariant = "soft" | "tiny" | "plain";

const variants: Record<IconButtonVariant, string> = {
  /** 36px grey square — topbar, page header. */
  soft: "size-9 rounded-lg bg-surface-muted text-ink-subtle hover:bg-line hover:text-ink [&_svg]:size-4",
  /** 22px — order card footer toolbar. */
  tiny: "size-[22px] rounded bg-surface-muted text-ink-subtle hover:bg-line hover:text-ink [&_svg]:size-3",
  /** Bare icon — table row actions (24px target that doesn't stretch a 20px text row). */
  plain:
    "-my-0.5 size-6 rounded text-ink-muted hover:bg-surface-sunken hover:text-ink-soft [&_svg]:size-3.5",
};

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name — icon buttons have no visible text. Also used as the tooltip. */
  label: string;
  variant?: IconButtonVariant;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, variant = "soft", className, type = "button", children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center transition-colors duration-150",
        "disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
