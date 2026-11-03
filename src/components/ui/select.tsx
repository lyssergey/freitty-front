"use client";

import { ChevronDown } from "lucide-react";
import { useId } from "react";
import { cn } from "./cn";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string> {
  /** Visible prefix and accessible name, e.g. "Hub" → "Hub: All". */
  label: string;
  value: T;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  /** Explains why the control is disabled (tooltip). */
  title?: string;
  className?: string;
}

/**
 * A native `<select>` (keyboard, mobile pickers and screen readers for free) styled as the
 * mockup's "Hub: All ▾" pill: the select is transparent and stretched over the whole pill, the
 * visible text is the prefix plus the selected option's label.
 */
export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
  title,
  className,
}: SelectProps<T>) {
  const id = useId();
  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <div
      title={title}
      className={cn(
        "relative inline-flex h-[30px] items-center gap-1 rounded-md border border-line-strong bg-surface pr-7 pl-2.5 text-xs",
        "transition-colors focus-within:border-accent hover:border-ink-faint",
        "has-[select:focus-visible]:outline-2 has-[select:focus-visible]:outline-offset-2 has-[select:focus-visible]:outline-accent",
        disabled && "cursor-not-allowed bg-surface-subtle opacity-60 hover:border-line-strong",
        className,
      )}
    >
      <span aria-hidden className="text-ink-muted">
        {label}:
      </span>
      <span aria-hidden className="font-semibold whitespace-nowrap text-ink">
        {selected?.label}
      </span>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-2 size-3.5 text-ink-muted"
      />
      <select
        id={id}
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as T)}
        className="absolute inset-0 size-full cursor-pointer appearance-none opacity-0 focus-visible:outline-none disabled:cursor-not-allowed"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
