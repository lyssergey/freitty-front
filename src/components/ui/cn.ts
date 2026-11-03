import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge must know our custom theme scales (tokens.css), otherwise e.g. `text-2xs`
 * would be mistaken for a text colour and dropped next to `text-ink-muted`.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["micro", "3xs", "2xs", "body", "md", "title", "stat"],
      shadow: ["panel", "card-hover", "popover", "toast"],
      radius: ["card"],
      spacing: ["sidebar"],
    },
  },
});

/** Merge conditional class names, resolving Tailwind conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
