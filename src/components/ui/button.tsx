import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "dark";
export type ButtonSize = "sm" | "md" | "action";

const variants: Record<ButtonVariant, string> = {
  /** Freitty red — main call to action. */
  primary: "bg-brand text-white hover:bg-brand-hover active:bg-brand-strong",
  /** White with a blue outline. */
  secondary: "border border-accent bg-surface text-navy hover:bg-accent-soft",
  ghost: "text-accent hover:bg-accent-soft",
  dark: "bg-ink text-white hover:bg-ink-soft",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-[26px] gap-1 px-2.5 text-xs",
  md: "h-9 gap-1.5 px-4 text-body",
  /** Compact toolbar buttons (order detail action bar). */
  action: "h-[34px] gap-1.5 px-3 text-xs",
};

/** Shared classes so links (`<a>`, `<Link>`) can look exactly like buttons. */
export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}): string {
  return cn(
    "inline-flex shrink-0 items-center justify-center rounded-md font-semibold whitespace-nowrap",
    "transition-colors duration-150 select-none",
    "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    "[&_svg]:size-3.5 [&_svg]:shrink-0",
    variants[variant],
    sizes[size],
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, className, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses({ variant, size, className })}
      {...props}
    />
  );
});
